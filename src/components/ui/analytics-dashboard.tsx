'use client'

import React, { useState } from 'react'
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
import { Card } from '@/components/ui/card'
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

interface ChartCardProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

function ChartCard({ title, children, actions }: ChartCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </Card>
  )
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f']

export function AnalyticsDashboard() {
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Usuários"
              value={systemMetrics?.totalUsers || 0}
              change={periodComparison?.changes.notebooks}
              icon={<Users className="w-5 h-5 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Projetos Ativos"
              value={projectAnalytics?.activeProjects || 0}
              change={periodComparison?.changes.projects}
              icon={<FolderOpen className="w-5 h-5 text-white" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Notebooks Criados"
              value={systemMetrics?.totalNotebooks || 0}
              icon={<BookOpen className="w-5 h-5 text-white" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Eventos Agendados"
              value={systemMetrics?.totalEvents || 0}
              icon={<Calendar className="w-5 h-5 text-white" />}
              color="bg-orange-500"
            />
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Atividade no Tempo">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="projects"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    name="Projetos"
                  />
                  <Area
                    type="monotone"
                    dataKey="notebooks"
                    stackId="3"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.6}
                    name="Notebooks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

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
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Métricas de Projetos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Projetos"
              value={projectAnalytics?.totalProjects || 0}
              icon={<FolderOpen className="w-5 h-5 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Taxa de Conclusão"
              value={projectAnalytics ? (projectAnalytics.completedProjects / projectAnalytics.totalProjects) * 100 : 0}
              format="percentage"
              icon={<CheckCircle className="w-5 h-5 text-white" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Tempo Médio"
              value={projectAnalytics?.averageCompletionTime || 0}
              format="time"
              suffix=" dias"
              icon={<Clock className="w-5 h-5 text-white" />}
              color="bg-orange-500"
            />
            <MetricCard
              title="Em Pausa"
              value={projectAnalytics?.onHoldProjects || 0}
              icon={<Pause className="w-5 h-5 text-white" />}
              color="bg-yellow-500"
            />
          </div>

          {/* Gráficos de Projetos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Projetos por Prioridade">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribuição por Status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Métricas da Equipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Membros"
              value={teamMetrics?.totalMembers || 0}
              icon={<Users className="w-5 h-5 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Mentores"
              value={teamMetrics?.mentors || 0}
              icon={<Award className="w-5 h-5 text-white" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Estagiários"
              value={teamMetrics?.interns || 0}
              icon={<Target className="w-5 h-5 text-white" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Taxa de Conclusão"
              value={teamMetrics?.completionRate || 0}
              format="percentage"
              icon={<CheckCircle className="w-5 h-5 text-white" />}
              color="bg-orange-500"
            />
          </div>

          {/* Ranking de Usuários */}
          <ChartCard title="Ranking de Atividade dos Usuários">
            <div className="space-y-3">
              {userActivity?.slice(0, 10).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.userName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{user.activityScore} pts</p>
                    <p className="text-sm text-muted-foreground">
                      {user.projectsCreated} projetos • {user.notebooksCreated} notebooks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Métricas de Atividade */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Usuários Ativos"
              value={systemMetrics?.activeUsers || 0}
              icon={<Activity className="w-5 h-5 text-white" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Notificações"
              value={systemMetrics?.totalNotifications || 0}
              icon={<Bell className="w-5 h-5 text-white" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Não Lidas"
              value={systemMetrics?.unreadNotifications || 0}
              icon={<AlertCircle className="w-5 h-5 text-white" />}
              color="bg-red-500"
            />
            <MetricCard
              title="Mentorias Ativas"
              value={teamMetrics?.activeMentorships || 0}
              icon={<Users className="w-5 h-5 text-white" />}
              color="bg-purple-500"
            />
          </div>

          {/* Gráfico de Atividade Detalhado */}
          <ChartCard title="Atividade Detalhada por Tipo">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="notebooks"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Notebooks"
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Projetos"
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Eventos"
                />
                <Line
                  type="monotone"
                  dataKey="notifications"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Notificações"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  )
} 