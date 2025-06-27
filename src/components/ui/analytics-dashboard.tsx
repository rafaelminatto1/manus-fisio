'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useSystemMetrics,
  useTeamMetrics,
  useProjectAnalytics,
  useActivityData,
  useUserActivity,
  usePeriodComparison,
} from '@/hooks/use-analytics'
import {
  TrendingUp,
  TrendingDown,
  Users,
  FolderOpen,
  BookOpen,
  Calendar,
  Bell,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  X,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/cn'

interface MetricCardProps {
  title: string
  value: number
  change?: number
  icon: React.ReactNode
  color: string
  format?: 'number' | 'percentage' | 'currency' | 'time'
  suffix?: string
}

function MetricCard({ title, value, change, icon, color, format = 'number', suffix }: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'currency':
        return `R$ ${val.toLocaleString('pt-BR')}`
      case 'time':
        return `${val.toFixed(1)}h`
      default:
        return val.toString()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold">
                <CountUp end={value} duration={1.5} />
                {suffix}
              </p>
              {change !== undefined && (
                <Badge variant={change >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(change).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f']

// ✅ OTIMIZAÇÃO: Memoizar StatCard para evitar re-renderizações
const StatCard = React.memo(({ title, value, change, icon: Icon, description }: {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  description?: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span>vs período anterior</span>
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
))

StatCard.displayName = 'StatCard'

// ✅ OTIMIZAÇÃO: Memoizar ChartCard para evitar re-renderizações
const ChartCard = React.memo(({ title, children, actions }: {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {actions}
    </div>
    {children}
  </Card>
))

ChartCard.displayName = 'ChartCard'

// Helper functions for colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#10b981'
    case 'completed': return '#3b82f6'
    case 'on_hold': return '#f59e0b'
    case 'cancelled': return '#ef4444'
    default: return '#6b7280'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#10b981'
    default: return '#6b7280'
  }
}

// ✅ OTIMIZAÇÃO: Memoizar componente principal
export const AnalyticsDashboard = React.memo(() => {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [activeTab, setActiveTab] = useState('overview')

  // Hooks para dados
  const { data: systemMetrics, isLoading: systemLoading } = useSystemMetrics()
  const { data: teamMetrics, isLoading: teamLoading } = useTeamMetrics()
  const { data: projectAnalytics, isLoading: projectLoading } = useProjectAnalytics()
  const { data: activityData, isLoading: activityLoading } = useActivityData(period)
  const { data: userActivity, isLoading: userLoading } = useUserActivity()
  const { data: periodComparison } = usePeriodComparison(period)

  const isLoading = systemLoading || teamLoading || projectLoading || activityLoading

  // ✅ OTIMIZAÇÃO: Memoizar dados processados para gráficos
  const chartData = useMemo(() => {
    if (!systemMetrics || !teamMetrics || !projectAnalytics) return null

    return {
      overview: [
        { name: 'Usuários', value: systemMetrics.totalUsers, color: '#8884d8' },
        { name: 'Projetos', value: systemMetrics.totalProjects, color: '#82ca9d' },
        { name: 'Notebooks', value: systemMetrics.totalNotebooks, color: '#ffc658' },
        { name: 'Eventos', value: systemMetrics.totalEvents, color: '#ff7c7c' }
      ],
      projectsByStatus: Object.entries(projectAnalytics.projectsByStatus || {}).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: getStatusColor(status)
      })),
      projectsByPriority: Object.entries(projectAnalytics.projectsByPriority || {}).map(([priority, count]) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: count,
        color: getPriorityColor(priority)
      }))
    }
  }, [systemMetrics, teamMetrics, projectAnalytics])

  // ✅ OTIMIZAÇÃO: Memoizar dados de atividade
  const processedActivityData = useMemo(() => {
    if (!userActivity) return []
    return userActivity.slice(0, 10) // Top 10 usuários mais ativos
  }, [userActivity])

  // Dados para gráficos
  const activityChartData = activityData?.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
  })) || []

  const projectStatusData = projectAnalytics ? [
    { name: 'Ativo', value: projectAnalytics.activeProjects, color: '#10b981' },
    { name: 'Concluído', value: projectAnalytics.completedProjects, color: '#3b82f6' },
    { name: 'Pausado', value: projectAnalytics.onHoldProjects, color: '#f59e0b' },
    { name: 'Cancelado', value: projectAnalytics.cancelledProjects, color: '#ef4444' },
  ] : []

  const priorityData = projectAnalytics ? Object.entries(projectAnalytics.projectsByPriority).map(([key, value]) => ({
    name: key === 'high' ? 'Alta' : key === 'medium' ? 'Média' : 'Baixa',
    value,
    color: key === 'high' ? '#ef4444' : key === 'medium' ? '#f59e0b' : '#10b981',
  })) : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Métricas e insights em tempo real do seu sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <div className="flex rounded-lg border">
            <Button
              variant={period === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('week')}
              className="rounded-r-none"
            >
              Semana
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod('month')}
              className="rounded-l-none"
            >
              Mês
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuários"
          value={systemMetrics?.totalUsers || 0}
          change={periodComparison?.changes.notebooks}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Projetos Ativos"
          value={projectAnalytics?.activeProjects || 0}
          change={periodComparison?.changes.projects}
          icon={<FolderOpen className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Notebooks"
          value={systemMetrics?.totalNotebooks || 0}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Eventos"
          value={systemMetrics?.totalEvents || 0}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Distribuição por Categoria">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData?.overview || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData?.overview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Atividade por Período">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="notebooks"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Notebooks"
                  />
                  <Area
                    type="monotone"
                    dataKey="projects"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Projetos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Status dos Projetos">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Prioridade dos Projetos">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard
              title="Total de Membros"
              value={teamMetrics?.totalMembers || 0}
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Mentores"
              value={teamMetrics?.mentors || 0}
              icon={<Award className="w-6 h-6 text-white" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Estagiários"
              value={teamMetrics?.interns || 0}
              icon={<Target className="w-6 h-6 text-white" />}
              color="bg-purple-500"
            />
          </div>

          <ChartCard title="Estatísticas da Equipe">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {teamMetrics?.activeMentorships || 0}
                </p>
                <p className="text-sm text-muted-foreground">Mentorias Ativas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {teamMetrics?.averageHoursPerMentorship || 0}h
                </p>
                <p className="text-sm text-muted-foreground">Média por Mentoria</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {teamMetrics?.completionRate || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ChartCard title="Top Usuários Ativos">
            <div className="space-y-4">
              {processedActivityData.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.activityScore}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  )
})

AnalyticsDashboard.displayName = 'AnalyticsDashboard' 