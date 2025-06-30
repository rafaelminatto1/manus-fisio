'use client';

import { TaskCard } from './TaskCard';
import { Database } from '@/types/database.types';
import { Droppable } from '@hello-pangea/dnd';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
  creator: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

interface KanbanColumnProps {
  status: string;
  tasks: Task[];
}

const statusLabels: { [key: string]: string } = {
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  done: 'Concluído',
};

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  return (
    <div className="w-full md:w-1/4 bg-muted/50 rounded-lg p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center justify-between">
        <span>{statusLabels[status] || status}</span>
        <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow min-h-[200px] transition-colors rounded-md ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 