'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth-fixed' // CORREÇÃO: Usar o hook refatorado
import { supabase } from '@/lib/supabase/client' // CORREÇÃO: Importar a instância do cliente
import { isMockMode as checkIsMockMode } from '@/lib/auth' // Renomeado para evitar conflito
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

export default function ProjectsPageNew() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isMockMode = checkIsMockMode() || !process.env.NEXT_PUBLIC_SUPABASE_URL

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

      setProjects(
        (projectsData || []).map((project: any) => ({
          ...project,
          owner: Array.isArray(project.owner) ? project.owner[0] : project.owner
        }))
      )

    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Erro ao carregar projetos')
      setProjects(mockProjects)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projetos (Dados Reais)</h1>
              <p className="text-muted-foreground mt-2">
                Conectado ao Supabase - {projects.length} projetos
              </p>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div>Carregando projetos...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Badge>{project.status}</Badge>
                      <Badge variant="outline">{project.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Por: {project.owner?.full_name || 'Sem responsável'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 