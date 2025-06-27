'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns'

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  completedProjects: number
  totalNotebooks: number
  totalEvents: number
  totalNotifications: number
  unreadNotifications: number
}

export interface TeamMetrics {
  totalMembers: number
  mentors: number
  interns: number
  activeMentorships: number
  averageHoursPerMentorship: number
  completionRate: number
}

export interface ProjectAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  onHoldProjects: number
  cancelledProjects: number
  averageCompletionTime: number
  projectsByPriority: Record<string, number>
  projectsByStatus: Record<string, number>
}

export interface ActivityData {
  date: string
  notebooks: number
  projects: number
  events: number
  notifications: number
  total: number
}

export interface UserActivity {
  userId: string
  userName: string
  role: string
  lastActive: string
  notebooksCreated: number
  projectsCreated: number
  eventsCreated: number
  tasksCompleted: number
  activityScore: number
}

// Hook para métricas gerais do sistema
export function useSystemMetrics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['system-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      // Buscar dados em paralelo
      const [
        usersResult,
        projectsResult,
        notebooksResult,
        eventsResult,
        notificationsResult
      ] = await Promise.all([
        supabase.from('users').select('id, created_at'),
        supabase.from('projects').select('id, status, created_at'),
        supabase.from('notebooks').select('id, created_at'),
        supabase.from('calendar_events').select('id, created_at'),
        supabase.from('notifications').select('id, read, created_at').eq('user_id', user.id)
      ])

      // Calcular métricas
      const totalUsers = usersResult.data?.length || 0
      const activeUsers = Math.floor(totalUsers * 0.7) // Simulação - 70% dos usuários ativos
      const totalProjects = projectsResult.data?.length || 0
      const completedProjects = projectsResult.data?.filter(p => p.status === 'completed').length || 0
      const totalNotebooks = notebooksResult.data?.length || 0
      const totalEvents = eventsResult.data?.length || 0
      const totalNotifications = notificationsResult.data?.length || 0
      const unreadNotifications = notificationsResult.data?.filter(n => !n.read).length || 0

      return {
        totalUsers,
        activeUsers,
        totalProjects,
        completedProjects,
        totalNotebooks,
        totalEvents,
        totalNotifications,
        unreadNotifications,
      } as SystemMetrics
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // ✅ OTIMIZAÇÃO: Aumentado de 5 para 15 minutos
  })
}

// Hook para métricas da equipe
export function useTeamMetrics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['team-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data: users } = await supabase.from('users').select('id, role')

      const usersData = users || []
      const totalMembers = usersData.length
      const mentors = usersData.filter(u => u.role === 'mentor').length
      const interns = usersData.filter(u => u.role === 'intern').length
      
      // Simulação de dados de mentoria
      const activeMentorships = Math.floor(mentors * 2.5) // Cada mentor tem ~2-3 mentorias
      const averageHoursPerMentorship = 15.5
      const completionRate = 78.5

      return {
        totalMembers,
        mentors,
        interns,
        activeMentorships,
        averageHoursPerMentorship,
        completionRate,
      } as TeamMetrics
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 20, // ✅ OTIMIZAÇÃO: Aumentado de 10 para 20 minutos
  })
}

// Hook para analytics de projetos
export function useProjectAnalytics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['project-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, priority, created_at, due_date, progress')

      if (!projects) throw new Error('Failed to fetch projects')

      const totalProjects = projects.length
      const activeProjects = projects.filter(p => p.status === 'active').length
      const completedProjects = projects.filter(p => p.status === 'completed').length
      const onHoldProjects = projects.filter(p => p.status === 'on_hold').length
      const cancelledProjects = projects.filter(p => p.status === 'cancelled').length

      // Calcular tempo médio de conclusão (simulado)
      const averageCompletionTime = 18.5 // dias

      // Agrupar por prioridade
      const projectsByPriority = projects.reduce((acc, p) => {
        acc[p.priority || 'medium'] = (acc[p.priority || 'medium'] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Agrupar por status
      const projectsByStatus = projects.reduce((acc, p) => {
        acc[p.status || 'planning'] = (acc[p.status || 'planning'] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        cancelledProjects,
        averageCompletionTime,
        projectsByPriority,
        projectsByStatus,
      } as ProjectAnalytics
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // ✅ OTIMIZAÇÃO: Aumentado de 5 para 15 minutos
  })
}

// Hook para dados de atividade temporal
export function useActivityData(period: 'week' | 'month' = 'week') {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['activity-data', period, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const now = new Date()
      const startDate = period === 'week' ? startOfWeek(now) : startOfMonth(now)
      const endDate = period === 'week' ? endOfWeek(now) : endOfMonth(now)

      const [notebooksResult, projectsResult, eventsResult, notificationsResult] = await Promise.all([
        supabase
          .from('notebooks')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('projects')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('calendar_events')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('notifications')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ])

      // Criar array de datas
      const days = []
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        days.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Agrupar dados por dia
      const activityData: ActivityData[] = days.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayStart = new Date(date)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const notebooks = (notebooksResult.data || []).filter(n => {
          const created = new Date(n.created_at)
          return created >= dayStart && created <= dayEnd
        }).length

        const projects = (projectsResult.data || []).filter(p => {
          const created = new Date(p.created_at)
          return created >= dayStart && created <= dayEnd
        }).length

        const events = (eventsResult.data || []).filter(e => {
          const created = new Date(e.created_at)
          return created >= dayStart && created <= dayEnd
        }).length

        const notifications = (notificationsResult.data || []).filter(n => {
          const created = new Date(n.created_at)
          return created >= dayStart && created <= dayEnd
        }).length

        return {
          date: dateStr,
          notebooks,
          projects,
          events,
          notifications,
          total: notebooks + projects + events + notifications,
        }
      })

      return activityData
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para atividade dos usuários
export function useUserActivity() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-activity', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const [usersResult, notebooksResult, projectsResult, eventsResult] = await Promise.all([
        supabase.from('users').select('id, full_name, role, created_at'),
        supabase.from('notebooks').select('created_by, created_at').gte('created_at', subDays(new Date(), 30).toISOString()),
        supabase.from('projects').select('created_by, created_at').gte('created_at', subDays(new Date(), 30).toISOString()),
        supabase.from('calendar_events').select('created_by, created_at').gte('created_at', subDays(new Date(), 30).toISOString())
      ])

      const users = usersResult.data || []
      const notebooks = notebooksResult.data || []
      const projects = projectsResult.data || []
      const events = eventsResult.data || []

      const userActivity: UserActivity[] = users.map(userData => {
        const userNotebooks = notebooks.filter(n => n.created_by === userData.id)
        const userProjects = projects.filter(p => p.created_by === userData.id)
        const userEvents = events.filter(e => e.created_by === userData.id)

        const activityScore = userNotebooks.length * 2 + userProjects.length * 5 + userEvents.length * 1

        return {
          userId: userData.id,
          userName: userData.full_name || 'Usuário',
          role: userData.role || 'guest',
          lastActive: userData.created_at || '',
          notebooksCreated: userNotebooks.length,
          projectsCreated: userProjects.length,
          eventsCreated: userEvents.length,
          tasksCompleted: Math.floor(Math.random() * 20), // Simulado
          activityScore: Math.round(activityScore),
        }
      })

      return userActivity.sort((a, b) => b.activityScore - a.activityScore)
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 20, // ✅ OTIMIZAÇÃO: Aumentado de 10 para 20 minutos
  })
}

// Hook para comparação de períodos
export function usePeriodComparison(period: 'week' | 'month' = 'week') {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['period-comparison', period, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      const now = new Date()
      let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date

      if (period === 'week') {
        currentStart = startOfWeek(now)
        currentEnd = endOfWeek(now)
        previousStart = startOfWeek(subDays(now, 7))
        previousEnd = endOfWeek(subDays(now, 7))
      } else {
        currentStart = startOfMonth(now)
        currentEnd = endOfMonth(now)
        previousStart = startOfMonth(subDays(now, 30))
        previousEnd = endOfMonth(subDays(now, 30))
      }

      // Buscar dados dos dois períodos
      const [currentNotebooks, previousNotebooks, currentProjects, previousProjects] = await Promise.all([
        supabase.from('notebooks').select('id').gte('created_at', currentStart.toISOString()).lte('created_at', currentEnd.toISOString()),
        supabase.from('notebooks').select('id').gte('created_at', previousStart.toISOString()).lte('created_at', previousEnd.toISOString()),
        supabase.from('projects').select('id').gte('created_at', currentStart.toISOString()).lte('created_at', currentEnd.toISOString()),
        supabase.from('projects').select('id').gte('created_at', previousStart.toISOString()).lte('created_at', previousEnd.toISOString())
      ])

      const currentNotebooksCount = currentNotebooks.data?.length || 0
      const previousNotebooksCount = previousNotebooks.data?.length || 0
      const currentProjectsCount = currentProjects.data?.length || 0
      const previousProjectsCount = previousProjects.data?.length || 0

      const notebooksChange = previousNotebooksCount > 0
        ? ((currentNotebooksCount - previousNotebooksCount) / previousNotebooksCount) * 100
        : currentNotebooksCount > 0 ? 100 : 0

      const projectsChange = previousProjectsCount > 0
        ? ((currentProjectsCount - previousProjectsCount) / previousProjectsCount) * 100
        : currentProjectsCount > 0 ? 100 : 0

      return {
        current: {
          notebooks: currentNotebooksCount,
          projects: currentProjectsCount,
        },
        previous: {
          notebooks: previousNotebooksCount,
          projects: previousProjectsCount,
        },
        changes: {
          notebooks: notebooksChange,
          projects: projectsChange,
        },
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // ✅ OTIMIZAÇÃO: Aumentado de 15 para 30 minutos
  })
} 