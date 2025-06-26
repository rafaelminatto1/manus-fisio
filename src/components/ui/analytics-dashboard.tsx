import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Users, Clock, Target, Award } from 'lucide-react'

interface AnalyticsDashboardProps {
  metrics: {
    projects_active: number
    tasks_pending: number
    team_productivity: number
    compliance_score: number
    mentorship_progress: Array<{
      mentor_name: string
      mentee_name: string
      progress: number
      competencies: number
    }>
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  const productivityData = [
    { name: 'Jan', valor: 85 },
    { name: 'Fev', valor: 78 },
    { name: 'Mar', valor: 92 },
    { name: 'Abr', valor: 88 },
    { name: 'Mai', valor: 95 },
    { name: 'Jun', valor: 91 },
  ]

  const taskDistribution = [
    { name: 'Concluídas', value: 45, color: '#10b981' },
    { name: 'Em Progresso', value: 25, color: '#3b82f6' },
    { name: 'Pendentes', value: 20, color: '#f59e0b' },
    { name: 'Atrasadas', value: 10, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.projects_active}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasks_pending}</div>
            <div className="flex items-center text-xs text-red-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              -5% vs semana anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.team_productivity}%</div>
            <Progress value={metrics.team_productivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance LGPD</CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.compliance_score}%</div>
            <Badge variant={metrics.compliance_score >= 95 ? "default" : "destructive"} className="mt-2">
              {metrics.compliance_score >= 95 ? "Conforme" : "Atenção"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Produtividade */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard de Mentoria */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Mentoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.mentorship_progress.map((mentorship, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{mentorship.mentor_name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{mentorship.mentee_name}</span>
                  </div>
                  <Progress value={mentorship.progress} className="w-full" />
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium">{mentorship.progress}%</div>
                  <div className="text-xs text-muted-foreground">
                    {mentorship.competencies} competências
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 