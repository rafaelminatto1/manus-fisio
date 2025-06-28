import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/auth';
import { toast } from 'sonner';
import { Project, Task, TeamMember } from './use-projects-data'; // Importar tipos

interface CreateProjectInput {
  title: string;
  description?: string;
  status: Project['status'];
  priority: Project['priority'];
  due_date?: string;
  budget?: number;
  category: Project['category'];
  tags?: string[];
}

interface UpdateProjectInput {
  id: string;
  title?: string;
  description?: string;
  status?: Project['status'];
  priority?: Project['priority'];
  due_date?: string;
  budget?: number;
  category?: Project['category'];
  tags?: string[];
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<Project, Error, CreateProjectInput>({
    mutationFn: async (newProjectData) => {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const mockProject: Project = {
          ...newProjectData,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 0,
          created_by: user.id,
          owner: { id: user.id, full_name: user.email || 'Mock User', email: user.email || 'mock@example.com', role: 'admin' }, // Mock owner
        };
        return mockProject;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...newProjectData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar projeto: ' + error.message);
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<Project, Error, UpdateProjectInput>({
    mutationFn: async (updatedProjectData) => {
      const { id, ...dataToUpdate } = updatedProjectData;
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const mockProject: Project = {
          id: id,
          title: dataToUpdate.title || 'Mock Project',
          description: dataToUpdate.description || null,
          status: dataToUpdate.status || 'active',
          priority: dataToUpdate.priority || 'medium',
          due_date: dataToUpdate.due_date || undefined,
          progress: dataToUpdate.progress || 0,
          budget: dataToUpdate.budget || undefined,
          category: dataToUpdate.category || 'clinical',
          created_by: user.id,
          created_at: new Date().toISOString(), // Manter o original em um cenário real
          updated_at: new Date().toISOString(),
          owner: { id: user.id, full_name: user.email || 'Mock User', email: user.email || 'mock@example.com', role: 'admin' }, // Mock owner
        };
        return mockProject;
      }

      const { data, error } = await supabase
        .from('projects')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Projeto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar projeto: ' + error.message);
    },
  });
}

interface CreateTaskInput {
  project_id: string;
  title: string;
  description?: string;
  status: Task['status'];
  priority: Task['priority'];
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  checklist?: { id: string; text: string; completed: boolean }[];
  attachments?: { id: string; name: string; url: string; type: string; size: number }[];
}

interface UpdateTaskInput {
  id: string;
  project_id?: string;
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  order_index?: number;
  checklist?: { id: string; text: string; completed: boolean }[];
  attachments?: { id: string; name: string; url: string; type: string; size: number }[];
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (newTaskData) => {
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const mockTask: Task = {
          ...newTaskData,
          id: Date.now().toString(),
          actual_hours: 0,
          order_index: 0, // Mock default
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return mockTask;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...newTaskData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Para atualizar o progresso do projeto
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar tarefa: ' + error.message);
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<Task, Error, UpdateTaskInput>({
    mutationFn: async (updatedTaskData) => {
      const { id, ...dataToUpdate } = updatedTaskData;
      const { data: { user } } = await supabase.auth.getSession();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock mode fallback
      if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const mockTask: Task = {
          id: id,
          title: dataToUpdate.title || 'Mock Task',
          description: dataToUpdate.description || null,
          status: dataToUpdate.status || 'todo',
          priority: dataToUpdate.priority || 'medium',
          assigned_to: dataToUpdate.assigned_to || undefined,
          due_date: dataToUpdate.due_date || undefined,
          estimated_hours: dataToUpdate.estimated_hours || undefined,
          actual_hours: dataToUpdate.actual_hours || 0,
          order_index: dataToUpdate.order_index || 0,
          project_id: dataToUpdate.project_id || 'mock-project-id',
          created_by: user.id,
          created_at: new Date().toISOString(), // Manter o original em um cenário real
          updated_at: new Date().toISOString(),
        };
        return mockTask;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...dataToUpdate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Para atualizar o progresso do projeto
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tarefa: ' + error.message);
    },
  });
}
