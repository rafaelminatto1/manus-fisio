'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient, isMockMode } from '@/lib/auth'
import { useAuth } from '@/hooks/use-auth'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  GraduationCap,
  Stethoscope,
  Activity,
  Target,
  Award,
  Brain,
  Heart,
  Timer,
  Eye,
  FileText,
  Bookmark,
  UserCheck,
  Building
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AnalyticsData {
  // Métricas gerais
  totalPatients: number
  totalSessions: number
  totalProjects: number
  totalInterns: number
  
  // Métricas de produtividade
  completedTasks: number
  completedTasksLastWeek: number
  averageSessionDuration: number
  supervisionHours: number
  
  // Métricas de qualidade
  patientSatisfaction: number
  internProgress: number
  protocolAdherence: number
  
  // Métricas de tempo
  averageResponseTime: number
  appointmentPunctuality: number
  
  // Tendências (comparação com período anterior)
  patientsGrowth: number
  sessionsGrowth: number
  productivityGrowth: number
  satisfactionGrowth: number
}

interface WeeklyActivity {
  date: string
  sessions: number
  tasks: number
  supervisions: number
}

interface SpecialtyMetrics {
  specialty: string
  patients: number
  satisfaction: number
  successRate: number
  avgTreatmentDuration: number
}

// Mock data para desenvolvimento
const mockAnalytics: AnalyticsData = {
  totalPatients: 287,
  totalSessions: 1543,
  totalProjects: 12,
  totalInterns: 8,
  completedTasks: 145,
  completedTasksLastWeek: 127,
  averageSessionDuration: 45,
  supervisionHours: 320,
  patientSatisfaction: 4.8,
  internProgress: 78,
  protocolAdherence: 92,
  averageResponseTime: 2.3,
  appointmentPunctuality: 94,
  patientsGrowth: 12.5,
  sessionsGrowth: 8.7,
  productivityGrowth: 15.2,
  satisfactionGrowth: 2.1
}

const mockWeeklyActivity: WeeklyActivity[] = [
  { date: '2024-01-15', sessions: 23, tasks: 12, supervisions: 3 },
  { date: '2024-01-16', sessions: 28, tasks: 15, supervisions: 4 },
  { date: '2024-01-17', sessions: 31, tasks: 18, supervisions: 5 },
  { date: '2024-01-18', sessions: 26, tasks: 14, supervisions: 3 },
  { date: '2024-01-19', sessions: 29, tasks: 16, supervisions: 4 },
  { date: '2024-01-20', sessions: 15, tasks: 8, supervisions: 2 },
  { date: '2024-01-21', sessions: 12, tasks: 6, supervisions: 1 }
]

const mockSpecialtyMetrics: SpecialtyMetrics[] = [
  {
    specialty: 'Fisioterapia Ortopédica',
    patients: 98,
    satisfaction: 4.9,
    successRate: 94,
    avgTreatmentDuration: 8.2
  },
  {
    specialty: 'Fisioterapia Neurológica',
    patients: 67,
    satisfaction: 4.7,
    successRate: 89,
    avgTreatmentDuration: 12.1
  },
  {
    specialty: 'Fisioterapia Respiratória',
    patients: 54,
    satisfaction: 4.8,
    successRate: 91,
    avgTreatmentDuration: 6.5
  },
  {
    specialty: 'Fisioterapia Pediátrica',
    patients: 43,
    satisfaction: 4.9,
    successRate: 95,
    avgTreatmentDuration: 10.3
  },
  {
    specialty: 'Fisioterapia Geriátrica',
    patients: 25,
    satisfaction: 4.6,
    successRate: 87,
    avgTreatmentDuration: 14.2
  }
]

interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  className?: string
}

export function AnalyticsDashboard({ 
  timeRange = '30d', 
  className = '' 
}: AnalyticsDashboardProps) {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics)
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>(mockWeeklyActivity)
  const [specialtyMetrics, setSpecialtyMetrics] = useState<SpecialtyMetrics[]>(mockSpecialtyMetrics)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const supabase = createClient()
  const isUsingMock = isMockMode()

  useEffect(() => {
    if (!isUsingMock && user) {
      loadAnalyticsData()
    }
  }, [user, timeRange, isUsingMock])

  const loadAnalyticsData = async () => {
    if (isUsingMock) return

    try {
      setLoading(true)
      
      // Carregar métricas de diferentes fontes (corrigido para schema real)
      const [usersResult, projectsResult, notebooksResult, activityResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'intern'),
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('notebooks').select('id', { count: 'exact' }),
        supabase.from('activity_logs').select('id,action,entity_type,user_id,created_at,users!activity_logs_user_id_fkey(full_name)').order('created_at', { ascending: false }).limit(10)
      ])

      // Processar dados (implementar lógica real de analytics)
      // Por enquanto usando dados mock como fallback
      
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    description, 
    format = 'number' 
  }: {
    title: string
    value: number
    growth?: number
    icon: any
    description: string
    format?: 'number' | 'percentage' | 'duration' | 'rating'
  }) => {
    const formatValue = (val: number, fmt: string) => {
      switch (fmt) {
        case 'percentage':
          return `${val}%`
        case 'duration':
          return `${val}min`
        case 'rating':
          return `${val.toFixed(1)}/5.0`
        default:
          return val.toLocaleString()
      }
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue(value, format)}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{description}</span>
            {growth !== undefined && (
              <div className={`flex items-center ml-2 ${getGrowthColor(growth)}`}>
                {getGrowthIcon(growth)}
                <span className="ml-1">
                  {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Métricas e insights da clínica de fisioterapia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Exportar Relatório
          </Button>
          <Button variant="outline" size="sm">
            Últimos {timeRange}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Pacientes"
              value={analytics.totalPatients}
              growth={analytics.patientsGrowth}
              icon={Users}
              description="pacientes ativos"
            />
            <MetricCard
              title="Sessões Realizadas"
              value={analytics.totalSessions}
              growth={analytics.sessionsGrowth}
              icon={Calendar}
              description="este mês"
            />
            <MetricCard
              title="Projetos Ativos"
              value={analytics.totalProjects}
              icon={FileText}
              description="em desenvolvimento"
            />
            <MetricCard
              title="Estagiários"
              value={analytics.totalInterns}
              icon={GraduationCap}
              description="em supervisão"
            />
          </div>

          {/* Atividade semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Atividade Semanal
              </CardTitle>
              <CardDescription>
                Distribuição de atividades nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyActivity.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">
                        {format(new Date(day.date), 'EEEE', { locale: ptBR })}
                      </span>
                      {isToday(new Date(day.date)) && (
                        <Badge variant="secondary">Hoje</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{day.sessions} sessões</span>
                      <span>{day.tasks} tarefas</span>
                      <span>{day.supervisions} supervisões</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Tarefas Concluídas"
              value={analytics.completedTasks}
              growth={analytics.productivityGrowth}
              icon={CheckCircle}
              description="este período"
            />
            <MetricCard
              title="Duração Média das Sessões"
              value={analytics.averageSessionDuration}
              icon={Clock}
              description="minutos por sessão"
              format="duration"
            />
            <MetricCard
              title="Horas de Supervisão"
              value={analytics.supervisionHours}
              icon={GraduationCap}
              description="total acumulado"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtividade da Equipe</CardTitle>
              <CardDescription>
                Métricas de performance e eficiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Conclusão de Tarefas</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((analytics.completedTasks / (analytics.completedTasks + 23)) * 100)}%
                  </span>
                </div>
                <Progress value={Math.round((analytics.completedTasks / (analytics.completedTasks + 23)) * 100)} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pontualidade dos Atendimentos</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.appointmentPunctuality}%
                  </span>
                </div>
                <Progress value={analytics.appointmentPunctuality} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progresso dos Estagiários</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.internProgress}%
                  </span>
                </div>
                <Progress value={analytics.internProgress} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Satisfação dos Pacientes"
              value={analytics.patientSatisfaction}
              growth={analytics.satisfactionGrowth}
              icon={Heart}
              description="avaliação média"
              format="rating"
            />
            <MetricCard
              title="Aderência aos Protocolos"
              value={analytics.protocolAdherence}
              icon={Target}
              description="conformidade"
              format="percentage"
            />
            <MetricCard
              title="Tempo de Resposta"
              value={analytics.averageResponseTime}
              icon={Timer}
              description="horas médias"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Qualidade</CardTitle>
              <CardDescription>
                Métricas de qualidade do atendimento e tratamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Satisfação por Categoria</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Atendimento</span>
                      <span className="text-sm font-medium">4.9/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tratamento</span>
                      <span className="text-sm font-medium">4.7/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Instalações</span>
                      <span className="text-sm font-medium">4.8/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Comunicação</span>
                      <span className="text-sm font-medium">4.6/5.0</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Indicadores Clínicos</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Taxa de Melhora</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Retorno ao Trabalho</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Prevenção de Recidiva</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Funcionalidade Restaurada</span>
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <div className="grid gap-4">
            {specialtyMetrics.map((specialty, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{specialty.specialty}</CardTitle>
                    <Badge variant="secondary">
                      {specialty.patients} pacientes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {specialty.satisfaction.toFixed(1)}/5.0
                      </div>
                      <div className="text-sm text-muted-foreground">Satisfação</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {specialty.successRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {specialty.avgTreatmentDuration.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Semanas Médias</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 