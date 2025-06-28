import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/auth';
import { toast } from 'sonner';

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  template_type: string | null;
  page_count: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner?: {
    full_name: string;
    email: string;
  };
  is_public?: boolean;
}

const fetchNotebooks = async (): Promise<Notebook[]> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    // Fallback para mock data se não autenticado ou em modo mock
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('Fetching mock notebooks data as user is not authenticated or in mock mode.');
      return [
        {
          id: '1',
          title: 'Protocolos de Fisioterapia Respiratória',
          description: 'Técnicas e exercícios para reabilitação pulmonar',
          content: '<h1>Protocolos de Fisioterapia Respiratória</h1><p>Conteúdo do protocolo...</p>',
          template_type: 'avaliacao',
          page_count: 15,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          owner_id: 'mock-user-1',
          owner: { full_name: 'Dr. Rafael Minatto', email: 'rafael.minatto@yahoo.com.br' },
          is_public: false
        },
        {
          id: '2',
          title: 'Avaliação Neurológica Pediátrica',
          description: 'Protocolos específicos para avaliação infantil',
          content: '<h1>Avaliação Neurológica</h1><p>Procedimentos para crianças...</p>',
          template_type: 'avaliacao',
          page_count: 8,
          created_at: '2024-01-10T08:00:00Z',
          updated_at: '2024-01-18T16:45:00Z',
          owner_id: 'mock-user-1',
          owner: { full_name: 'Dr. Rafael Minatto', email: 'rafael.minatto@yahoo.com.br' },
          is_public: false
        }
      ];
    }
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('notebooks')
    .select(`
      *,
      owner:users!notebooks_created_by_fkey(full_name)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notebooks:', error);
    toast.error('Erro ao carregar notebooks: ' + error.message);
    throw error;
  }

  return data as Notebook[];
};

export function useNotebooksQuery() {
  return useQuery<Notebook[], Error>({
    queryKey: ['notebooks'],
    queryFn: fetchNotebooks,
    staleTime: 1000 * 60 * 5, // Data considerada 'stale' após 5 minutos
    refetchOnWindowFocus: false, // Não refetch ao focar na janela
  });
}
