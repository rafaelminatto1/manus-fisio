'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'system'
  read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateNotificationData {
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'system'
  action_url?: string
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  calendar_reminders: boolean
  project_updates: boolean
  team_mentions: boolean
  system_alerts: boolean
  reminder_time: number // minutos antes do evento
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

// Hook para buscar notificações do usuário
export function useNotifications() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 segundos
  })
}

// Hook para buscar notificações não lidas
export function useUnreadNotifications() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!user,
    staleTime: 1000 * 10, // 10 segundos
  })
}

// Hook para marcar notificação como lida
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single()

      if (error) throw error
      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

// Hook para marcar todas as notificações como lidas
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
      toast.success('Todas as notificações foram marcadas como lidas')
    },
  })
}

// Hook para deletar notificação
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
      toast.success('Notificação excluída')
    },
  })
}

// Hook para criar notificação
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationData: CreateNotificationData) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) throw error
      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
    },
  })
}

// Hook para configurações de notificação
export function useNotificationSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Se não existe configuração, criar uma padrão
        if (error.code === 'PGRST116') {
          const defaultSettings = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            calendar_reminders: true,
            project_updates: true,
            team_mentions: true,
            system_alerts: true,
            reminder_time: 15, // 15 minutos antes
          }

          const { data: newData, error: createError } = await supabase
            .from('notification_settings')
            .insert(defaultSettings)
            .select()
            .single()

          if (createError) throw createError
          return newData as NotificationSettings
        }
        throw error
      }

      return data as NotificationSettings
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para atualizar configurações de notificação
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as NotificationSettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      toast.success('Configurações de notificação atualizadas')
    },
  })
}

// Hook para notificações em tempo real
export function useRealtimeNotifications() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  React.useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { eventType: string; new: Notification; old?: Notification }) => {
          console.log('Notification change:', payload)
          
          // Invalidar queries para atualizar a UI
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })

          // Mostrar toast para novas notificações
          if (payload.eventType === 'INSERT') {
            const notification = payload.new as Notification
            showNotificationToast(notification)
            
            // Tentar mostrar push notification
            if ('Notification' in window && Notification.permission === 'granted') {
              showPushNotification(notification)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}

// Função auxiliar para mostrar toast de notificação
function showNotificationToast(notification: Notification) {
  const toastConfig = {
    duration: 5000,
    action: notification.action_url
      ? {
          label: 'Ver',
          onClick: () => {
            if (notification.action_url) {
              window.location.href = notification.action_url
            }
          },
        }
      : undefined,
  }

  switch (notification.type) {
    case 'success':
      toast.success(notification.title, {
        description: notification.message,
        ...toastConfig,
      })
      break
    case 'error':
      toast.error(notification.title, {
        description: notification.message,
        ...toastConfig,
      })
      break
    case 'warning':
      toast.warning(notification.title, {
        description: notification.message,
        ...toastConfig,
      })
      break
    default:
      toast(notification.title, {
        description: notification.message,
        ...toastConfig,
      })
  }
}

// Função auxiliar para mostrar push notification
function showPushNotification(notification: Notification) {
  try {
    const pushNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: notification.id,
      requireInteraction: notification.type === 'error' || notification.type === 'warning',
      data: {
        url: notification.action_url,
        notificationId: notification.id,
      },
    })

    pushNotification.onclick = () => {
      if (notification.action_url) {
        window.focus()
        window.location.href = notification.action_url
      }
      pushNotification.close()
    }
  } catch (error) {
    console.error('Erro ao mostrar push notification:', error)
  }
}

// Hook para gerenciar permissões de push notification
export function usePushNotificationPermission() {
  const [permission, setPermission] = React.useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  )

  const requestPermission = React.useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações push')
      return false
    }

    if (permission === 'granted') {
      return true
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast.success('Permissão para notificações concedida!')
        return true
      } else {
        toast.warning('Permissão para notificações negada')
        return false
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      toast.error('Erro ao solicitar permissão para notificações')
      return false
    }
  }, [permission])

  return {
    permission,
    requestPermission,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  }
}

// Hook para estatísticas de notificações
export function useNotificationStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notification-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('type, read, created_at')
        .eq('user_id', user.id)

      if (error) throw error

      const total = data.length
      const unread = data.filter((n: Notification) => !n.read).length
      const today = data.filter((n: Notification) => 
        new Date(n.created_at).toDateString() === new Date().toDateString()
      ).length
      const thisWeek = data.filter((n: Notification) => {
        const notificationDate = new Date(n.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return notificationDate >= weekAgo
      }).length

      const byType = data.reduce((acc: Record<string, number>, notification: Notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1
        return acc
      }, {})

      return {
        total,
        unread,
        today,
        thisWeek,
        byType
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// Função para configurar push notifications service worker
export function setupPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  }
}

// Hook para notificações inteligentes baseadas em contexto
export function useSmartNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const createSmartNotification = async (context: {
    type: 'appointment_reminder' | 'task_deadline' | 'supervision_due' | 'achievement'
    data: any
  }) => {
    if (!user) return

    let title = ''
    let message = ''
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'

    switch (context.type) {
      case 'appointment_reminder':
        title = '🏥 Consulta em 15 minutos'
        message = `${context.data.patient_name} - ${context.data.time}`
        priority = 'high'
        break
      case 'task_deadline':
        title = '⏰ Tarefa com prazo hoje'
        message = `${context.data.task_name} precisa ser concluída`
        priority = 'urgent'
        break
      case 'supervision_due':
        title = '👩‍🎓 Supervisão necessária'
        message = `${context.data.intern_name} completou ${context.data.hours}h`
        priority = 'high'
        break
      case 'achievement':
        title = '🎉 Marco alcançado!'
        message = `${context.data.achievement} - Parabéns!`
        priority = 'medium'
        break
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message,
        type: context.type,
        priority,
        metadata: context.data
      })
      .select()
      .single()

    if (error) throw error

    // Mostrar push notification se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `${context.type}-${Date.now()}`,
        requireInteraction: priority === 'urgent'
      })
    }

    return data
  }

  return {
    createSmartNotification
  }
}

// Hook para configurações avançadas de notificação
export function useAdvancedNotificationSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['advanced-notification-settings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      // Se não existe, criar configuração padrão
      if (error?.code === 'PGRST116') {
        const defaultSettings = {
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          calendar_reminders: true,
          project_updates: true,
          team_mentions: true,
          system_alerts: true,
          reminder_time: 15,
          quiet_hours_start: '22:00',
          quiet_hours_end: '07:00',
          ai_suggestions: true,
          smart_scheduling: true,
          priority_filter: 'medium'
        }

        const { data: newData, error: createError } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (createError) throw createError
        return newData
      }

      return data
    },
    enabled: !!user,
  })
} 