'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'
import { 
  ArrowLeft, 
  FolderPlus, 
  Stethoscope, 
  GraduationCap, 
  FileSearch,
  Users,
  Calendar as CalendarIcon,
  Target,
  DollarSign,
  Tag,
  Save,
  Sparkles,
  Activity,
  Heart,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useCreateProjectMutation } from '@/hooks/use-project-mutations'

// Templates específicos para projetos de fisioterapia
const PROJECT_TEMPLATES = [
  {
    id: 'protocolo-reabilitacao',
    name: 'Protocolo de Reabilitação',
    description: 'Desenvolvimento de protocolos específicos para diferentes condições',
    icon: Activity,
    category: 'clinical',
    priority: 'high',
    estimated_hours: 120,
    tasks: [
      'Revisão bibliográfica sobre a condição',
      'Análise de evidências científicas',
      'Desenvolvimento do protocolo inicial',
      'Validação com equipe multidisciplinar',
      'Teste piloto com pacientes',
      'Refinamento baseado nos resultados',
      'Documentação final e aprovação'
    ]
  },
  {
    id: 'supervisao-estagiarios',
    name: 'Programa de Supervisão de Estagiários',
    description: 'Estruturação do programa de supervisão e mentoria de estagiários',
    icon: GraduationCap,
    category: 'education',
    priority: 'medium',
    estimated_hours: 80,
    tasks: [
      'Definição de objetivos de aprendizagem',
      'Criação de cronograma de atividades',
      'Desenvolvimento de ferramentas de avaliação',
      'Treinamento de supervisores',
      'Implementação do programa piloto',
      'Coleta de feedback dos estagiários',
      'Ajustes e melhorias no programa'
    ]
  },
  {
    id: 'pesquisa-clinica',
    name: 'Pesquisa Clínica',
    description: 'Desenvolvimento de projeto de pesquisa clínica em fisioterapia',
    icon: FileSearch,
    category: 'research',
    priority: 'high',
    estimated_hours: 200,
    tasks: [
      'Formulação da questão de pesquisa',
      'Revisão sistemática da literatura',
      'Desenvolvimento do protocolo de pesquisa',
      'Submissão ao comitê de ética',
      'Recrutamento de participantes',
      'Coleta de dados',
      'Análise estatística',
      'Redação do artigo científico',
      'Submissão para publicação'
    ]
  },
  {
    id: 'melhoria-qualidade',
    name: 'Projeto de Melhoria da Qualidade',
    description: 'Implementação de melhorias nos processos de atendimento',
    icon: Target,
    category: 'administrative',
    priority: 'medium',
    estimated_hours: 60,
    tasks: [
      'Identificação de oportunidades de melhoria',
      'Análise de processos atuais',
      'Definição de indicadores de qualidade',
      'Desenvolvimento de plano de ação',
      'Implementação das melhorias',
      'Monitoramento de resultados',
      'Padronização das boas práticas'
    ]
  },
  {
    id: 'educacao-continuada',
    name: 'Programa de Educação Continuada',
    description: 'Desenvolvimento de programa de capacitação da equipe',
    icon: Brain,
    category: 'education',
    priority: 'medium',
    estimated_hours: 100,
    tasks: [
      'Levantamento de necessidades de capacitação',
      'Planejamento do programa educacional',
      'Desenvolvimento de material didático',
      'Agendamento de palestras e workshops',
      'Execução das atividades educativas',
      'Avaliação da efetividade do programa',
      'Certificação dos participantes'
    ]
  },
  {
    id: 'estudo-caso',
    name: 'Estudo de Caso Multicêntrico',
    description: 'Documentação e análise de casos clínicos complexos',
    icon: Heart,
    category: 'research',
    priority: 'low',
    estimated_hours: 40,
    tasks: [
      'Seleção de casos relevantes',
      'Coleta de dados clínicos',
      'Documentação fotográfica (quando aplicável)',
      'Análise do desfecho terapêutico',
      'Redação do estudo de caso',
      'Revisão por pares',
      'Apresentação em eventos científicos'
    ]
  }
]

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createProjectMutation = useCreateProjectMutation()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [status, setStatus] = useState<'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'>('planning')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [category, setCategory] = useState<'clinical' | 'research' | 'education' | 'administrative'>('clinical')
  const [dueDate, setDueDate] = useState<Date>()
  const [budget, setBudget] = useState('')
  const [tags, setTags] = useState('')

  const handleCreateProject = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)
    
    try {
      const project = await createProjectMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        category,
        due_date: dueDate?.toISOString(),
        budget: budget ? parseFloat(budget) : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })

      // Se tem template selecionado, criar tarefas automaticamente
      if (template && template.tasks.length > 0) {
        // TODO: Criar tarefas automáticas baseadas no template
        // Isso será implementado quando o hook de criação de tarefas estiver disponível
      }

      toast.success('Projeto criado com sucesso!')
      router.push(`/projects/${project.id}`)
    } catch (error) {
      toast.error('Erro ao criar projeto')
      console.error('Error creating project:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clinical': return 'bg-blue-100 text-blue-800'
      case 'research': return 'bg-purple-100 text-purple-800'
      case 'education': return 'bg-green-100 text-green-800'
      case 'administrative': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'clinical': return 'Clínico'
      case 'research': return 'Pesquisa'
      case 'education': return 'Educação'
      case 'administrative': return 'Administrativo'
      default: return 'Geral'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Projeto</h1>
              <p className="text-muted-foreground">
                Crie um projeto usando templates específicos para fisioterapia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      placeholder="Ex: Protocolo de Reabilitação Pós-Cirúrgica"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      placeholder="Descreva os objetivos e escopo do projeto..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planejamento</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="on_hold">Em Espera</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Prioridade</label>
                      <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Categoria</label>
                      <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinical">Clínico</SelectItem>
                          <SelectItem value="research">Pesquisa</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="administrative">Administrativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Data de Entrega</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full mt-1 justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Orçamento (R$)</label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <div className="relative mt-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ortopedia, neurologia, cardiologia"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Templates de Projeto
                  </CardTitle>
                  <CardDescription>
                    Escolha um template para começar com tarefas e estrutura predefinidas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {PROJECT_TEMPLATES.map((template) => {
                      const Icon = template.icon
                      return (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedTemplate(template.id)
                            // Auto-fill some fields based on template
                            if (!title) setTitle(template.name)
                            setPriority(template.priority as any)
                            setCategory(template.category as any)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{template.name}</h3>
                                <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                                  {getCategoryName(template.category)}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(template.priority)}`}>
                                  {template.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>📅 {template.estimated_hours}h estimadas</span>
                                <span>📋 {template.tasks.length} tarefas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Opção em branco */}
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === '' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate('')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FolderPlus className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1">Projeto em Branco</h3>
                          <p className="text-sm text-muted-foreground">
                            Comece com um projeto vazio e adicione tarefas conforme necessário
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateProject}
                  disabled={!title.trim() || createProjectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createProjectMutation.isPending ? 'Criando...' : 'Criar Projeto'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Preview do Template</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      {(() => {
                        const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate)
                        if (!template) return null
                        const Icon = template.icon
                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">{template.name}</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                              <div className="flex gap-2">
                                <Badge className={getCategoryColor(template.category)}>
                                  {getCategoryName(template.category)}
                                </Badge>
                                <Badge className={getPriorityColor(template.priority)}>
                                  {template.priority}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Tarefas Incluídas:</h4>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {template.tasks.map((task, index) => (
                                  <div key={index} className="text-xs p-2 bg-gray-50 rounded text-muted-foreground">
                                    {index + 1}. {task}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderPlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Selecione um template para ver o preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 