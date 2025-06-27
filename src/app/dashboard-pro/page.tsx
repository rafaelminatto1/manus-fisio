'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'
import { useAuth } from '@/hooks/use-auth'
import { 
  BookOpen, 
  Users, 
  FolderKanban, 
  Calendar,
  Crown,
  Sparkles,
  Rocket,
  Brain,
  Bell,
  Search,
  ArrowLeft,
  Lightbulb,
  Target,
  Shield,
  Zap,
  X,
  Palette,
  Bot,
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

export default function DashboardPro() {
  const { user } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState<string | null>(null)

  const stats = {
    notebooks: 24,
    projects: 12,
    activeInterns: 15,
    aiSuggestions: 8,
    automatedTasks: 34,
    complianceScore: 98
  }

  const aiInsights = [
    {
      id: '1',
      title: 'Oportunidade de Otimização',
      description: 'IA identificou padrão em 3 estagiários com dificuldades similares',
      suggestion: 'Criar workshop sobre avaliação postural',
      impact: 'Alto',
      confidence: 92
    },
    {
      id: '2',
      title: 'Previsão de Demanda',
      description: 'Aumento de 25% na demanda por supervisões previsto',
      suggestion: 'Ajustar cronograma da próxima semana',
      impact: 'Médio',
      confidence: 87
    }
  ]

  const analyticsMetrics = {
    projects_active: stats.projects,
    tasks_pending: 45,
    team_productivity: 87,
    compliance_score: stats.complianceScore,
    mentorship_progress: [
      { mentor_name: 'Dr. Rafael Santos', mentee_name: 'Ana Silva', progress: 85, competencies: 12 },
      { mentor_name: 'Dra. Maria Costa', mentee_name: 'João Oliveira', progress: 72, competencies: 8 }
    ]
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="relative p-6 border border-primary/10 rounded-lg bg-gradient-to-r from-primary/5 to-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard Clássico
                </Button>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Crown className="h-8 w-8 text-primary" />
                  Manus Fisio Pro
                  <Badge className="bg-gradient-to-r from-primary to-blue-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Avançado
                  </Badge>
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Dashboard com IA e funcionalidades avançadas para {user?.full_name?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowModal('search')}
                  variant="outline"
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Busca IA
                </Button>
                
                <Button
                  onClick={() => setShowModal('notifications')}
                  variant="outline"
                  size="sm"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                  <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">3</Badge>
                </Button>
                
                <Button
                  onClick={() => setShowModal('assistant')}
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-primary to-blue-600"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  IA Assistant
                </Button>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Insights da IA
                <Badge variant="secondary">{aiInsights.length} novos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-white dark:bg-slate-900 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant="outline" className={insight.impact === 'Alto' ? 'text-red-600' : 'text-orange-600'}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">Sugestão da IA</span>
                      </div>
                      <p className="text-xs text-primary/80">{insight.suggestion}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Confiança: {insight.confidence}%</span>
                      <Button variant="outline" size="sm" className="text-xs h-6">Aplicar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Notebooks IA
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{stats.notebooks}</div>
                <p className="text-xs text-blue-600">{stats.aiSuggestions} sugestões IA ativas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Projetos Auto
                  <FolderKanban className="h-4 w-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats.projects}</div>
                <p className="text-xs text-green-600">{stats.automatedTasks} tarefas automatizadas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Mentorias IA
                  <Users className="h-4 w-4 text-purple-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{stats.activeInterns}</div>
                <p className="text-xs text-purple-600">Acompanhamento inteligente</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  LGPD Score
                  <Shield className="h-4 w-4 text-orange-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{stats.complianceScore}%</div>
                <p className="text-xs text-orange-600">Monitoramento automático</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analytics Avançado com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>

          {/* Pro Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Ações Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Link href="/notebooks">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Protocolo IA</span>
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <FolderKanban className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Projeto Auto</span>
                  </Button>
                </Link>
                <Link href="/team">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Users className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Mentoria IA</span>
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6 text-orange-600" />
                    <span className="text-sm">Agenda Smart</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
            <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {showModal === 'search' && <><Search className="h-5 w-5" />Busca com IA</>}
                    {showModal === 'notifications' && <><Bell className="h-5 w-5" />Notificações Inteligentes</>}
                    {showModal === 'assistant' && <><Bot className="h-5 w-5" />IA Assistant</>}
                    <Badge variant="secondary">Demo</Badge>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowModal(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showModal === 'search' && (
                  <p className="text-muted-foreground">
                    Sistema de busca inteligente que compreende contexto e intenção. 
                    Encontre protocolos, projetos e informações usando linguagem natural.
                  </p>
                )}
                {showModal === 'notifications' && (
                  <p className="text-muted-foreground">
                    Sistema de notificações que aprende seus padrões e prioriza automaticamente 
                    as informações mais relevantes para você.
                  </p>
                )}
                {showModal === 'assistant' && (
                  <p className="text-muted-foreground">
                    Assistente de IA especializado em fisioterapia que pode ajudar com protocolos,
                    sugestões de exercícios, agendamentos e muito mais.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  )
} 