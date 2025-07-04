import { createServerAuthClient } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const supabase = await createServerAuthClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login?message=Please log in to view tasks');
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Quadro de Tarefas</h1>
        <p className="text-muted-foreground">Gerencie suas tarefas com o quadro Kanban.</p>
      </header>
      <main className="flex-grow overflow-hidden">
        <div className="p-4 text-center text-muted-foreground">
          O quadro de tarefas está em manutenção.
        </div>
      </main>
    </div>
  );
} 