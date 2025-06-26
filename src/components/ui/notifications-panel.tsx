import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { 
  Bell, 
  Check, 
  X, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'message' | 'appointment' | 'task' | 'system' | 'mention' | 'invitation'
  title: string
  message: string
  sender?: {
    name: string
    avatar?: string
  }
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
}

export function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: NotificationsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  
  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent').length

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'urgent':
        return notification.priority === 'urgent'
      default:
        return true
    }
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'appointment':
        return <Calendar className="h-4 w-4" />
      case 'task':
        return <CheckCircle className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      case 'mention':
        return <MessageSquare className="h-4 w-4" />
      case 'invitation':
        return <UserPlus className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-500 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-blue-500 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
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
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Não lidas ({unreadCount})
              </Button>
              <Button
                variant={filter === 'urgent' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilter('urgent')}
              >
                Urgentes ({urgentCount})
              </Button>
            </div>

            {/* Ações */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="mt-2 w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto h-full">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar ou ícone */}
                      <div className="flex-shrink-0">
                        {notification.sender?.avatar ? (
                          <Avatar
                            src={notification.sender.avatar}
                            alt={notification.sender.name}
                            fallback={notification.sender.name.charAt(0)}
                            className="h-8 w-8"
                          />
                        ) : (
                          <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {notification.priority === 'urgent' && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        {notification.sender && (
                          <p className="text-xs text-muted-foreground mb-2">
                            De: {notification.sender.name}
                          </p>
                        )}

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          
                          {notification.actionUrl && (
                            <Button variant="outline" size="sm">
                              Ver detalhes
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Mock data para demonstração
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment' as const,
    title: 'Consulta agendada',
    message: 'Nova consulta agendada para amanhã às 14h com Maria Silva',
    sender: {
      name: 'Dr. João Santos'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    priority: 'high' as const,
    actionUrl: '/calendar'
  },
  {
    id: '2',
    type: 'mention' as const,
    title: 'Você foi mencionado',
    message: 'Ana Costa te mencionou em um comentário no protocolo de reabilitação',
    sender: {
      name: 'Ana Costa'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    priority: 'medium' as const,
    actionUrl: '/notebooks'
  },
  {
    id: '3',
    type: 'task' as const,
    title: 'Tarefa concluída',
    message: 'Avaliação do estagiário Pedro foi marcada como concluída',
    sender: {
      name: 'Sistema'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
    priority: 'low' as const,
    actionUrl: '/projects'
  },
  {
    id: '4',
    type: 'system',
    title: 'Backup concluído',
    message: 'Backup automático dos dados foi realizado com sucesso',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
    read: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'invitation',
    title: 'Novo membro na equipe',
    message: 'Carlos Oliveira foi adicionado como estagiário na equipe',
    sender: {
      name: 'Dr. Maria Fernanda',
      avatar: undefined
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
    read: false,
    priority: 'urgent',
    actionUrl: '/team'
  }
] 