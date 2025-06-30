import { Database } from './database.types';

// Extrai a definição da tabela 'tasks' do tipo 'Database' gerado pelo Supabase
type TaskFromDB = Database['public']['Tables']['tasks']['Row'];

// Tipo para o usuário, simplificado para o que precisamos no card de task
interface TaskUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// O tipo Task completo, que será usado em todo o frontend.
// Ele combina o tipo do banco de dados com os objetos de usuário aninhados.
export interface Task extends Omit<TaskFromDB, 'assignee_id' | 'created_by'> {
  assignee: TaskUser | null;
  creator: TaskUser | null;
} 