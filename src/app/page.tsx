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
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'
import { ThemeCustomizer, useThemeCustomizer } from '@/components/ui/theme-customizer'
import { DashboardWidgets, useDashboardWidgets } from '@/components/ui/dashboard-widgets'
import { AIAssistant, useAIAssistant } from '@/components/ui/ai-assistant'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
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
  Zap
} from 'lucide-react'

// Types for real data
interface DashboardStats {
  notebooks: number
  projects: number
  activeInterns: number
  completedTasks: number
  totalTasks: number
  activeMentorships: number
}

interface RecentActivity {
  id: string
  action: string
  resource_type: string
  user_id: string
  created_at: string
  user?: {
    full_name: string
  }
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'supervision' | 'meeting' | 'deadline'
  date: string
  time?: string
  participants?: string[]
}

// Mock data fallback
const mockStats: DashboardStats = {
  notebooks: 5,
  projects: 12,
  activeInterns: 4,
  completedTasks: 23,
  totalTasks: 31,
  activeMentorships: 3
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
  }
]

const mockEvents: UpcomingEvent[] = [
  {
    id: '1',
    title: 'Supervisão - Protocolo TMJ',
    type: 'supervision',
    date: '2025-01-15',
    time: '14:00'
  },
  {
    id: '2',
    title: 'Reunião de Equipe',
    type: 'meeting',
    date: '2025-01-16',
    time: '09:00'
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

  // Advanced features hooks
  const themeCustomizer = useThemeCustomizer()
  const dashboardWidgets = useDashboardWidgets()
  const aiAssistant = useAIAssistant()
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false)

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    if (isMockMode || !user) {
      setLoading(false)
      return
    }

    loadDashboardData()
  }, [user, isMockMode])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load statistics
      const [
        notebooksResult,
        projectsResult,
        tasksResult,
        mentorshipsResult,
        usersResult
      ] = await Promise.all([
        supabase.from('notebooks').select('id', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('tasks').select('id, status', { count: 'exact' }),
        supabase.from('mentorships').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'intern').eq('is_active', true)
      ])

      // Calculate completed tasks
      const completedTasksResult = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('status', 'done')

      const newStats: DashboardStats = {
        notebooks: notebooksResult.count || 0,
        projects: projectsResult.count || 0,
        activeInterns: usersResult.count || 0,
        completedTasks: completedTasksResult.count || 0,
        totalTasks: tasksResult.count || 0,
        activeMentorships: mentorshipsResult.count || 0
      }

      setStats(newStats)

      // Load recent activities
      const activitiesResult = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          resource_type,
          user_id,
          created_at,
          users:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activitiesResult.data) {
        setActivities(activitiesResult.data.map(activity => ({
          ...activity,
          user: activity.users
        })))
      }

      // For now, keep mock events (calendar integration would be next phase)
      setEvents(mockEvents)

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

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  // Prepare analytics data
  const analyticsMetrics = {
    projects_active: stats.projects,
    tasks_pending: stats.totalTasks - stats.completedTasks,
    team_productivity: Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100),
    compliance_score: 98, // Mock compliance score
    mentorship_progress: [
      {
        mentor_name: 'Dr. Rafael Santos',
        mentee_name: 'Ana Silva',
        progress: 85,
        competencies: 12
      },
      {
        mentor_name: 'Dra. Maria Costa',
        mentee_name: 'João Oliveira',
        progress: 72,
        competencies: 8
      },
      {
        mentor_name: 'Dr. Carlos Lima',
        mentee_name: 'Sofia Ferreira',
        progress: 91,
        competencies: 15
      }
    ]
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
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
              <AnalyticsDashboard metrics={analyticsMetrics} />
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notebooks Ativos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.notebooks}</div>
                <p className="text-xs text-muted-foreground">
                  Protocolos e documentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos em Andamento</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.projects}</div>
                <p className="text-xs text-muted-foreground">
                  Estudos e pesquisas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estagiários Ativos</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.activeInterns}</div>
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
                <div className="text-2xl font-bold">{loading ? '...' : `${completionRate}%`}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTasks} de {stats.totalTasks} tarefas
                </p>
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
                <Link href="/notebooks">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Novo Notebook</span>
                  </Button>
                </Link>
                
                <Link href="/projects">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <FolderKanban className="h-6 w-6" />
                    <span className="text-sm">Novo Projeto</span>
                  </Button>
                </Link>
                
                <Link href="/team">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Gerenciar Equipe</span>
                  </Button>
                </Link>
                
                <Link href="/calendar">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Agendar Supervisão</span>
                  </Button>
                </Link>
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
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
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
                          <Calendar className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('pt-BR')}
                            {event.time && ` às ${event.time}`}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {event.type === 'supervision' && 'Supervisão'}
                          {event.type === 'meeting' && 'Reunião'}
                          {event.type === 'deadline' && 'Prazo'}
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}