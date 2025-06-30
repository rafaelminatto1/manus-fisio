'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
  creator: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

const columnOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks');
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

async function updateTask(updatedTask: Partial<Task> & { id: string }) {
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  });

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (err) => {
      toast.error(`Falha ao atualizar a tarefa: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      // Reverter o estado otimista em caso de erro
      queryClient.invalidateQueries({ queryKey: ['tasks']});
    },
  });

  useEffect(() => {
    if (tasks) {
      const newColumns: Record<TaskStatus, Task[]> = {
        todo: [],
        in_progress: [],
        review: [],
        done: [],
      };
      tasks.forEach(task => {
        const status = task.status as TaskStatus;
        if (newColumns[status]) {
          newColumns[status].push(task);
        }
      });
      // Ordenar tarefas dentro de cada coluna pelo order_index
      Object.values(newColumns).forEach(column => {
        column.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      });
      setColumns(newColumns);
    }
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = columns[source.droppableId as TaskStatus];
    const endColumn = columns[destination.droppableId as TaskStatus];
    const task = startColumn.find(t => t.id === draggableId);

    if (!task) return;

    // Otimistic UI Update
    const newStartColumn = Array.from(startColumn);
    newStartColumn.splice(source.index, 1);

    const newEndColumn =
      source.droppableId === destination.droppableId
        ? newStartColumn
        : Array.from(endColumn);
    
    newEndColumn.splice(destination.index, 0, task);
    
    const newColumnsState = {
      ...columns,
      [source.droppableId]: newStartColumn,
      [destination.droppableId]: newEndColumn,
    };
    
    setColumns(newColumnsState as Record<TaskStatus, Task[]>);

    // Update backend
    updateTaskMutation.mutate({
      id: draggableId,
      status: destination.droppableId,
      order_index: destination.index,
    });
  };

  if (isLoading) return <div>Carregando quadro...</div>;
  if (error) return <div>Erro ao carregar as tarefas.</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {columnOrder.map(status => (
          <KanbanColumn key={status} status={status} tasks={columns[status]} />
        ))}
      </div>
    </DragDropContext>
  );
} 