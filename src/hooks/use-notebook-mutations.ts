import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface CreateNotebookInput {
  title: string;
  description?: string;
  content?: string;
  template_type?: string;
  icon?: string;
  color?: string;
  category?: string;
  is_public?: boolean;
}

interface UpdateNotebookInput {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  template_type?: string;
  icon?: string;
  color?: string;
  category?: string;
  is_public?: boolean;
}

export function useCreateNotebookMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return useMutation<Notebook, Error, CreateNotebookInput>({
    mutationFn: async (newNotebookData) => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const mockNotebook: Notebook = {
          id: Date.now().toString(),
          title: newNotebookData.title,
          description: newNotebookData.description || null,
          content: newNotebookData.content || null,
          template_type: newNotebookData.template_type || null,
          page_count: newNotebookData.content ? Math.ceil(newNotebookData.content.length / 1000) : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: user.id,
          owner: { full_name: user.email || 'Mock User', email: user.email || 'mock@example.com' },
          is_public: newNotebookData.is_public || false,
        };
        return mockNotebook;
      }

      const { data: insertData, error } = await supabase
        .from('notebooks')
        .insert({
          ...newNotebookData,
          created_by: user.id, // Assumindo que a coluna é created_by
          updated_by: user.id, // Assumindo que a coluna é updated_by
        })
        .select()
        .single();

      if (error) throw error;
      return insertData as Notebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar notebook: ' + error.message);
    },
  });
}

export function useUpdateNotebookMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return useMutation<Notebook, Error, UpdateNotebookInput>({
    mutationFn: async (updatedNotebookData) => {
      const { id, ...dataToUpdate } = updatedNotebookData;
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Simular atualização no mock data (não persistente, apenas para demonstração)
        const mockNotebook: Notebook = {
          id: id,
          title: dataToUpdate.title || 'Mock Notebook',
          description: dataToUpdate.description || null,
          content: dataToUpdate.content || null,
          template_type: dataToUpdate.template_type || null,
          page_count: dataToUpdate.content ? Math.ceil(dataToUpdate.content.length / 1000) : 0,
          created_at: new Date().toISOString(), // Manter o original em um cenário real
          updated_at: new Date().toISOString(),
          owner_id: user.id,
          owner: { full_name: user.email || 'Mock User', email: user.email || 'mock@example.com' },
          is_public: dataToUpdate.is_public || false,
        };
        return mockNotebook;
      }

      const { data: updateData, error } = await supabase
        .from('notebooks')
        .update({
          ...dataToUpdate,
          updated_by: user.id, // Assumindo que a coluna é updated_by
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updateData as Notebook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar notebook: ' + error.message);
    },
  });
}
