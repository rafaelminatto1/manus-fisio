import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Interfaces expandidas (duplicadas para evitar dependência circular, idealmente em um types/projects.ts)
export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  progress: number;
  budget?: number;
  category: 'clinical' | 'research' | 'education' | 'administrative';
  created_by: string;
  created_at: string;
  updated_at: string;
  owner?: TeamMember;
  collaborators?: ProjectCollaborator[];
  tasks?: Task[];
  tags?: string[];
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  order_index: number;
  dependencies?: string[];
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee?: TeamMember;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface ProjectCollaborator {
  project_id: string;
  user_id: string;
  permission: 'read' | 'write' | 'admin';
  user?: TeamMember;
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_this_month: number;
  overdue_projects: number;
  team_productivity: number;
  average_completion_time: number;
}

// Mock data fallback
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Protocolo de Reabilitação Pós-COVID',
    description: 'Desenvolvimento de protocolo específico para pacientes em recuperação de COVID-19',
    status: 'active',
    priority: 'high',
    due_date: '2024-03-15',
    progress: 65,
    budget: 15000,
    category: 'clinical',
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    tags: ['covid', 'reabilitação', 'protocolo'],
    owner: {
      id: '1',
      full_name: 'Dr. Rafael Minatto',
      email: 'rafael.minatto@yahoo.com.br',
      role: 'admin'
    }
  },
  {
    id: '2',
    title: 'Estudo de Caso - Fisioterapia Respiratória',
    description: 'Análise de casos clínicos para desenvolvimento de metodologia',
    status: 'planning',
    priority: 'medium',
    due_date: '2024-04-30',
    progress: 25,
    budget: 8000,
    category: 'research',
    created_by: '2',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
    tags: ['pesquisa', 'respiratória'],
    owner: {
      id: '2',
      full_name: 'Dra. Ana Silva',
      email: 'ana.silva@clinica.com',
      role: 'mentor'
    }
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Revisão bibliográfica sobre COVID-19',
    description: 'Pesquisar artigos científicos mais recentes sobre reabilitação pós-COVID',
    status: 'done',
    priority: 'high',
    assigned_to: '3',
    due_date: '2024-01-30',
    estimated_hours: 20,
    actual_hours: 18,
    order_index: 0,
    checklist: [
      { id: '1', text: 'Buscar artigos PubMed', completed: true },
      { id: '2', text: 'Analisar 50 artigos', completed: true },
      { id: '3', text: 'Criar resumo executivo', completed: false }
    ],
    created_by: '1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
    assignee: {
      id: '3',
      full_name: 'Maria Santos',
      email: 'maria.santos@univ.edu',
      role: 'intern'
    }
  },
  {
    id: '2',
    project_id: '1',
    title: 'Elaborar protocolo de exercícios',
    description: 'Desenvolver sequência de exercícios específicos para reabilitação pulmonar',
    status: 'in_progress',
    priority: 'high',
    assigned_to: '1',
    due_date: '2024-02-15',
    estimated_hours: 40,
    actual_hours: 25,
    order_index: 1,
    dependencies: ['1'],
    created_by: '1',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-30T00:00:00Z',
    assignee: {
      id: '1',
      full_name: 'Dr. Rafael Minatto',
      email: 'rafael.minatto@yahoo.com.br',
      role: 'admin'
    }
  }
];

const mockStats: ProjectStats = {
  total_projects: 12,
  active_projects: 6,
  completed_this_month: 3,
  overdue_projects: 2,
  team_productivity: 87.5,
  average_completion_time: 21
};

const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Hook para buscar projetos
export function useProjectsQuery() {
  return useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (isMockMode) {
        console.warn('Fetching mock projects data.');
        return mockProjects;
      }
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:users!projects_created_by_fkey(full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Erro ao carregar projetos: ' + error.message);
        throw error;
      }
      return data as Project[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar tarefas
export function useTasksQuery() {
  return useQuery<Task[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (isMockMode) {
        console.warn('Fetching mock tasks data.');
        return mockTasks;
      }
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(full_name, email, role)
        `)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Erro ao carregar tarefas: ' + error.message);
        throw error;
      }
      return data as Task[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar estatísticas de projetos
export function useProjectStatsQuery() {
  return useQuery<ProjectStats, Error>({
    queryKey: ['projectStats'],
    queryFn: async () => {
      if (isMockMode) {
        console.warn('Fetching mock project stats data.');
        return mockStats;
      }
      const { data, error } = await supabase.rpc('get_project_stats');

      if (error) {
        console.error('Error fetching project stats:', error);
        toast.error('Erro ao carregar estatísticas de projetos: ' + error.message);
        throw error;
      }
      return data as ProjectStats;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
