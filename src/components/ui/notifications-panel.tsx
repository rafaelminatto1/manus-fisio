'use client'

import React, { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Filter,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Users,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useNotifications,
  useUnreadNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useRealtimeNotifications,
  useNotificationStats,
  Notification,
} from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

interface NotificationsPanelProps {
  className?: string
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string[]>([])

  // Hooks
  const { data: notifications = [] } = useNotifications()
  const { data: unreadNotifications = [] } = useUnreadNotifications()
  const { data: stats } = useNotificationStats()
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  // Ativar notificações em tempo real
  useRealtimeNotifications()

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por status
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false

    // Filtro por tipo
    if (typeFilter.length > 0 && !typeFilter.includes(notification.type)) return false

    return true
  })

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId)
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId)
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    if (notification.action_url) {
      window.location.href = notification.action_url
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'system':
        return <Monitor className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    const labels = {
      info: 'Informação',
      success: 'Sucesso',
      warning: 'Aviso',
      error: 'Erro',
      event: 'Evento',
      system: 'Sistema',
    }
    return labels[type as keyof typeof labels] || type
  }

  const unreadCount = unreadNotifications.length

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-96 p-0"
          align="end"
          sideOffset={8}
        >
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <h3 className="font-semibold">Notificações</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">
                      {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsReadMutation.isPending}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* TODO: Abrir configurações */}}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    Todas ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Não lidas ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    Lidas ({notifications.length - unreadCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Lista de notificações */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    {filter === 'unread'
                      ? 'Nenhuma notificação não lida'
                      : filter === 'read'
                      ? 'Nenhuma notificação lida'
                      : 'Nenhuma notificação'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer com estatísticas */}
            {stats && (
              <div className="p-3 border-t bg-muted/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total: {stats.total}</span>
                  <span>Hoje: {stats.today}</span>
                  <span>Esta semana: {stats.thisWeek}</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClick: (notification: Notification) => void
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'system':
        return <Monitor className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div
      className={cn(
        'p-3 hover:bg-muted/50 cursor-pointer transition-colors relative group',
        !notification.read && 'bg-blue-50/50 border-l-2 border-l-blue-500'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                !notification.read && 'font-semibold'
              )}>
                {notification.title}
              </p>
              
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {notification.type === 'info' && 'Informação'}
                  {notification.type === 'success' && 'Sucesso'}
                  {notification.type === 'warning' && 'Aviso'}
                  {notification.type === 'error' && 'Erro'}
                  {notification.type === 'event' && 'Evento'}
                  {notification.type === 'system' && 'Sistema'}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            {/* Indicador de não lida */}
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
        </div>
      </div>

      {/* Ações (visíveis no hover) */}
      {showActions && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification.id)
              }}
              title="Marcar como lida"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
} 