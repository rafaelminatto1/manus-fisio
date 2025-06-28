import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  replies?: Comment[];
  is_pinned?: boolean;
  document_id: string;
  selection_text?: string;
}

export interface Version {
  id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  changes_summary: string;
  content_preview: string;
  is_current: boolean;
  document_id: string;
}

// Hook para buscar comentários de um documento
export function useCommentsQuery(documentId: string) {
  const { user } = useAuth();

  return useQuery<Comment[], Error>({
    queryKey: ['comments', documentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!user && !!documentId,
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para adicionar um comentário
export function useAddCommentMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<Comment, Error, Omit<Comment, 'id' | 'user_id' | 'user_name' | 'created_at' | 'updated_at' | 'replies' | 'is_pinned'>>({
    mutationFn: async (newCommentData) => {
      if (!user) throw new Error('User not authenticated');

      const commentToInsert = {
        ...newCommentData,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email || 'Usuário',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(commentToInsert)
        .select()
        .single();

      if (error) throw error;
      return data as Comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comentário adicionado!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar comentário: ' + error.message);
    },
  });
}

// Hook para buscar versões de um documento
export function useVersionsQuery(documentId: string) {
  const { user } = useAuth();

  return useQuery<Version[], Error>({
    queryKey: ['versions', documentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Version[];
    },
    enabled: !!user && !!documentId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para restaurar uma versão
export function useRestoreVersionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<Version, Error, { versionId: string; documentId: string }>({
    mutationFn: async ({ versionId, documentId }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: versionToRestore, error: fetchError } = await supabase
        .from('document_versions')
        .select('content') // Assumindo que 'content' é o campo que guarda o conteúdo completo
        .eq('id', versionId)
        .single();

      if (fetchError) throw fetchError;

      // Assumindo que o documento principal está na tabela 'notebooks' ou 'projects'
      // Você precisará ajustar isso com base na sua estrutura real
      const { data, error } = await supabase
        .from('notebooks') // Ou 'projects', dependendo do documentId
        .update({ content: versionToRestore.content, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data as Version; // Retornar a versão restaurada ou o documento atualizado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions'] }); // Invalida versões para re-fetch
      queryClient.invalidateQueries({ queryKey: ['comments'] }); // Pode ser necessário invalidar comentários também
      // Também pode ser necessário invalidar a query do documento principal se o conteúdo for atualizado
      toast.success('Versão restaurada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao restaurar versão: ' + error.message);
    },
  });
}

// Hook para rastrear usuários ativos em tempo real (usando Supabase Realtime)
export function useActiveUsersSubscription(documentId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user || !documentId) return;

    const channel = supabase
      .channel(`document_presence_${documentId}`)
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const newState = channel.presenceState();
          // Processar newState para obter usuários ativos
          const activeUsers = Object.values(newState).flatMap((users: any) => users.map((u: any) => u.user));
          queryClient.setQueryData(['active-users', documentId], activeUsers);
        }
      )
      .on(
        'presence',
        { event: 'join' },
        ({ newPresences }) => {
          const newState = channel.presenceState();
          const activeUsers = Object.values(newState).flatMap((users: any) => users.map((u: any) => u.user));
          queryClient.setQueryData(['active-users', documentId], activeUsers);
          newPresences.forEach(p => toast.info(`${p.user.name} entrou na colaboração.`));
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ leftPresences }) => {
          const newState = channel.presenceState();
          const activeUsers = Object.values(newState).flatMap((users: any) => users.map((u: any) => u.user));
          queryClient.setQueryData(['active-users', documentId], activeUsers);
          leftPresences.forEach(p => toast.info(`${p.user.name} saiu da colaboração.`));
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: { id: user.id, name: user.user_metadata?.full_name || user.email } });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, user, queryClient]);

  return useQuery<any[], Error>({
    queryKey: ['active-users', documentId],
    queryFn: async () => [], // Dados iniciais vazios, serão preenchidos pela presença
    enabled: !!user && !!documentId,
    staleTime: Infinity, // Nunca stale, atualizado por realtime
  });
}
