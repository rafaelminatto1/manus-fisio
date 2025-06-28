'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
import { useDashboardData, DashboardStats, RecentActivity } from '@/hooks/use-dashboard-data'
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
  Settings,
  Star,
  Rocket,
  Crown
} from 'lucide-react'

// Interface for UpcomingEvent (kept here as it's not in use-dashboard-data)
interface UpcomingEvent {
  id: string
  title: string
  type: 'supervision' | 'meeting' | 'deadline'
  date: string
  time?: string
  participants?: string[]
}

// Mock data fallback (kept for mock mode)
const mockStats: DashboardStats = {
  notebooks: 24,
  projects: 12,
  activeInterns: 15,
  completedTasks: 156,
  totalTasks: 189,
  activeMentorships: 18
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
    resource_type: 'mentorship',
    user_id: 'mock-user',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: { full_name: 'Dra. Maria Costa' }
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
  },
  {
    id: '3',
    title: 'Avaliação Final - João Silva',
    type: 'supervision',
    date: '2025-01-17',
    time: '16:30'
  }
]

export default function AdvancedDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [events] = useState<UpcomingEvent[]>(mockEvents) // Keep events state, as it's not fetched by the hook
  const [showAnalytics, setShowAnalytics] = useState(false) // Keep this state

  // Advanced features hooks
  const themeCustomizer = useThemeCustomizer()
  const dashboardWidgets = useDashboardWidgets()
  const aiAssistant = useAIAssistant()
  const [dashboardMode, setDashboardMode] = useState<'classic' | 'widgets' | 'analytics'>('classic')

  // Determine if in mock mode
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  // Fetch data using React Query
  const { data, isLoading: loading, error: queryError } = useDashboardData({
    enabled: !isMockMode && !!user, // Only fetch if not in mock mode and user is available
  })

  // Use fetched data or mock data as fallback
  const stats = data?.stats || mockStats
  const activities = data?.activities || mockActivities
  const error = queryError ? 'Erro ao carregar dados do dashboard' : null

  const getActivityIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'notebook': return <BookOpen className="h-4 w-4" />
      case 'project': return <FolderKanban className="h-4 w-4" />
      case 'task': return <CheckCircle className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'mentorship': return <GraduationCap className="h-4 w-4" />
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
      user: 'usuário',
      mentorship: 'mentoria'
    }

    return `${activity.user?.full_name || 'Usuário'} ${actionMap[activity.action as keyof typeof actionMap] || activity.action} ${resourceMap[activity.resource_type as keyof typeof resourceMap] || activity.resource_type}`
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  // Prepare analytics data
  const analyticsMetrics = {
    projects_active: stats.projects,
    tasks_pending: stats.totalTasks - stats.completedTasks,
    team_productivity: Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100),
    compliance_score: 98,
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

  const renderDashboardContent = () => {
    switch (dashboardMode) {
      case 'widgets':
        return (
          <DashboardWidgets 
            isEditMode={dashboardWidgets.isEditMode}
            onToggleEditMode={dashboardWidgets.toggleEditMode}
          />
        )
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Analytics Avançado</h2>
            </div>
            <AnalyticsDashboard />
          </div>
        )
      
      default:
        return (
          <>
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notebooks Ativos</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{loading ? '...' : stats.notebooks}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Protocolos e documentos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <FolderKanban className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{loading ? '...' : stats.projects}</div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Estudos e pesquisas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estagiários Ativos</CardTitle>
                  <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{loading ? '...' : stats.activeInterns}</div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Em supervisão ativa
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{loading ? '...' : `${completionRate}%`}</div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {stats.completedTasks} de {stats.totalTasks} tarefas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesse rapidamente as funcionalidades mais utilizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Link href="/notebooks">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Novo Notebook</span>
                      <span className="text-xs text-muted-foreground">Criar protocolo</span>
                    </Button>
                  </Link>
                  
                  <Link href="/projects">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950">
                      <FolderKanban className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Novo Projeto</span>
                      <span className="text-xs text-muted-foreground">Iniciar pesquisa</span>
                    </Button>
                  </Link>
                  
                  <Link href="/team">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950">
                      <Users className="h-6 w-6 text-purple-600" />
                      <span className="text-sm font-medium">Gerenciar Equipe</span>
                      <span className="text-xs text-muted-foreground">Supervisionar</span>
                    </Button>
                  </Link>
                  
                  <Link href="/calendar">
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-950">
                      <Calendar className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium">Agendar</span>
                      <span className="text-xs text-muted-foreground">Marcar supervisão</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Atividades Recentes
                  </CardTitle>
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
                        <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 bg-primary/10 rounded-full">
                            {getActivityIcon(activity.resource_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium">
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
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Próximos Eventos
                  </CardTitle>
                  <CardDescription>
                    Supervisões e reuniões agendadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
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
                          <Badge variant="outline" className="text-xs">
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
          </>
        )
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          <SetupNotice />
          
          {/* Advanced Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Crown className="h-8 w-8 text-primary" />
                Manus Fisio Pro
                <Badge variant="default" className="bg-gradient-to-r from-primary to-blue-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Avançado
                </Badge>
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}! Dashboard com IA e personalização avançada.
              </p>
            </div>
            
            {/* Advanced Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant={dashboardMode === 'classic' ? "default" : "outline"}
                onClick={() => setDashboardMode('classic')}
                size="sm"
              >
                <Star className="h-4 w-4 mr-2" />
                Clássico
              </Button>
              
              <Button
                variant={dashboardMode === 'widgets' ? "default" : "outline"}
                onClick={() => setDashboardMode('widgets')}
                size="sm"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Widgets
              </Button>
              
              <Button
                variant={dashboardMode === 'analytics' ? "default" : "outline"}
                onClick={() => setDashboardMode('analytics')}
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              
              <Button
                onClick={themeCustomizer.openThemeCustomizer}
                variant="outline"
                size="sm"
              >
                <Palette className="h-4 w-4 mr-2" />
                Temas
              </Button>
              
              <Button
                onClick={aiAssistant.openAssistant}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
              >
                <Bot className="h-4 w-4 mr-2" />
                IA Assistant
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Dynamic Dashboard Content */}
          {renderDashboardContent()}
        </div>

        {/* Advanced Components */}
        <ThemeCustomizer 
          isOpen={themeCustomizer.isOpen}
          onClose={themeCustomizer.closeThemeCustomizer}
        />
        
        <AIAssistant
          isOpen={aiAssistant.isOpen}
          onClose={aiAssistant.closeAssistant}
          onMinimize={aiAssistant.minimizeAssistant}
          isMinimized={aiAssistant.isMinimized}
        />
      </DashboardLayout>
    </AuthGuard>
  )
}