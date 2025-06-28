'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { 
  FolderKanban, 
  Plus, 
  Calendar,
  Clock,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  User,
  Edit,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  Archive,
  Download
} from 'lucide-react'
import { format, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useProjectsQuery, useTasksQuery, useProjectStatsQuery, Project, Task, ProjectStats, TeamMember } from '@/hooks/use-projects-data'
import { useCreateProjectMutation, useUpdateProjectMutation, useCreateTaskMutation, useUpdateTaskMutation } from '@/hooks/use-project-mutations'
import { Loading } from '@/components/ui/loading'

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-slate-100 border-slate-300' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-blue-100 border-blue-300' },
  { id: 'review', title: 'Em Revisão', color: 'bg-orange-100 border-orange-300' },
  { id: 'done', title: 'Concluído', color: 'bg-green-100 border-green-300' }
]

// Componente Task Sortable
function SortableTask({ task, onClick }: { task: Task; onClick: (task: Task) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isOverdue = task.due_date && isAfter(new Date(), new Date(task.due_date))

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-card border rounded-lg cursor-grab hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
        <div className="flex gap-1">
          <Badge className={getPriorityColor(task.priority)} variant="outline">
            {task.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive">
              Atrasado
            </Badge>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.checklist && task.checklist.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">
              {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
            </span>
          </div>
          <Progress 
            value={(task.checklist.filter(item => item.completed).length / task.checklist.length) * 100} 
            className="h-1 mt-1" 
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {task.assignee.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
          {task.estimated_hours && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.actual_hours}h/{task.estimated_hours}h
            </div>
          )}
        </div>

        {task.due_date && (
          <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
            {format(new Date(task.due_date), 'dd/MM')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useProjectsQuery()
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = useTasksQuery()
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useProjectStatsQuery()

  const createProjectMutation = useCreateProjectMutation()
  const updateProjectMutation = useUpdateProjectMutation()
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    due_date: '',
    category: 'clinical' as Project['category'],
    budget: 0,
    tags: [] as string[]
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assigned_to: '',
    due_date: '',
    estimated_hours: 0,
    project_id: ''
  })

  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingStats;
  const error = projectsError || tasksError || statsError;

  const createProject = async () => {
    if (!projectForm.title) return
    createProjectMutation.mutate(projectForm, {
      onSuccess: () => {
        setShowProjectForm(false)
        resetProjectForm()
      }
    })
  }

  const createTask = async () => {
    if (!taskForm.title || !taskForm.project_id) return
    createTaskMutation.mutate({
      ...taskForm,
      actual_hours: 0,
      order_index: (tasks || []).filter(t => t.status === taskForm.status).length,
      created_by: user?.id || 'mock-user' // Fallback for mock mode
    }, {
      onSuccess: () => {
        setShowTaskForm(false)
        resetTaskForm()
      }
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = (tasks || []).find(t => t.id === event.active.id)
    setDraggedTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !draggedTask) return

    const newStatus = over.id as Task['status']
    
    if (draggedTask.status !== newStatus) {
      updateTaskMutation.mutate({
        id: draggedTask.id,
        status: newStatus,
        updated_at: new Date().toISOString() // Update timestamp
      })
    }

    setDraggedTask(null)
  }

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      due_date: '',
      category: 'clinical',
      budget: 0,
      tags: []
    })
  }

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      estimated_hours: 0,
      project_id: ''
    })
  }

  const getProjectProgress = (projectId: string) => {
    const projectTasks = (tasks || []).filter(t => t.project_id === projectId)
    if (projectTasks.length === 0) return 0
    const completedTasks = projectTasks.filter(t => t.status === 'done').length
    return Math.round((completedTasks / projectTasks.length) * 100)
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const isProjectOverdue = (project: Project) => {
    return project.due_date && isAfter(new Date(), new Date(project.due_date)) && project.status !== 'completed'
  }

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projetos</p>
              <p className="text-2xl font-bold">{stats?.total_projects}</p>
            </div>
            <FolderKanban className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
              <p className="text-2xl font-bold">{stats?.active_projects}</p>
            </div>
            <Play className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Concluídos/Mês</p>
              <p className="text-2xl font-bold">{stats?.completed_this_month}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
              <p className="text-2xl font-bold">{stats?.overdue_projects}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produtividade</p>
              <p className="text-2xl font-bold">{stats?.team_productivity}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
              <p className="text-2xl font-bold">{stats?.average_completion_time}d</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderKanbanView = () => (
    <DndContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = (tasks || []).filter(task => task.status === column.id)
          
          return (
            <div key={column.id} className={`rounded-lg border-2 border-dashed p-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{columnTasks.length}</Badge>
              </div>
              
              <SortableContext 
                items={columnTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {columnTasks.map(task => (
                    <SortableTask 
                      key={task.id} 
                      task={task} 
                      onClick={setSelectedTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>
      
      <DragOverlay>
        {draggedTask && (
          <div className="p-3 bg-card border rounded-lg shadow-lg opacity-90">
            <h4 className="text-sm font-medium">{draggedTask.title}</h4>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )

  const renderProjectCard = (project: Project) => (
    <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedProject(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
              <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
              {isProjectOverdue(project) && (
                <Badge variant="destructive">Atrasado</Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{getProjectProgress(project.id)}%</span>
          </div>
          <Progress value={getProjectProgress(project.id)} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{(tasks || []).filter(t => t.project_id === project.id).length} tarefas</span>
          </div>
          {project.due_date && (
            <div className={`flex items-center gap-1 ${isProjectOverdue(project) ? 'text-red-600' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              {format(new Date(project.due_date), 'dd/MM/yyyy')}
            </div>
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.owner && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {project.owner.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-xs text-muted-foreground">
              {project.owner?.full_name}
            </span>
          </div>
          
          {project.budget && (
            <span className="text-xs text-muted-foreground">
              R$ {project.budget.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Projetos</h2>
              <p className="text-muted-foreground">
                Gerencie projetos clínicos, pesquisas e iniciativas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Select>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Filtrar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(projects || []).map(renderProjectCard)}
              </div>
            </TabsContent>

            <TabsContent value="kanban">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Quadro Kanban</h3>
                  <Button onClick={() => setShowTaskForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Tarefa
                  </Button>
                </div>
                {renderKanbanView()}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline dos Projetos</CardTitle>
                  <CardDescription>Visualização temporal dos projetos e marcos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(projects || [])
                      .filter(p => p.due_date)
                      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                      .map(project => (
                        <div key={project.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className={`w-4 h-4 rounded-full ${getPriorityColor(project.priority)}`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Prazo: {format(new Date(project.due_date), 'PPP', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getProjectProgress(project.id)}% concluído
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['planning', 'active', 'on_hold', 'completed', 'cancelled'].map(status => {
                        const count = (projects || []).filter(p => p.status === status).length
                        const percentage = (projects || []).length > 0 ? (count / (projects || []).length) * 100 : 0
                        return (
                          <div key={status} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{status}</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['clinical', 'research', 'education', 'administrative'].map(category => {
                        const count = (projects || []).filter(p => p.category === category).length
                        const percentage = (projects || []).length > 0 ? (count / (projects || []).length) * 100 : 0
                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span>{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}