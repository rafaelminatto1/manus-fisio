'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  UserCheck,
  GraduationCap,
  Calendar,
  MessageSquare,
  Award,
  Clock,
  User,
  TrendingUp,
  Star,
  BookOpen,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// Interfaces expandidas
interface TeamMember {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'mentor' | 'intern' | 'guest'
  crefito?: string
  phone?: string
  specialty?: string
  university?: string
  semester?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Mentorship {
  id: string
  mentor_id: string
  intern_id: string
  status: 'active' | 'completed' | 'paused'
  start_date: string
  end_date?: string
  hours_completed: number
  hours_required: number
  goals: string[]
  competencies: CompetencyEvaluation[]
  notes: ProgressNote[]
  created_at: string
  mentor?: TeamMember
  intern?: TeamMember
}

interface CompetencyEvaluation {
  id: string
  competency: string
  level: 1 | 2 | 3 | 4 | 5 // 1-Iniciante, 2-Básico, 3-Intermediário, 4-Avançado, 5-Expert
  evaluation_date: string
  notes?: string
}

interface ProgressNote {
  id: string
  date: string
  content: string
  achievements: string[]
  next_steps: string[]
  feedback_type: 'positive' | 'improvement' | 'neutral'
  created_by: string
}

// Mock data expandido
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    full_name: 'Dr. Rafael Santos',
    email: 'rafael.santos@clinica.com',
    role: 'mentor',
    crefito: 'CREFITO-3/12345-F',
    specialty: 'Fisioterapia Ortopédica',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    full_name: 'Maria Silva',
    email: 'maria.silva@usp.br',
    role: 'intern',
    university: 'USP - Universidade de São Paulo',
    semester: 8,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockMentorships: Mentorship[] = [
  {
    id: '1',
    mentor_id: '1',
    intern_id: '2',
    status: 'active',
    start_date: '2024-01-02',
    hours_completed: 180,
    hours_required: 400,
    goals: [
      'Dominar técnicas de avaliação ortopédica',
      'Desenvolver habilidades de tratamento manual',
      'Aprender protocolos de reabilitação pós-cirúrgica'
    ],
    competencies: [
      {
        id: '1',
        competency: 'Avaliação Clínica',
        level: 3,
        evaluation_date: '2024-01-20',
        notes: 'Boa evolução na anamnese e exame físico'
      },
      {
        id: '2',
        competency: 'Técnicas Manuais',
        level: 2,
        evaluation_date: '2024-01-20',
        notes: 'Precisa praticar mais as mobilizações'
      }
    ],
    notes: [
      {
        id: '1',
        date: '2024-01-20',
        content: 'Excelente evolução na primeira semana. Demonstra interesse e dedicação.',
        achievements: ['Completou primeira avaliação supervisionada', 'Demonstrou boa comunicação com pacientes'],
        next_steps: ['Praticar técnicas de mobilização', 'Estudar protocolos específicos'],
        feedback_type: 'positive',
        created_by: '1'
      }
    ],
    created_at: '2024-01-02T00:00:00Z',
    mentor: mockTeamMembers[0],
    intern: mockTeamMembers[1]
  }
]

export default function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [mentorships, setMentorships] = useState<Mentorship[]>(mockMentorships)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null)
  const [showProgressForm, setShowProgressForm] = useState(false)

  // Form states
  const [progressForm, setProgressForm] = useState({
    content: '',
    achievements: [''],
    next_steps: [''],
    feedback_type: 'neutral' as ProgressNote['feedback_type']
  })

  const [competencyForm, setCompetencyForm] = useState({
    competency: '',
    level: 1 as CompetencyEvaluation['level'],
    notes: ''
  })

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  useEffect(() => {
    if (!isMockMode) {
      loadTeamData()
      loadMentorships()
    }
  }, [])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['mentor', 'intern'])
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMentorships = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select(`
          *,
          mentor:mentor_id(full_name, email, specialty),
          intern:intern_id(full_name, email, university, semester)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMentorships(data || [])
    } catch (error) {
      console.error('Erro ao carregar mentorias:', error)
    }
  }

  const addProgressNote = async () => {
    if (!selectedMentorship || !progressForm.content) return

    try {
      const newNote: ProgressNote = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        content: progressForm.content,
        achievements: progressForm.achievements.filter(a => a.trim()),
        next_steps: progressForm.next_steps.filter(s => s.trim()),
        feedback_type: progressForm.feedback_type,
        created_by: user?.id || 'mock-user'
      }

      if (isMockMode) {
        setMentorships(prev => prev.map(m => 
          m.id === selectedMentorship.id 
            ? { ...m, notes: [...m.notes, newNote] }
            : m
        ))
      } else {
        // Implementar salvamento no banco
      }

      setProgressForm({
        content: '',
        achievements: [''],
        next_steps: [''],
        feedback_type: 'neutral'
      })
      setShowProgressForm(false)
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
    }
  }

  const updateCompetency = async () => {
    if (!selectedMentorship || !competencyForm.competency) return

    try {
      const newCompetency: CompetencyEvaluation = {
        id: Date.now().toString(),
        competency: competencyForm.competency,
        level: competencyForm.level,
        evaluation_date: new Date().toISOString().split('T')[0],
        notes: competencyForm.notes
      }

      if (isMockMode) {
        setMentorships(prev => prev.map(m => 
          m.id === selectedMentorship.id 
            ? { 
                ...m, 
                competencies: m.competencies.some(c => c.competency === competencyForm.competency)
                  ? m.competencies.map(c => c.competency === competencyForm.competency ? newCompetency : c)
                  : [...m.competencies, newCompetency]
              }
            : m
        ))
      } else {
        // Implementar salvamento no banco
      }

      setCompetencyForm({
        competency: '',
        level: 1,
        notes: ''
      })
    } catch (error) {
      console.error('Erro ao atualizar competência:', error)
    }
  }

  const getProgressPercentage = (mentorship: Mentorship) => {
    return Math.round((mentorship.hours_completed / mentorship.hours_required) * 100)
  }

  const getCompetencyLevel = (level: number) => {
    const levels = {
      1: { name: 'Iniciante', color: 'bg-red-100 text-red-800' },
      2: { name: 'Básico', color: 'bg-orange-100 text-orange-800' },
      3: { name: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' },
      4: { name: 'Avançado', color: 'bg-blue-100 text-blue-800' },
      5: { name: 'Expert', color: 'bg-green-100 text-green-800' }
    }
    return levels[level as keyof typeof levels] || levels[1]
  }

  const getMentors = () => teamMembers.filter(m => m.role === 'mentor')
  const getInterns = () => teamMembers.filter(m => m.role === 'intern')

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mentores</p>
                <p className="text-2xl font-bold">{getMentors().length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estagiários Ativos</p>
                <p className="text-2xl font-bold">{getInterns().length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mentorias Ativas</p>
                <p className="text-2xl font-bold">{mentorships.filter(m => m.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    mentorships.reduce((acc, m) => acc + getProgressPercentage(m), 0) / mentorships.length
                  )}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentorships */}
      <Card>
        <CardHeader>
          <CardTitle>Mentorias Ativas</CardTitle>
          <CardDescription>Acompanhamento de estagiários em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentorships.filter(m => m.status === 'active').map(mentorship => (
              <div key={mentorship.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                   onClick={() => setSelectedMentorship(mentorship)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{mentorship.intern?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Mentor: {mentorship.mentor?.full_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {getProgressPercentage(mentorship)}% concluído
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso: {mentorship.hours_completed}h / {mentorship.hours_required}h</span>
                    <span>{getProgressPercentage(mentorship)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(mentorship)} className="h-2" />
                </div>

                <div className="flex gap-2 mt-3">
                  {mentorship.competencies.slice(0, 3).map(comp => (
                    <Badge key={comp.id} className={getCompetencyLevel(comp.level).color}>
                      {comp.competency}: {getCompetencyLevel(comp.level).name}
                    </Badge>
                  ))}
                  {mentorship.competencies.length > 3 && (
                    <Badge variant="outline">+{mentorship.competencies.length - 3} mais</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMentorshipDetails = () => {
    if (!selectedMentorship) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{selectedMentorship.intern?.full_name}</h3>
            <p className="text-muted-foreground">
              Mentoria com {selectedMentorship.mentor?.full_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowProgressForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Nota
            </Button>
            <Button variant="outline" onClick={() => setSelectedMentorship(null)}>
              Voltar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Horas Concluídas</span>
                    <span>{selectedMentorship.hours_completed}h / {selectedMentorship.hours_required}h</span>
                  </div>
                  <Progress value={getProgressPercentage(selectedMentorship)} />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Objetivos:</p>
                  {selectedMentorship.goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {goal}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competencies */}
          <Card>
            <CardHeader>
              <CardTitle>Competências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedMentorship.competencies.map(comp => (
                  <div key={comp.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{comp.competency}</span>
                      <Badge className={getCompetencyLevel(comp.level).color}>
                        {getCompetencyLevel(comp.level).name}
                      </Badge>
                    </div>
                    <Progress value={comp.level * 20} className="h-1" />
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Avaliar Competência
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Anotações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedMentorship.notes.slice(0, 3).map(note => (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{note.date}</span>
                      <Badge variant={
                        note.feedback_type === 'positive' ? 'default' :
                        note.feedback_type === 'improvement' ? 'destructive' : 'secondary'
                      }>
                        {note.feedback_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedMentorship.notes.map(note => (
                <div key={note.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{note.date}</span>
                    <Badge variant={
                      note.feedback_type === 'positive' ? 'default' :
                      note.feedback_type === 'improvement' ? 'destructive' : 'secondary'
                    }>
                      {note.feedback_type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm mb-3">{note.content}</p>
                  
                  {note.achievements.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-700 mb-1">Conquistas:</p>
                      <ul className="text-sm text-green-600 space-y-1">
                        {note.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {note.next_steps.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Próximos Passos:</p>
                      <ul className="text-sm text-blue-600 space-y-1">
                        {note.next_steps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Form Modal */}
        {showProgressForm && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <CardContent className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Nova Nota de Progresso</CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Observações</label>
                  <Textarea
                    value={progressForm.content}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Descreva o progresso do estagiário..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Feedback</label>
                  <Select 
                    value={progressForm.feedback_type} 
                    onValueChange={(value) => setProgressForm(prev => ({ ...prev, feedback_type: value as ProgressNote['feedback_type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="improvement">Precisa Melhorar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Conquistas</label>
                  {progressForm.achievements.map((achievement, index) => (
                    <Input
                      key={index}
                      value={achievement}
                      onChange={(e) => {
                        const newAchievements = [...progressForm.achievements]
                        newAchievements[index] = e.target.value
                        setProgressForm(prev => ({ ...prev, achievements: newAchievements }))
                      }}
                      placeholder="Descreva uma conquista..."
                      className="mb-2"
                    />
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProgressForm(prev => ({ ...prev, achievements: [...prev.achievements, ''] }))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Conquista
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Próximos Passos</label>
                  {progressForm.next_steps.map((step, index) => (
                    <Input
                      key={index}
                      value={step}
                      onChange={(e) => {
                        const newSteps = [...progressForm.next_steps]
                        newSteps[index] = e.target.value
                        setProgressForm(prev => ({ ...prev, next_steps: newSteps }))
                      }}
                      placeholder="Próximo objetivo..."
                      className="mb-2"
                    />
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setProgressForm(prev => ({ ...prev, next_steps: [...prev.next_steps, ''] }))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Próximo Passo
                  </Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowProgressForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addProgressNote}>
                    Salvar Nota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Equipe & Mentoria</h2>
              <p className="text-muted-foreground">
                Gerencie mentores, estagiários e acompanhe o progresso
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Mentoria
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="mentors">Mentores</TabsTrigger>
              <TabsTrigger value="interns">Estagiários</TabsTrigger>
              <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {selectedMentorship ? renderMentorshipDetails() : renderOverview()}
            </TabsContent>

            <TabsContent value="mentors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getMentors().map(mentor => (
                  <Card key={mentor.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                          <CardDescription>{mentor.specialty}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>CREFITO:</strong> {mentor.crefito}</p>
                        <p className="text-sm"><strong>Email:</strong> {mentor.email}</p>
                        <div className="pt-2">
                          <Badge variant="secondary">
                            {mentorships.filter(m => m.mentor_id === mentor.id && m.status === 'active').length} estagiários ativos
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interns">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getInterns().map(intern => {
                  const mentorship = mentorships.find(m => m.intern_id === intern.id && m.status === 'active')
                  return (
                    <Card key={intern.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{intern.full_name}</CardTitle>
                            <CardDescription>{intern.university}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm"><strong>Semestre:</strong> {intern.semester}º</p>
                          <p className="text-sm"><strong>Email:</strong> {intern.email}</p>
                          
                          {mentorship && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso:</span>
                                <span>{getProgressPercentage(mentorship)}%</span>
                              </div>
                              <Progress value={getProgressPercentage(mentorship)} className="h-2" />
                              <Badge variant="outline">
                                Mentor: {mentorship.mentor?.full_name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle>Avaliações de Competências</CardTitle>
                  <CardDescription>Histórico de avaliações e desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentorships.map(mentorship => (
                      <div key={mentorship.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3">{mentorship.intern?.full_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {mentorship.competencies.map(comp => (
                            <div key={comp.id} className="p-3 bg-muted rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">{comp.competency}</span>
                                <Badge className={getCompetencyLevel(comp.level).color}>
                                  {comp.level}/5
                                </Badge>
                              </div>
                              <Progress value={comp.level * 20} className="h-2 mb-2" />
                              {comp.notes && (
                                <p className="text-xs text-muted-foreground">{comp.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 