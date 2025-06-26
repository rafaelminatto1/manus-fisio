'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Users, 
  Clock,
  Target,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  FileText
} from 'lucide-react'

// Types for real data
interface Project {
  id: string
  title: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  owner_id: string
  due_date?: string
  start_date?: string
  progress: number
  created_at: string
  updated_at: string
  owner?: {
    full_name: string
  }
  tasks_count?: number
  completed_tasks_count?: number
}

interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string
  due_date?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Mock data fallback
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Reabilitação Pós-Cirúrgica - João Silva',
    description: 'Protocolo de reabilitação após cirurgia de LCA',
    status: 'active',
    priority: 'high',
    owner_id: 'mock-user',
    due_date: '2024-02-15',
    start_date: '2024-01-10',
    progress: 58,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    owner: { full_name: 'Dr. Rafael Santos' },
    tasks_count: 12,
    completed_tasks_count: 7
  },
  {
    id: '2',
    title: 'Fisioterapia Neurológica - Ana Costa',
    description: 'Tratamento para hemiplegia pós-AVC',
    status: 'planning',
    priority: 'medium',
    owner_id: 'mock-user',
    due_date: '2024-02-28',
    start_date: '2024-01-15',
    progress: 25,
    created_at: '2024-01-08T09:15:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    owner: { full_name: 'Dra. Ana Silva' },
    tasks_count: 8,
    completed_tasks_count: 2
  }
]

const statusConfig = {
  planning: { label: 'Planejamento', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200', icon: Clock },
  active: { label: 'Ativo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Play },
  on_hold: { label: 'Em Espera', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Pause },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle }
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  urgent: { label: 'Urgente', color: 'bg-red-500 text-white' },
}

function ProjectCard({ project }: { project: Project }) {
  const statusInfo = statusConfig[project.status]
  const priorityInfo = priorityConfig[project.priority]
  const StatusIcon = statusInfo.icon

  const completionRate = project.tasks_count && project.tasks_count > 0 
    ? Math.round((project.completed_tasks_count || 0) / project.tasks_count * 100)
    : 0

  return (
    <Card className="hover:shadow-md transition-shadow mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className={priorityInfo.color}>
              {priorityInfo.label}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
        {project.description && (
          <CardDescription className="text-sm">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{project.completed_tasks_count || 0}/{project.tasks_count || 0} tarefas</span>
            {project.due_date && (
              <span>Vence em {new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>

        {/* Owner and dates */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {project.owner?.full_name || 'Sem responsável'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">
              {new Date(project.updated_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanColumn({ title, projects, status }: { title: string, projects: Project[], status: string }) {
  return (
    <div className="flex-1 min-w-80">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="ml-2">
              {projects.length}
            </Badge>
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3 min-h-96">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          
          {projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum projeto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    if (isMockMode || !user) {
      setLoading(false)
      return
    }

    loadProjects()
  }, [user, isMockMode])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          owner_id,
          due_date,
          start_date,
          progress,
          created_at,
          updated_at,
          owner:owner_id (
            full_name
          )
        `)
        .order('updated_at', { ascending: false })

      if (projectsError) {
        throw projectsError
      }

      // Get task counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          const [totalTasks, completedTasks] = await Promise.all([
            supabase.from('tasks').select('id', { count: 'exact' }).eq('project_id', project.id),
            supabase.from('tasks').select('id', { count: 'exact' }).eq('project_id', project.id).eq('status', 'done')
          ])

          return {
            ...project,
            tasks_count: totalTasks.count || 0,
            completed_tasks_count: completedTasks.count || 0
          }
        })
      )

      setProjects(projectsWithCounts)

    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Erro ao carregar projetos')
      // Fallback to mock data on error
      setProjects(mockProjects)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (isMockMode) {
      alert('Funcionalidade disponível com dados reais do Supabase')
      return
    }

    try {
      const newProject = {
        title: 'Novo Projeto',
        description: 'Descrição do projeto',
        status: 'planning' as const,
        priority: 'medium' as const,
        owner_id: user?.id,
        progress: 0
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single()

      if (error) throw error

      // Reload projects
      loadProjects()

      console.log('Project created:', data)
      
    } catch (err) {
      console.error('Error creating project:', err)
      setError('Erro ao criar projeto')
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const projectsByStatus = {
    planning: filteredProjects.filter(p => p.status === 'planning'),
    active: filteredProjects.filter(p => p.status === 'active'),
    on_hold: filteredProjects.filter(p => p.status === 'on_hold'),
    completed: filteredProjects.filter(p => p.status === 'completed'),
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie projetos e acompanhe o progresso da equipe
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-20 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie projetos e acompanhe o progresso da equipe
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button onClick={createProject}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Kanban Board */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            <KanbanColumn 
              title="Planejamento" 
              projects={projectsByStatus.planning} 
              status="planning"
            />
            <KanbanColumn 
              title="Ativo" 
              projects={projectsByStatus.active} 
              status="active"
            />
            <KanbanColumn 
              title="Em Espera" 
              projects={projectsByStatus.on_hold} 
              status="on_hold"
            />
            <KanbanColumn 
              title="Concluído" 
              projects={projectsByStatus.completed} 
              status="completed"
            />
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca'
                    : 'Crie seu primeiro projeto para começar a organizar o trabalho da equipe'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={createProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 