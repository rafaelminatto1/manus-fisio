'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient, isMockMode } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'
import { 
  Bell, 
  X, 
  Calendar, 
  Users, 
  FolderKanban, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  BookOpen,
  Stethoscope,
  GraduationCap,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'appointment' | 'supervision' | 'task' | 'system' | 'mentorship' | 'urgent' | 'reminder'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

interface SmartNotificationsProps {
  showAll?: boolean
  maxVisible?: number
  className?: string
}

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'supervision',
    title: 'Supervisão Agendada',
    message: 'Supervisão com Maria Silva agendada para hoje às 14:00',
    priority: 'high',
    read: false,
    created_at: new Date().toISOString(),
    action_url: '/calendar',
    metadata: { intern_name: 'Maria Silva', time: '14:00' }
  },
  {
    id: '2',
    type: 'task',
    title: 'Tarefa Atrasada',
    message: 'Protocolo de exercícios está 2 dias atrasado',
    priority: 'urgent',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    action_url: '/projects',
    metadata: { project_name: 'Protocolo COVID-19', days_overdue: 2 }
  },
  {
    id: '3',
    type: 'mentorship',
    title: 'Avaliação Pendente',
    message: 'Pedro Alves completou 350h - Avaliação necessária',
    priority: 'medium',
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    action_url: '/team',
    metadata: { intern_name: 'Pedro Alves', hours_completed: 350 }
  },
  {
    id: '4',
    type: 'appointment',
    title: 'Nova Consulta',
    message: 'João Silva agendou consulta para amanhã',
    priority: 'medium',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    action_url: '/calendar',
    metadata: { patient_name: 'João Silva' }
  },
  {
    id: '5',
    type: 'system',
    title: 'Backup Concluído',
    message: 'Backup automático dos dados foi realizado com sucesso',
    priority: 'low',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    metadata: { backup_size: '2.3GB' }
  }
]

export function SmartNotifications({ 
  showAll = false, 
  maxVisible = 5, 
  className = '' 
}: SmartNotificationsProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()
  const isUsingMock = isMockMode()

  useEffect(() => {
    if (!isUsingMock && user) {
      loadNotifications()
      subscribeToNotifications()
    } else {
      setNotifications(mockNotifications)
    }
  }, [user, isUsingMock])

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const loadNotifications = async () => {
    if (isUsingMock) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(showAll ? 100 : maxVisible)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = useCallback(() => {
    if (isUsingMock || !user) return

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          
          // Mostrar notificação do browser se permitido
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, isUsingMock])

  const markAsRead = async (notificationId: string) => {
    // Atualizar estado local imediatamente
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )

    if (!isUsingMock) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    }
  }

  const markAllAsRead = async () => {
    // Atualizar estado local imediatamente
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    if (!isUsingMock) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user?.id)
          .eq('read', false)
      } catch (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error)
      }
    }
  }

  const deleteNotification = async (notificationId: string) => {
    // Atualizar estado local imediatamente
    setNotifications(prev => prev.filter(n => n.id !== notificationId))

    if (!isUsingMock) {
      try {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
      } catch (error) {
        console.error('Erro ao deletar notificação:', error)
      }
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'supervision':
        return <GraduationCap className="h-4 w-4" />
      case 'task':
        return <FolderKanban className="h-4 w-4" />
      case 'mentorship':
        return <Users className="h-4 w-4" />
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />
      case 'reminder':
        return <Clock className="h-4 w-4" />
      case 'system':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-blue-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const visibleNotifications = showAll 
    ? notifications 
    : notifications.slice(0, maxVisible)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <CardDescription>
          Notificações inteligentes para fisioterapia
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {visibleNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-background border-border opacity-60' 
                    : 'bg-muted border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full text-white ${getPriorityColor(notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), 'PPp', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!showAll && notifications.length > maxVisible && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Ver todas ({notifications.length - maxVisible} mais)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook para gerenciar notificações
export function useSmartNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Mostrar notificação do browser se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    requestNotificationPermission,
    setNotifications
  }
} 