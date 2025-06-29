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
  TrendingUp,
  Settings,
  BellOff,
  Mail,
  Smartphone,
  Shield,
  Volume2,
  VolumeX
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useNotificationSettings, useUpdateNotificationSettings, usePushNotificationPermission } from '@/hooks/use-notifications'
import { toast } from 'sonner'

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
  const [isOpen, setIsOpen] = useState(false)
  const { data: settings, isLoading } = useNotificationSettings()
  const updateSettingsMutation = useUpdateNotificationSettings()
  const { permission, requestPermission, isSupported } = usePushNotificationPermission()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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

      if (error) {
        // Se tabela não existir (404), usar dados mock
        if (error.message?.includes('relation "public.notifications" does not exist')) {
          console.log('Tabela notifications não existe, usando dados mock')
          setNotifications(mockNotifications)
          return
        }
        throw error
      }
      setNotifications(data || [])
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      // Fallback para dados mock em caso de erro
      setNotifications(mockNotifications)
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

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value })
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao salvar configuração')
    }
  }

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        return
      }
    }
    
    await handleSettingChange('push_notifications', enabled)
  }

  if (loading || isLoading || !settings) {
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

export function NotificationSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: settings, isLoading } = useNotificationSettings()
  const updateSettingsMutation = useUpdateNotificationSettings()
  const { permission, requestPermission, isSupported } = usePushNotificationPermission()

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettingsMutation.mutateAsync({ [key]: value })
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao salvar configuração')
    }
  }

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        return
      }
    }
    
    await handleSettingChange('push_notifications', enabled)
  }

  if (isLoading || !settings) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Notificações Push
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações no navegador
                  </p>
                  {!isSupported && (
                    <Badge variant="destructive" className="text-xs">
                      Não suportado neste navegador
                    </Badge>
                  )}
                  {permission === 'denied' && (
                    <Badge variant="destructive" className="text-xs">
                      Permissão negada
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={settings.push_notifications && isSupported && permission !== 'denied'}
                  onCheckedChange={handlePushNotificationToggle}
                  disabled={!isSupported || permission === 'denied'}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumos por email
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações específicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tipos de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Calendar Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Lembretes de Calendário
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações de eventos próximos
                  </p>
                </div>
                <Switch
                  checked={settings.calendar_reminders}
                  onCheckedChange={(checked) => handleSettingChange('calendar_reminders', checked)}
                />
              </div>

              {/* Project Updates */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Atualizações de Projetos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Mudanças em projetos que você participa
                  </p>
                </div>
                <Switch
                  checked={settings.project_updates}
                  onCheckedChange={(checked) => handleSettingChange('project_updates', checked)}
                />
              </div>

              {/* Team Mentions */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Menções da Equipe
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Quando você for mencionado
                  </p>
                </div>
                <Switch
                  checked={settings.team_mentions}
                  onCheckedChange={(checked) => handleSettingChange('team_mentions', checked)}
                />
              </div>

              {/* System Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Alertas do Sistema
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizações e manutenções
                  </p>
                </div>
                <Switch
                  checked={settings.system_alerts}
                  onCheckedChange={(checked) => handleSettingChange('system_alerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de tempo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Configurações de Tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reminder Time */}
              <div className="space-y-3">
                <Label>Tempo de Lembrete</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes {settings.reminder_time} minutos antes dos eventos
                </p>
                <div className="px-2">
                  <Slider
                    value={[settings.reminder_time]}
                    onValueChange={([value]) => handleSettingChange('reminder_time', value)}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 min</span>
                    <span>2h</span>
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <Label>Horário Silencioso</Label>
                <p className="text-sm text-muted-foreground">
                  Não receber notificações durante este período
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Início</Label>
                    <Select
                      value={settings.quiet_hours_start || '22:00'}
                      onValueChange={(value) => handleSettingChange('quiet_hours_start', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Fim</Label>
                    <Select
                      value={settings.quiet_hours_end || '07:00'}
                      onValueChange={(value) => handleSettingChange('quiet_hours_end', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status das permissões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Status das Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Suporte a Push Notifications</span>
                <Badge variant={isSupported ? 'default' : 'destructive'}>
                  {isSupported ? 'Suportado' : 'Não suportado'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Permissão Push Notifications</span>
                <Badge 
                  variant={
                    permission === 'granted' ? 'default' : 
                    permission === 'denied' ? 'destructive' : 'secondary'
                  }
                >
                  {permission === 'granted' && 'Concedida'}
                  {permission === 'denied' && 'Negada'}
                  {permission === 'default' && 'Não solicitada'}
                </Badge>
              </div>

              {permission !== 'granted' && isSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestPermission}
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Solicitar Permissão
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Teste de notificação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Teste de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => {
                  toast.success('Teste de Notificação', {
                    description: 'Esta é uma notificação de teste para verificar suas configurações.',
                  })
                  
                  if (settings.push_notifications && permission === 'granted') {
                    new Notification('Manus Fisio - Teste', {
                      body: 'Esta é uma notificação push de teste.',
                      icon: '/icons/icon-192x192.png',
                    })
                  }
                }}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enviar Notificação de Teste
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 