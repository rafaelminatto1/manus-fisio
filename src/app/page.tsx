'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { SetupNotice } from '@/components/ui/setup-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
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
  Activity
} from 'lucide-react'

// Mock data - In production this would come from Supabase
const mockStats = {
  notebooks: 5,
  projects: 12,
  activeInterns: 4,
  completedTasks: 28,
  pendingTasks: 15,
  upcomingEvents: 3
}

const mockRecentActivities = [
  {
    id: 1,
    type: 'task_completed',
    user: 'Maria Silva',
    action: 'concluiu a tarefa',
    target: 'Avaliação inicial - João Santos',
    time: '2h atrás'
  },
  {
    id: 2,
    type: 'notebook_created',
    user: 'Dr. Rafael Santos',
    action: 'criou o notebook',
    target: 'Protocolos de Fisioterapia Respiratória',
    time: '4h atrás'
  },
  {
    id: 3,
    type: 'comment_added',
    user: 'Pedro Alves',
    action: 'comentou em',
    target: 'Projeto Reabilitação LCA',
    time: '6h atrás'
  }
]

const mockUpcomingEvents = [
  {
    id: 1,
    title: 'Supervisão - Maria Silva',
    type: 'supervision',
    time: 'Hoje, 14:00',
    mentor: 'Dr. Rafael Santos'
  },
  {
    id: 2,
    title: 'Avaliação Semestral',
    type: 'evaluation',
    time: 'Amanhã, 09:00',
    mentor: 'Dra. Ana Lima'
  },
  {
    id: 3,
    title: 'Workshop: Dor Lombar',
    type: 'workshop',
    time: 'Sex, 16:00',
    mentor: 'Dr. Carlos Oliveira'
  }
]

export default function DashboardPage() {
  const { user } = useAuth()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'notebook_created':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'comment_added':
        return <Activity className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'supervision':
        return <User className="h-4 w-4 text-medical-500" />
      case 'evaluation':
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'workshop':
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <AuthGuard>
      <SetupNotice />
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              {user?.role === 'mentor' 
                ? 'Aqui está um resumo das atividades da sua equipe e supervisionados.'
                : user?.role === 'intern'
                ? 'Acompanhe seu progresso e atividades de estágio.'
                : 'Visão geral do sistema de gestão clínica.'
              }
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notebooks</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.notebooks}</div>
                <p className="text-xs text-muted-foreground">
                  +2 novos esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {mockStats.pendingTasks} tarefas pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'mentor' ? 'Estagiários' : 'Supervisão'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.activeInterns}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'mentor' ? 'supervisionados ativos' : 'horas concluídas esta semana'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((mockStats.completedTasks / (mockStats.completedTasks + mockStats.pendingTasks)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockStats.completedTasks} tarefas concluídas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividades Recentes
                </CardTitle>
                <CardDescription>
                  Últimas ações realizadas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{' '}
                          {activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
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
                <CardDescription>
                  Supervisões, avaliações e workshops agendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUpcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      {getEventIcon(event.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                        {event.mentor && (
                          <p className="text-xs text-muted-foreground">
                            com {event.mentor}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type === 'supervision' ? 'Supervisão' :
                         event.type === 'evaluation' ? 'Avaliação' : 'Workshop'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais usadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button className="btn-medical">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Novo Notebook
                </Button>
                <Button variant="outline">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Criar Projeto
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Supervisão
                </Button>
                {user?.role === 'mentor' && (
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Avaliar Estagiário
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 