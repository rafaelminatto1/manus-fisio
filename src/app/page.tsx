'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SetupNotice } from '@/components/ui/setup-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { LoadingSpinner, SkeletonCard } from '@/components/ui/enhanced-loading'
import { Progress } from '@/components/ui/progress'
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'
import { ThemeCustomizer } from '@/components/ui/theme-customizer'
import { DashboardWidgets, useDashboardWidgets } from '@/components/ui/dashboard-widgets'
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
  Stethoscope,
  FileText,
  Shield,
  MessageSquare,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SmartNotifications } from '@/components/ui/smart-notifications'
import { useDashboardQuery } from '@/hooks/use-dashboard-data'

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
  const { user, loading } = useAuth()
  const router = useRouter()
  const { data, isLoading, error } = useDashboardQuery()
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedView, setSelectedView] = useState('overview')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Advanced features hooks
  const dashboardWidgets = useDashboardWidgets()
  const [showAdvancedDashboard, setShowAdvancedDashboard] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const isUsingMock = isMockMode()

  

  const getActivityIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'notebook': return BookOpen
      case 'project': return FolderKanban
      case 'task': return CheckCircle
      default: return Activity
    }
  }

  const getActivityMessage = (activity: RecentActivity) => {
    const actions = {
      create: 'criou',
      update: 'atualizou',
      delete: 'removeu',
      complete: 'completou'
    }
    
    const resources = {
      notebook: 'um notebook',
      project: 'um projeto',
      task: 'uma tarefa'
    }
    
    return `${actions[activity.action as keyof typeof actions] || 'modificou'} ${resources[activity.resource_type as keyof typeof resources] || 'um item'}`
  }

  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'supervision': return Users
      case 'appointment': return Calendar
      case 'meeting': return Users
      case 'evaluation': return CheckCircle
      default: return Calendar
    }
  }

  const getEventTypeLabel = (type: UpcomingEvent['type']) => {
    const labels = {
      supervision: 'Supervisão',
      appointment: 'Consulta',
      meeting: 'Reunião',
      evaluation: 'Avaliação'
    }
    return labels[type] || 'Evento'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500"></div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  if (showAnalytics) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <Button onClick={() => setShowAnalytics(false)} variant="outline">
                Voltar ao Dashboard
              </Button>
            </div>
            <AnalyticsDashboard />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Advanced Dashboard Toggle */}
              <Button
                onClick={() => setShowAdvancedDashboard(!showAdvancedDashboard)}
                variant={showAdvancedDashboard ? "default" : "outline"}
                size="sm"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                {showAdvancedDashboard ? 'Dashboard Padrão' : 'Dashboard Avançado'}
              </Button>

              {/* Analytics Dashboard */}
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>

          {/* Setup Notice */}
          {isUsingMock && <SetupNotice />}

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700">{error?.toString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Dashboard Widgets */}
          {showAdvancedDashboard && (
            <DashboardWidgets
              isEditMode={false}
              onToggleEditMode={() => {}}
            />
          )}

          {/* Standard Dashboard */}
          {!showAdvancedDashboard && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    <EnhancedCard variant="elevated" animation="fade" className="hover-lift bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
                      <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <EnhancedCardTitle className="text-sm font-medium text-blue-700">Total de Notebooks</EnhancedCardTitle>
                        <BookOpen className="h-4 w-4 text-blue-600 animate-float" />
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="text-2xl font-bold text-blue-800 animate-scale-in">{data?.stats.totalNotebooks}</div>
                        <p className="text-xs text-blue-600">
                          Protocolos e documentos
                        </p>
                      </EnhancedCardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="elevated" animation="fade" className="hover-lift bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200">
                      <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <EnhancedCardTitle className="text-sm font-medium text-emerald-700">Projetos Ativos</EnhancedCardTitle>
                        <FolderKanban className="h-4 w-4 text-emerald-600 animate-float" />
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="text-2xl font-bold text-emerald-800 animate-scale-in">{data?.stats.totalProjects}</div>
                        <p className="text-xs text-emerald-600">
                          Em desenvolvimento
                        </p>
                      </EnhancedCardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="elevated" animation="fade" className="hover-lift bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
                      <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <EnhancedCardTitle className="text-sm font-medium text-purple-700">Equipe</EnhancedCardTitle>
                        <Users className="h-4 w-4 text-purple-600 animate-float" />
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="text-2xl font-bold text-purple-800 animate-scale-in">{data?.stats.totalTeamMembers}</div>
                        <p className="text-xs text-purple-600">
                          {data?.stats.activeInterns} estagiários ativos
                        </p>
                      </EnhancedCardContent>
                    </EnhancedCard>

                    <EnhancedCard variant="elevated" animation="fade" className="hover-lift bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
                      <EnhancedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <EnhancedCardTitle className="text-sm font-medium text-amber-700">Taxa de Conclusão</EnhancedCardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-600 animate-float" />
                      </EnhancedCardHeader>
                      <EnhancedCardContent>
                        <div className="text-2xl font-bold text-amber-800 animate-scale-in">{data?.stats.completionRate}%</div>
                        <Progress value={data?.stats.completionRate} className="mt-2" />
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <EnhancedCard 
                        variant="interactive" 
                        animation="scale"
                        className="hover-lift group"
                      >
                        <EnhancedCardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                        </EnhancedCardContent>
                      </EnhancedCard>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividade Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.activities.map((activity) => {
                        const Icon = getActivityIcon(activity.resource_type)
                        return (
                          <div key={activity.id} className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.user?.full_name}</span>{' '}
                                {getActivityMessage(activity)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(activity.created_at), 'HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Próximos Eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.events.map((event) => {
                        const Icon = getEventIcon(event.type)
                        return (
                          <div key={event.id} className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(event.scheduled_for), 'dd/MM HH:mm', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          
        </div>

        {/* Advanced Features */}
        <ThemeCustomizer />
        <SmartNotifications />
      </DashboardLayout>
    </AuthGuard>
  )
}