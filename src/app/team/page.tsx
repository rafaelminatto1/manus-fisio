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
  Mail,
  Phone,
  MapPin,
  MoreVertical
} from 'lucide-react'

// Types for real data
interface TeamMember {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'mentor' | 'intern' | 'guest'
  crefito?: string
  phone?: string
  specialty?: string
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
  created_at: string
  mentor?: TeamMember
  intern?: TeamMember
}

// Mock data fallback
const mockTeamMembers = [
  {
    id: '1',
    name: 'Dr. Rafael Santos',
    role: 'mentor',
    specialty: 'Fisioterapia Ortopédica',
    crefito: 'CREFITO-3/12345-F',
    email: 'rafael.santos@clinica.com',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    avatar: 'RS',
    status: 'active',
    experience: '15 anos',
    interns: ['Maria Silva', 'Pedro Alves'],
    completedSupervisions: 45,
    rating: 4.9,
    nextSession: '2024-01-16 14:00'
  },
  {
    id: '2',
    name: 'Dra. Ana Lima',
    role: 'mentor',
    specialty: 'Fisioterapia Neurológica',
    crefito: 'CREFITO-3/67890-F',
    email: 'ana.lima@clinica.com',
    phone: '(11) 88888-8888',
    location: 'São Paulo, SP',
    avatar: 'AL',
    status: 'active',
    experience: '12 anos',
    interns: ['Carlos Torres'],
    completedSupervisions: 38,
    rating: 4.8,
    nextSession: '2024-01-16 16:00'
  },
  {
    id: '3',
    name: 'Maria Silva',
    role: 'intern',
    specialty: 'Estagiária - 8º Semestre',
    university: 'USP - Universidade de São Paulo',
    email: 'maria.silva@usp.br',
    phone: '(11) 77777-7777',
    location: 'São Paulo, SP',
    avatar: 'MS',
    status: 'active',
    mentor: 'Dr. Rafael Santos',
    startDate: '2024-01-02',
    hoursCompleted: 180,
    hoursRequired: 400,
    progress: 45,
    nextEvaluation: '2024-01-20'
  },
  {
    id: '4',
    name: 'Pedro Alves',
    role: 'intern',
    specialty: 'Estagiário - 9º Semestre',
    university: 'UNIFESP - Universidade Federal de São Paulo',
    email: 'pedro.alves@unifesp.br',
    phone: '(11) 66666-6666',
    location: 'São Paulo, SP',
    avatar: 'PA',
    status: 'active',
    mentor: 'Dr. Rafael Santos',
    startDate: '2023-08-15',
    hoursCompleted: 350,
    hoursRequired: 400,
    progress: 87,
    nextEvaluation: '2024-01-25'
  },
  {
    id: '5',
    name: 'Carlos Torres',
    role: 'intern',
    specialty: 'Estagiário - 7º Semestre',
    university: 'PUC-SP - Pontifícia Universidade Católica',
    email: 'carlos.torres@pucsp.br',
    phone: '(11) 55555-5555',
    location: 'São Paulo, SP',
    avatar: 'CT',
    status: 'active',
    mentor: 'Dra. Ana Lima',
    startDate: '2024-01-08',
    hoursCompleted: 45,
    hoursRequired: 300,
    progress: 15,
    nextEvaluation: '2024-02-01'
  }
]

interface MentorType {
  id: string;
  name: string;
  role: string;
  specialty: string;
  crefito: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  status: string;
  experience: string;
  interns: string[];
  completedSupervisions?: number;
  rating: number;
  nextSession: string;
}

function MentorCard({ member }: { member: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-medical-500 flex items-center justify-center text-white font-semibold">
              {member.avatar}
            </div>
            <div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-success-100 text-success-800">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  Mentor
                </Badge>
                <span className="text-sm text-muted-foreground">{member.experience}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {member.specialty} • {member.crefito}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{member.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-medical-600">{member.interns.length}</div>
            <div className="text-xs text-muted-foreground">Estagiários</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-medical-600">{member.completedSupervisions}</div>
            <div className="text-xs text-muted-foreground">Supervisões</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-medical-600">{member.rating}</div>
            <div className="text-xs text-muted-foreground">Avaliação</div>
          </div>
        </div>

        {/* Next Session */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-medical-500" />
            <span className="text-sm font-medium">Próxima Supervisão</span>
          </div>
          <span className="text-sm">{member.nextSession}</span>
        </div>

        {/* Interns */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Estagiários Supervisionados</h4>
          <div className="space-y-1">
            {member.interns.map((intern: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <UserCheck className="h-3 w-3 text-success-500" />
                <span>{intern}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface InternType {
  id: string;
  name: string;
  role: string;
  specialty: string;
  university: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  status: string;
  mentor: string;
  startDate: string;
  hoursCompleted?: number;
  hoursRequired: number;
  progress: number;
  nextEvaluation: string;
}

function InternCard({ member }: { member: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-warning-500 flex items-center justify-center text-white font-semibold">
              {member.avatar}
            </div>
            <div>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-warning-100 text-warning-800">
                  <Users className="mr-1 h-3 w-3" />
                  Estagiário
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {member.specialty} • {member.university}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso do Estágio</span>
            <span>{member.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-warning-500 h-2 rounded-full transition-all"
              style={{ width: `${member.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{member.hoursCompleted}/{member.hoursRequired} horas</span>
            <span>Início: {member.startDate}</span>
          </div>
        </div>

        {/* Mentor */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-medical-500" />
            <span className="text-sm font-medium">Mentor</span>
          </div>
          <span className="text-sm">{member.mentor}</span>
        </div>

        {/* Next Evaluation */}
        <div className="flex items-center justify-between p-3 bg-medical-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-medical-500" />
            <span className="text-sm font-medium">Próxima Avaliação</span>
          </div>
          <span className="text-sm">{member.nextEvaluation}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{member.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [mentorships, setMentorships] = useState<Mentorship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    if (isMockMode || !user) {
      // Use mock data
      setTeamMembers(mockTeamMembers)
      setLoading(false)
      return
    }

    loadTeamData()
  }, [user, isMockMode])

  const loadTeamData = async () => {
    setLoading(true)
    try {
      // Mock data simples para demonstração
      const mockTeamData = [
        {
          id: '1',
          full_name: 'Dr. Maria Santos',
          email: 'maria.santos@clinic.com',
          role: 'mentor' as const,
          crefito: 'CREFITO-1 12345',
          phone: '(11) 99999-0001',
          specialty: 'Fisioterapia Neurológica',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2',
          full_name: 'Dr. João Silva',
          email: 'joao.silva@clinic.com',
          role: 'mentor' as const,
          crefito: 'CREFITO-1 12346',
          phone: '(11) 99999-0002',
          specialty: 'Fisioterapia Ortopédica',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '3',
          full_name: 'Ana Costa',
          email: 'ana.costa@student.com',
          role: 'intern' as const,
          phone: '(11) 99999-0003',
          specialty: 'Fisioterapia',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '4',
          full_name: 'Pedro Oliveira',
          email: 'pedro.oliveira@student.com',
          role: 'intern' as const,
          phone: '(11) 99999-0004',
          specialty: 'Fisioterapia',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ]
      
      setTeamMembers(mockTeamData)
    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Erro ao carregar dados da equipe')
    } finally {
      setLoading(false)
    }
  }

  const mentors = teamMembers.filter(member => member.role === 'mentor')
  const interns = teamMembers.filter(member => member.role === 'intern')

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
              <p className="text-muted-foreground mt-2">Carregando dados da equipe...</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4" />
                    <div className="h-3 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
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
              <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
              <p className="text-muted-foreground mt-2">Gestão de mentores e estagiários</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button className="btn-medical">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-medical-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mentors.length}</div>
                <div className="text-sm text-muted-foreground">Mentores Ativos</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Users className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{interns.length}</div>
                <div className="text-sm text-muted-foreground">Estagiários Ativos</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <Award className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mentors.reduce((sum, m) => sum + ((m as any).completedSupervisions || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Supervisões Realizadas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-100 rounded-lg">
                <Clock className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {interns.reduce((sum, i) => sum + ((i as any).hoursCompleted || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Horas de Estágio</div>
              </div>
            </div>
          </div>

          {/* Mentors Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-medical-500" />
                <h3 className="text-xl font-semibold">Mentores</h3>
                <Badge variant="secondary">{mentors.length}</Badge>
              </div>
              <Button variant="outline" size="sm">
                Gerenciar Mentores
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mentors.map(mentor => (
                <MentorCard key={mentor.id} member={mentor} />
              ))}
            </div>
          </section>

          {/* Interns Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-warning-500" />
                <h3 className="text-xl font-semibold">Estagiários</h3>
                <Badge variant="secondary">{interns.length}</Badge>
              </div>
              <Button variant="outline" size="sm">
                Gerenciar Estagiários
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {interns.map(intern => (
                <InternCard key={intern.id} member={intern} />
              ))}
            </div>
          </section>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 