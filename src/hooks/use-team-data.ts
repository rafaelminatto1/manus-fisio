import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/auth';
import { toast } from 'sonner';

// Interfaces (duplicadas para evitar dependência circular, idealmente em um types/team.ts)
export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'mentor' | 'intern' | 'guest';
  crefito?: string;
  phone?: string;
  specialty?: string;
  university?: string;
  semester?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mentorship {
  id: string;
  mentor_id: string;
  intern_id: string;
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  hours_completed: number;
  hours_required: number;
  goals: string[];
  competencies: CompetencyEvaluation[];
  notes: ProgressNote[];
  created_at: string;
  mentor?: TeamMember;
  intern?: TeamMember;
}

export interface CompetencyEvaluation {
  id: string;
  competency: string;
  level: 1 | 2 | 3 | 4 | 5; // 1-Iniciante, 2-Básico, 3-Intermediário, 4-Avançado, 5-Expert
  evaluation_date: string;
  notes?: string;
}

export interface ProgressNote {
  id: string;
  date: string;
  content: string;
  achievements: string[];
  next_steps: string[];
  feedback_type: 'positive' | 'improvement' | 'neutral';
  created_by: string;
}

// Mock data fallback
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
];

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
];

const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Hook para buscar membros da equipe
export function useTeamMembersQuery() {
  return useQuery<TeamMember[], Error>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (isMockMode) {
        console.warn('Fetching mock team members data.');
        return mockTeamMembers;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, crefito, phone, specialty, university, semester, is_active, created_at, updated_at')
        .in('role', ['admin', 'mentor', 'intern'])
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching team members:', error);
        toast.error('Erro ao carregar membros da equipe: ' + error.message);
        throw error;
      }
      return data as TeamMember[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar mentorias
export function useMentorshipsQuery() {
  return useQuery<Mentorship[], Error>({
    queryKey: ['mentorships'],
    queryFn: async () => {
      if (isMockMode) {
        console.warn('Fetching mock mentorships data.');
        return mockMentorships;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('mentorships')
        .select(`
          *,
          mentor:mentor_id(id, full_name, email, specialty, role),
          intern:intern_id(id, full_name, email, university, semester, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentorships:', error);
        toast.error('Erro ao carregar mentorias: ' + error.message);
        throw error;
      }
      return data as Mentorship[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// Hook para adicionar nota de progresso
interface AddProgressNoteInput {
  mentorship_id: string;
  content: string;
  achievements: string[];
  next_steps: string[];
  feedback_type: ProgressNote['feedback_type'];
}

export function useAddProgressNoteMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<ProgressNote, Error, AddProgressNoteInput>({
    mutationFn: async (newNoteData) => {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (isMockMode) {
        const mockNote: ProgressNote = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          created_by: user.id,
          ...newNoteData,
        };
        // Invalidate mentorships query to simulate update
        queryClient.invalidateQueries({ queryKey: ['mentorships'] });
        return mockNote;
      }

      const { data, error } = await supabase
        .from('progress_notes') // Assumindo uma tabela 'progress_notes'
        .insert({
          ...newNoteData,
          created_by: user.id,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProgressNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorships'] });
      toast.success('Nota de progresso adicionada!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar nota de progresso: ' + error.message);
    },
  });
}

// Hook para atualizar avaliação de competência
interface UpdateCompetencyInput {
  mentorship_id: string;
  competency_id: string; // ID da avaliação de competência existente
  competency: string;
  level: CompetencyEvaluation['level'];
  notes?: string;
}

interface CreateCompetencyInput {
  mentorship_id: string;
  competency: string;
  level: CompetencyEvaluation['level'];
  notes?: string;
}

export function useUpsertCompetencyMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<CompetencyEvaluation, Error, UpdateCompetencyInput | CreateCompetencyInput>({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (isMockMode) {
        const mockCompetency: CompetencyEvaluation = {
          id: (data as UpdateCompetencyInput).competency_id || Date.now().toString(),
          competency: data.competency,
          level: data.level,
          evaluation_date: new Date().toISOString().split('T')[0],
          notes: data.notes,
        };
        queryClient.invalidateQueries({ queryKey: ['mentorships'] });
        return mockCompetency;
      }

      let result;
      if ((data as UpdateCompetencyInput).competency_id) {
        // Update existing competency
        const { mentorship_id, competency_id, ...updateData } = data as UpdateCompetencyInput;
        const { data: updated, error } = await supabase
          .from('competency_evaluations') // Assumindo uma tabela 'competency_evaluations'
          .update(updateData)
          .eq('id', competency_id)
          .select()
          .single();
        if (error) throw error;
        result = updated;
      } else {
        // Create new competency
        const { mentorship_id, ...createData } = data as CreateCompetencyInput;
        const { data: created, error } = await supabase
          .from('competency_evaluations') // Assumindo uma tabela 'competency_evaluations'
          .insert({
            ...createData,
            mentorship_id: mentorship_id, // Associar à mentoria
            evaluation_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();
        if (error) throw error;
        result = created;
      }
      
      return result as CompetencyEvaluation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorships'] });
      toast.success('Competência atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar competência: ' + error.message);
    },
  });
}
