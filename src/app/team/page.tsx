'use client'

import { useState } from 'react'
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

import { 
  useTeamMembersQuery, 
  useMentorshipsQuery, 
  useAddProgressNoteMutation, 
  useUpsertCompetencyMutation, 
  TeamMember, 
  Mentorship, 
  ProgressNote, 
  CompetencyEvaluation 
} from '@/hooks/use-team-data'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loading } from '@/components/ui/loading'

export default function TeamPage() {
  const { user } = useAuth()
  const { data: teamMembers, isLoading: isLoadingTeamMembers, error: teamMembersError } = useTeamMembersQuery()
  const { data: mentorships, isLoading: isLoadingMentorships, error: mentorshipsError } = useMentorshipsQuery()

  const addProgressNoteMutation = useAddProgressNoteMutation()
  const upsertCompetencyMutation = useUpsertCompetencyMutation()

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [showCompetencyModal, setShowCompetencyModal] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState<TeamMember | null>(null)

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

  const isLoading = isLoadingTeamMembers || isLoadingMentorships;
  const error = teamMembersError || mentorshipsError;

  const handleAddProgressNote = async () => {
    if (!selectedMentorship || !progressForm.content) return

    addProgressNoteMutation.mutate({
      mentorship_id: selectedMentorship.id,
      content: progressForm.content,
      achievements: progressForm.achievements.filter(a => a.trim()),
      next_steps: progressForm.next_steps.filter(s => s.trim()),
      feedback_type: progressForm.feedback_type,
    }, {
      onSuccess: () => {
        setProgressForm({
          content: '',
          achievements: [''],
          next_steps: [''],
          feedback_type: 'neutral'
        })
        setShowProgressForm(false)
      }
    })
  }

  const handleUpdateCompetency = async () => {
    if (!selectedMentorship || !competencyForm.competency) return

    // Find existing competency to update, or create new one
    const existingCompetency = selectedMentorship.competencies.find(c => c.competency === competencyForm.competency);

    if (existingCompetency) {
      upsertCompetencyMutation.mutate({
        mentorship_id: selectedMentorship.id,
        competency_id: existingCompetency.id,
        competency: competencyForm.competency,
        level: competencyForm.level,
        notes: competencyForm.notes,
      }, {
        onSuccess: () => {
          setCompetencyForm({
            competency: '',
            level: 1,
            notes: ''
          })
        }
      })
    } else {
      upsertCompetencyMutation.mutate({
        mentorship_id: selectedMentorship.id,
        competency: competencyForm.competency,
        level: competencyForm.level,
        notes: competencyForm.notes,
      }, {
        onSuccess: () => {
          setCompetencyForm({
            competency: '',
            level: 1,
            notes: ''
          })
        }
      })
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

  const getMentors = () => (teamMembers || []).filter(m => m.role === 'mentor')
  const getInterns = () => (teamMembers || []).filter(m => m.role === 'intern')

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards - Otimizado para mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Mentores</p>
                <p className="text-lg sm:text-2xl font-bold">{getMentors().length}</p>
              </div>
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Estagiários Ativos</p>
                <p className="text-lg sm:text-2xl font-bold">{getInterns().length}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Mentorias Ativas</p>
                <p className="text-lg sm:text-2xl font-bold">{(mentorships || []).filter(m => m.status === 'active').length}</p>
              </div>
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Taxa Conclusão</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {(mentorships || []).length > 0 ? Math.round(
                    (mentorships || []).reduce((acc, m) => acc + getProgressPercentage(m), 0) / (mentorships || []).length
                  ) : 0}%
                </p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentorships - Otimizado para mobile */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Mentorias Ativas</CardTitle>
          <CardDescription className="text-sm">Acompanhamento de estagiários em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {(mentorships || []).filter(m => m.status === 'active').map(mentorship => (
              <div key={mentorship.id} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                   onClick={() => setSelectedMentorship(mentorship)}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{mentorship.intern?.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        Mentor: {mentorship.mentor?.full_name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs sm:text-sm self-start sm:self-center">
                    {getProgressPercentage(mentorship)}% concluído
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Progresso: {mentorship.hours_completed}h / {mentorship.hours_required}h</span>
                    <span>{getProgressPercentage(mentorship)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(mentorship)} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {mentorship.competencies.slice(0, 2).map(comp => (
                    <Badge key={comp.id} className={`${getCompetencyLevel(comp.level).color} text-xs`}>
                      {comp.competency}: {getCompetencyLevel(comp.level).name}
                    </Badge>
                  ))}
                  {mentorship.competencies.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{mentorship.competencies.length - 2} mais</Badge>
                  )}
                </div>
              </div>
            ))}
            
            {(mentorships || []).filter(m => m.status === 'active').length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma mentoria ativa encontrada</p>
              </div>
            )}
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
                  <Button variant="outline" size="sm" className="w-full" onClick={() => {
                    setSelectedIntern(selectedMentorship?.intern ?? null)
                    setShowCompetencyModal(true)
                  }}>
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
                  <Button onClick={handleAddProgressNote}>Salvar Nota</Button>
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
        <div className="flex-1 space-y-4 p-4 sm:p-6">
          {/* Header - Otimizado para mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Equipe & Mentoria</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gerencie mentores, estagiários e acompanhe o progresso
              </p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Mentoria
            </Button>
          </div>

          {/* Tabs - Otimizado para mobile */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
              <TabsTrigger value="mentors" className="text-xs sm:text-sm">Mentores</TabsTrigger>
              <TabsTrigger value="interns" className="text-xs sm:text-sm">Estagiários</TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs sm:text-sm">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {selectedMentorship ? renderMentorshipDetails() : renderOverview()}
            </TabsContent>

            <TabsContent value="mentors" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getMentors().map(mentor => (
                  <Card key={mentor.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{mentor.full_name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm truncate">{mentor.specialty}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm"><strong>CREFITO:</strong> <span className="break-all">{mentor.crefito}</span></p>
                        <p className="text-xs sm:text-sm"><strong>Email:</strong> <span className="break-all">{mentor.email}</span></p>
                        <div className="pt-2">
                          <Badge variant="secondary" className="text-xs">
                            {mentorships.filter(m => m.mentor_id === mentor.id && m.status === 'active').length} estagiários ativos
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interns" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getInterns().map(intern => {
                  const mentorship = mentorships.find(m => m.intern_id === intern.id && m.status === 'active')
                  return (
                    <Card key={intern.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg truncate">{intern.full_name}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm truncate">{intern.university}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <p className="text-xs sm:text-sm"><strong>Semestre:</strong> {intern.semester}º</p>
                          <p className="text-xs sm:text-sm"><strong>Email:</strong> <span className="break-all">{intern.email}</span></p>
                          
                          {mentorship && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span>Progresso:</span>
                                <span>{getProgressPercentage(mentorship)}%</span>
                              </div>
                              <Progress value={getProgressPercentage(mentorship)} className="h-2" />
                              <Badge variant="outline" className="text-xs">
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

            <TabsContent value="evaluations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Avaliações de Competências</CardTitle>
                  <CardDescription className="text-sm">Histórico de avaliações e desenvolvimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentorships.map(mentorship => (
                      <div key={mentorship.id} className="p-3 sm:p-4 border rounded-lg">
                        <h4 className="font-semibold mb-3 text-sm sm:text-base">{mentorship.intern?.full_name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {mentorship.competencies.map(comp => (
                            <div key={comp.id} className="p-3 bg-muted rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs sm:text-sm font-medium truncate pr-2">{comp.competency}</span>
                                <Badge className={`${getCompetencyLevel(comp.level).color} text-xs flex-shrink-0`}>
                                  {comp.level}/5
                                </Badge>
                              </div>
                              <Progress value={comp.level * 20} className="h-2 mb-2" />
                              {comp.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{comp.notes}</p>
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