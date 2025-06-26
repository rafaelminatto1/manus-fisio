'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SetupNotice } from '@/components/ui/setup-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'
import { ThemeCustomizer, useThemeCustomizer } from '@/components/ui/theme-customizer'
import { DashboardWidgets, useDashboardWidgets } from '@/components/ui/dashboard-widgets'
import { AIAssistant, useAIAssistant } from '@/components/ui/ai-assistant'
import { useAuth } from '@/hooks/use-auth'
import { createClient, isMockMode } from '@/lib/auth'
import { 
  BookOpen, 
  Users, 
  FolderKanban, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap,
  Activity,
  Plus,
  BarChart3,
  Palette,
  Bot,
  Grid3X3,
  Sparkles,
  Zap,
  Eye,
  ArrowRight,
  Target,
  Stethoscope
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SmartNotifications } from '@/components/ui/smart-notifications'

// Types for real data
interface DashboardStats {
  totalNotebooks: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  totalTeamMembers: number
  activeInterns: number
  upcomingEvents: number
  completionRate: number
}

interface RecentActivity {
  id: string
  action: string
  resource_type: string
  user_id: string
  created_at: string
  user?: {
    full_name: string
    avatar_url?: string
  }
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'supervision' | 'appointment' | 'meeting' | 'evaluation'
  scheduled_for: string
  participants?: string[]
}

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
}

// Mock data fallback
const mockStats: DashboardStats = {
  totalNotebooks: 24,
  totalProjects: 8,
  totalTasks: 156,
  completedTasks: 89,
  totalTeamMembers: 12,
  activeInterns: 5,
  upcomingEvents: 7,
  completionRate: 78
}

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    action: 'create',
    resource_type: 'notebook',
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    user: { full_name: 'Dr. Rafael Santos' }
  },
  {
    id: '2',
    action: 'update',
    resource_type: 'project',
    user_id: 'mock-user',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: { full_name: 'Ana Silva' }
  },
  {
    id: '3',
    action: 'create',
    resource_type: 'task',
    user_id: 'mock-user',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: { full_name: 'Ana Lima' }
  }
]

const mockEvents: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Supervisão - Maria Silva',
    type: 'supervision',
    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    participants: ['Dr. Rafael Santos', 'Maria Silva']
  },
  {
    id: '2',
    title: 'Reunião de Equipe',
    type: 'meeting',
    scheduled_for: new Date(Date.now() + 172800000).toISOString(),
    participants: ['Toda equipe']
  }
]

const quickActions: QuickAction[] = [
  {
    title: 'Novo Notebook',
    description: 'Criar protocolo ou documento',
    icon: BookOpen,
    href: '/notebooks',
    color: 'bg-blue-500'
  },
  {
    title: 'Novo Projeto',
    description: 'Iniciar projeto clínico',
    icon: FolderKanban,
    href: '/projects',
    color: 'bg-green-500'
  },
  {
    title: 'Agendar Supervisão',
    description: 'Marcar supervisão com estagiário',
    icon: Calendar,
    href: '/calendar',
    color: 'bg-orange-500'
  },
  {
    title: 'Gerenciar Equipe',
    description: 'Visualizar mentores e estagiários',
    icon: Users,
    href: '/team',
    color: 'bg-purple-500'
  }
]

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [activities, setActivities] = useState<RecentActivity[]>(mockActivities)
  const [events, setEvents] = useState<UpcomingEvent[]>(mockEvents)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedView, setSelectedView] = useState('overview')

  // Advanced features hooks
  const themeCustomizer = useThemeCustomizer()
  const dashboardWidgets = useDashboardWidgets()
  const aiAssistant = useAIAssistant()
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false)

  const supabase = createClient()
  const isUsingMock = isMockMode()

  useEffect(() => {
    if (isUsingMock || !user) {
      setLoading(false)
      return
    }

    loadDashboardData()
  }, [user, isUsingMock])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load statistics (corrigido para tabelas existentes)
      const [
        notebooksResult,
        projectsResult,
        teamCount
      ] = await Promise.all([
        supabase.from('notebooks').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('users').select('id, role', { count: 'exact' })
      ])

      // Usar dados mock para métricas que não existem no schema atual
      const mockTasksCount = 42
      const mockCompletedTasks = 28

      const newStats: DashboardStats = {
        totalNotebooks: notebooksResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalTasks: mockTasksCount,
        completedTasks: mockCompletedTasks,
        totalTeamMembers: teamCount.count || 0,
        activeInterns: teamCount.data?.filter(member => member.role === 'intern').length || 0,
        upcomingEvents: 0, // This will be updated later
        completionRate: mockTasksCount > 0 ? Math.round((mockCompletedTasks / mockTasksCount) * 100) : 0
      }

      setStats(newStats)

      // Load recent activities (corrigido para schema real)
      const activitiesResult = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          entity_type,
          user_id,
          created_at,
          users!activity_logs_user_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activitiesResult.data) {
        setActivities(activitiesResult.data.map(activity => ({
          ...activity,
          resource_type: activity.entity_type,
          user: activity.users
        })))
      }

      // Load upcoming events
      const eventsResult = await supabase
        .from('calendar_events')
        .select('id, title, type, scheduled_for')
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(5)

      if (eventsResult.data) {
        setEvents(eventsResult.data.map(event => ({
          ...event,
          participants: event.participants || []
        })))
        newStats.upcomingEvents = eventsResult.data.length
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Erro ao carregar dados do dashboard')
      // Fallback to mock data on error
      setStats(mockStats)
      setActivities(mockActivities)
      setEvents(mockEvents)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'notebook': return <BookOpen className="h-4 w-4" />
      case 'project': return <FolderKanban className="h-4 w-4" />
      case 'task': return <CheckCircle className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityMessage = (activity: RecentActivity) => {
    const actionMap = {
      create: 'criou',
      update: 'atualizou',
      delete: 'removeu',
      login: 'fez login'
    }
    
    const resourceMap = {
      notebook: 'notebook',
      project: 'projeto',
      task: 'tarefa',
      user: 'usuário'
    }

    return `${activity.user?.full_name || 'Usuário'} ${actionMap[activity.action as keyof typeof actionMap] || activity.action} ${resourceMap[activity.resource_type as keyof typeof resourceMap] || activity.resource_type}`
  }

  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'supervision': return <GraduationCap className="h-4 w-4" />
      case 'appointment': return <Stethoscope className="h-4 w-4" />
      case 'meeting': return <Users className="h-4 w-4" />
      case 'evaluation': return <Target className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getEventTypeLabel = (type: UpcomingEvent['type']) => {
    const typeMap = {
      supervision: 'Supervisão',
      appointment: 'Consulta',
      meeting: 'Reunião',
      evaluation: 'Avaliação'
    }
    return typeMap[type] || type
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Tentar Novamente</Button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <SetupNotice />
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Aqui está um resumo das atividades da sua clínica de fisioterapia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant={showAnalytics ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {showAnalytics ? 'Ocultar Analytics' : 'Ver Analytics'}
              </Button>
              
              {/* Botão Modo Avançado */}
              <div className="relative">
                <Button 
                  onClick={() => alert('🚀 Modo Avançado com IA em desenvolvimento!\n\nRecursos que estarão disponíveis:\n• IA Assistant especializada em fisioterapia\n• Busca semântica inteligente\n• Notificações com priorização automática\n• Personalização avançada de temas\n• Automação de tarefas\n• Insights preditivos\n• Dashboard com widgets customizáveis\n\nEm breve!')}
                  variant="outline"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/30 hover:from-primary/20 hover:to-blue-500/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping" />
                    </div>
                    <span className="text-sm font-medium bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      Modo Pro IA
                    </span>
                  </div>
                </Button>
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Analytics Dashboard - Conditional */}
          {showAnalytics && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Analytics Avançado</h2>
              </div>
              <AnalyticsDashboard />
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Notebooks</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNotebooks}</div>
                <p className="text-xs text-muted-foreground">
                  Protocolos e documentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estagiários Ativos</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeInterns}</div>
                <p className="text-xs text-muted-foreground">
                  Em supervisão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <div className="mt-2">
                  <Progress value={stats.completionRate} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => router.push(action.href)}
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>
                  Últimas ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </div>
                  ) : activities.length > 0 ? (
                    activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          {getActivityIcon(activity.resource_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">
                            {getActivityMessage(activity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'PPp', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade recente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>
                  Supervisões e reuniões agendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div key={event.id} className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-full">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.scheduled_for), 'PPp', { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum evento agendado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Panel */}
          <SmartNotifications 
            maxVisible={5}
            className="lg:col-span-2"
          />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}