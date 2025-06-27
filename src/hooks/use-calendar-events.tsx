'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  event_type: 'appointment' | 'supervision' | 'meeting' | 'break'
  location?: string
  attendees: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateEventData {
  title: string
  description?: string
  start_time: string
  end_time: string
  event_type: 'appointment' | 'supervision' | 'meeting' | 'break'
  location?: string
  attendees?: string[]
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string
}

// Hook para buscar eventos
export function useCalendarEvents() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['calendar-events', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`created_by.eq.${user.id},attendees.cs.{${user.id}}`)
        .order('start_time', { ascending: true })

      if (error) throw error
      return data as CalendarEvent[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar eventos de um período específico
export function useCalendarEventsByRange(startDate: Date, endDate: Date) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['calendar-events-range', user?.id, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`created_by.eq.${user.id},attendees.cs.{${user.id}}`)
        .gte('start_time', startDate.toISOString())
        .lte('end_time', endDate.toISOString())
        .order('start_time', { ascending: true })

      if (error) throw error
      return data as CalendarEvent[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

// Hook para criar evento
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          created_by: user.id,
          attendees: eventData.attendees || [],
        })
        .select()
        .single()

      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: (newEvent) => {
      // Invalidar cache dos eventos
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      
      // Criar notificação para participantes
      if (newEvent.attendees.length > 0) {
        createEventNotifications(newEvent)
      }
      
      toast.success('Evento criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao criar evento. Tente novamente.')
    },
  })
}

// Hook para atualizar evento
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: UpdateEventData) => {
      const { id, ...updateData } = eventData

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as CalendarEvent
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar evento:', error)
      toast.error('Erro ao atualizar evento. Tente novamente.')
    },
  })
}

// Hook para deletar evento
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      return eventId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Evento excluído com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao excluir evento:', error)
      toast.error('Erro ao excluir evento. Tente novamente.')
    },
  })
}

// Hook para buscar usuários para participantes
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url, role')
        .order('full_name', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

// Função auxiliar para criar notificações de evento
async function createEventNotifications(event: CalendarEvent) {
  try {
    const notifications = event.attendees.map(attendeeId => ({
      user_id: attendeeId,
      title: 'Novo evento agendado',
      message: `Você foi convidado para: ${event.title}`,
      type: 'info' as const,
      action_url: `/calendar?event=${event.id}`,
    }))

    await supabase
      .from('notifications')
      .insert(notifications)
  } catch (error) {
    console.error('Erro ao criar notificações:', error)
  }
}

// Hook para eventos em tempo real
export function useRealtimeEvents() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  React.useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('calendar_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
        },
        (payload) => {
          console.log('Calendar event change:', payload)
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}

// Hook para estatísticas de eventos
export function useEventStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['event-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('calendar_events')
        .select('event_type, start_time, end_time')
        .or(`created_by.eq.${user.id},attendees.cs.{${user.id}}`)
        .gte('start_time', startOfMonth.toISOString())
        .lte('end_time', endOfMonth.toISOString())

      if (error) throw error

      const stats = {
        total: data.length,
        byType: data.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        thisWeek: data.filter(event => {
          const eventDate = new Date(event.start_time)
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return eventDate >= weekStart && eventDate <= weekEnd
        }).length,
      }

      return stats
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
} 