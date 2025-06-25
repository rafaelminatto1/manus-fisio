import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Play
} from 'lucide-react'

// Mock data para demonstração
const projects = [
  {
    id: '1',
    title: 'Reabilitação Pós-Cirúrgica - João Silva',
    description: 'Protocolo de reabilitação após cirurgia de LCA',
    status: 'active',
    priority: 'high',
    dueDate: '2024-02-15',
    assignees: ['Dr. Santos', 'Maria Oliveira'],
    tasksTotal: 12,
    tasksCompleted: 7,
    progress: 58
  },
  {
    id: '2',
    title: 'Fisioterapia Neurológica - Ana Costa',
    description: 'Tratamento para hemiplegia pós-AVC',
    status: 'planning',
    priority: 'medium',
    dueDate: '2024-02-28',
    assignees: ['Dr. Silva', 'Pedro Alves'],
    tasksTotal: 8,
    tasksCompleted: 2,
    progress: 25
  },
  {
    id: '3',
    title: 'Programa de Prevenção Escolar',
    description: 'Programa de ergonomia e prevenção para estudantes',
    status: 'on_hold',
    priority: 'low',
    dueDate: '2024-03-10',
    assignees: ['Dra. Lima'],
    tasksTotal: 15,
    tasksCompleted: 5,
    progress: 33
  },
  {
    id: '4',
    title: 'Pesquisa - Dor Lombar Crônica',
    description: 'Estudo comparativo de técnicas de tratamento',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-30',
    assignees: ['Dr. Santos', 'Ana Silva', 'Carlos Torres'],
    tasksTotal: 20,
    tasksCompleted: 20,
    progress: 100
  }
]

const statusConfig = {
  planning: { label: 'Planejamento', color: 'bg-slate-100 text-slate-800', icon: Clock },
  active: { label: 'Ativo', color: 'bg-medical-100 text-medical-800', icon: Play },
  on_hold: { label: 'Em Espera', color: 'bg-warning-100 text-warning-800', icon: Pause },
  completed: { label: 'Concluído', color: 'bg-success-100 text-success-800', icon: CheckCircle2 },
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Média', color: 'bg-warning-100 text-warning-700' },
  high: { label: 'Alta', color: 'bg-error-100 text-error-700' },
  urgent: { label: 'Urgente', color: 'bg-error-500 text-white' },
}

interface ProjectType {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignees: string[];
  tasksTotal: number;
  tasksCompleted: number;
  progress: number;
}

function ProjectCard({ project }: { project: ProjectType }) {
  const statusInfo = statusConfig[project.status as keyof typeof statusConfig]
  const priorityInfo = priorityConfig[project.priority as keyof typeof priorityConfig]
  const StatusIcon = statusInfo.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
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
        <CardDescription className="text-sm">
          {project.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-medical-500 h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{project.tasksCompleted}/{project.tasksTotal} tarefas</span>
            <span>Vence em {project.dueDate}</span>
          </div>
        </div>

        {/* Assignees */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {project.assignees.length} membro{project.assignees.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex -space-x-2">
            {project.assignees.slice(0, 3).map((assignee: string, index: number) => (
              <div 
                key={index}
                className="w-8 h-8 rounded-full bg-medical-500 border-2 border-background flex items-center justify-center text-xs font-medium text-white"
              >
                {assignee.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {project.assignees.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{project.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  const projectsByStatus = {
    planning: projects.filter(p => p.status === 'planning'),
    active: projects.filter(p => p.status === 'active'),
    on_hold: projects.filter(p => p.status === 'on_hold'),
    completed: projects.filter(p => p.status === 'completed'),
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="sidebar w-64 p-4">
        <div className="flex items-center gap-2 mb-8">
          <Target className="h-8 w-8 text-medical-500" />
          <h1 className="text-xl font-bold text-foreground">Manus Fisio</h1>
        </div>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Target className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="default" className="w-full justify-start" size="sm">
            <Target className="mr-2 h-4 w-4" />
            Projetos
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Tarefas
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Equipe
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="navbar p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Projetos Clínicos</h2>
              <p className="text-muted-foreground">Gerencie projetos de reabilitação e pesquisa</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button className="btn-medical">
                <Plus className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </div>
          </div>
        </header>

        {/* Kanban Board */}
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {/* Planning Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold">Planejamento</h3>
                  <Badge variant="secondary">{projectsByStatus.planning.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {projectsByStatus.planning.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Active Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-medical-500" />
                  <h3 className="font-semibold">Ativo</h3>
                  <Badge variant="secondary">{projectsByStatus.active.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {projectsByStatus.active.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* On Hold Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pause className="h-5 w-5 text-warning-500" />
                  <h3 className="font-semibold">Em Espera</h3>
                  <Badge variant="secondary">{projectsByStatus.on_hold.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {projectsByStatus.on_hold.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                  <h3 className="font-semibold">Concluído</h3>
                  <Badge variant="secondary">{projectsByStatus.completed.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {projectsByStatus.completed.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 