import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  FileText,
  Zap,
  Brain,
  Filter,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'

interface SmartNotification {
  id: string
  title: string
  message: string
  type: 'urgent' | 'important' | 'info' | 'success'
  category: 'system' | 'mentorship' | 'deadline' | 'collaboration' | 'ai'
  timestamp: Date
  read: boolean
  priority: number
  aiSuggestion?: string
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'outline' | 'destructive'
  }>
}

interface SmartNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

export function SmartNotifications({ isOpen, onClose }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      title: 'Supervisão Urgente Pendente',
      message: 'João Silva precisa de supervisão para o protocolo de TMJ. Prazo: hoje 16:00',
      type: 'urgent',
      category: 'mentorship',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      read: false,
      priority: 10,
      aiSuggestion: 'Recomendo reagendar para amanhã 14:00 baseado na disponibilidade',
      actions: [
        { label: 'Agendar Agora', action: 'schedule', variant: 'default' },
        { label: 'Reagendar', action: 'reschedule', variant: 'outline' }
      ]
    },
    {
      id: '2',
      title: 'IA: Padrão Detectado',
      message: 'Identifiquei que 3 estagiários têm dificuldades similares em avaliação postural',
      type: 'important',
      category: 'ai',
      timestamp: new Date(Date.now() - 3600000), // 1h ago
      read: false,
      priority: 8,
      aiSuggestion: 'Sugiro criar um workshop sobre avaliação postural para a equipe',
      actions: [
        { label: 'Criar Workshop', action: 'create-workshop', variant: 'default' },
        { label: 'Ver Detalhes', action: 'view-details', variant: 'outline' }
      ]
    },
    {
      id: '3',
      title: 'Relatório LGPD Disponível',
      message: 'Relatório mensal de conformidade LGPD foi gerado automaticamente',
      type: 'info',
      category: 'system',
      timestamp: new Date(Date.now() - 7200000), // 2h ago
      read: false,
      priority: 5,
      actions: [
        { label: 'Visualizar', action: 'view-report', variant: 'outline' }
      ]
    },
    {
      id: '4',
      title: 'Meta de Produtividade Atingida',
      message: 'Parabéns! A equipe atingiu 95% da meta mensal de produtividade',
      type: 'success',
      category: 'system',
      timestamp: new Date(Date.now() - 10800000), // 3h ago
      read: true,
      priority: 3
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        addRandomNotification()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const addRandomNotification = () => {
    const randomNotifications = [
      {
        title: 'Nova Colaboração',
        message: 'Ana Silva comentou no seu protocolo de reabilitação',
        type: 'info' as const,
        category: 'collaboration' as const,
        priority: 6
      },
      {
        title: 'Lembrete de Prazo',
        message: 'Relatório de supervisão de Maria Costa vence em 2 dias',
        type: 'important' as const,
        category: 'deadline' as const,
        priority: 7
      },
      {
        title: 'IA: Sugestão de Melhoria',
        message: 'Detectei oportunidade de otimização no protocolo de joelho',
        type: 'info' as const,
        category: 'ai' as const,
        priority: 6,
        aiSuggestion: 'Baseado nos dados, sugiro adicionar exercícios de propriocepção'
      }
    ]

    const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)]
    
    const newNotification: SmartNotification = {
      id: Date.now().toString(),
      ...randomNotif,
      timestamp: new Date(),
      read: false,
      actions: [
        { label: 'Ver Detalhes', action: 'view', variant: 'outline' }
      ]
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 10))
    
    if (soundEnabled) {
      // Play notification sound (simplified)
      console.log('🔔 Nova notificação!')
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleAction = (notificationId: string, action: string) => {
    console.log(`Action: ${action} for notification: ${notificationId}`)
    markAsRead(notificationId)
    
    // Simulate action feedback
    switch (action) {
      case 'schedule':
        alert('Supervisão agendada com sucesso!')
        break
      case 'create-workshop':
        alert('Workshop criado! Convites enviados para a equipe.')
        break
      case 'view-report':
        alert('Abrindo relatório LGPD...')
        break
      default:
        alert(`Ação "${action}" executada!`)
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'ai') return <Brain className="h-4 w-4" />
    
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'important': return <Clock className="h-4 w-4 text-orange-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'border-l-red-500 bg-red-50 dark:bg-red-950'
      case 'important': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950'
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-950'
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
    }
  }

  const filteredNotifications = notifications
    .filter(n => {
      switch (filter) {
        case 'unread': return !n.read
        case 'urgent': return n.type === 'urgent'
        default: return true
      }
    })
    .sort((a, b) => b.priority - a.priority)

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-start justify-center min-h-screen p-4 pt-20">
        <Card 
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações Inteligentes
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2 mt-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={filter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Não lidas ({unreadCount})
              </Button>
              <Button
                variant={filter === 'urgent' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter('urgent')}
              >
                Urgentes ({notifications.filter(n => n.type === 'urgent').length})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto max-h-96">
            <div className="space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'opacity-100' : 'opacity-60'
                    } hover:opacity-100 transition-opacity`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type, notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {notification.category === 'ai' && <Zap className="h-3 w-3 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.aiSuggestion && (
                            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 mb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Brain className="h-3 w-3 text-yellow-600" />
                                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                  Sugestão da IA
                                </span>
                              </div>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                {notification.aiSuggestion}
                              </p>
                            </div>
                          )}
                          
                          {notification.actions && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {notification.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || 'outline'}
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={() => handleAction(notification.id, action.action)}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {notification.timestamp.toLocaleString('pt-BR')}
                          </p>
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
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar notificações inteligentes
export function useSmartNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3) // Mock count

  return {
    isOpen,
    unreadCount,
    openNotifications: () => setIsOpen(true),
    closeNotifications: () => setIsOpen(false),
    toggleNotifications: () => setIsOpen(prev => !prev)
  }
} 