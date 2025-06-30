'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Database } from '@/types/database.types';
import { Draggable } from '@hello-pangea/dnd';
import { useMemo } from 'react';

type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
  creator: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'full_name' | 'avatar_url'> | null;
};

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityClasses: { [key: string]: string } = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export function TaskCard({ task, index }: TaskCardProps) {
  const assigneeName = useMemo(() => {
    return task.assignee?.full_name?.split(' ')[0] || 'N/A';
  }, [task.assignee]);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium leading-tight pr-2">{task.title}</CardTitle>
                {task.priority && (
                  <div
                    className={`w-3 h-3 rounded-full ${priorityClasses[task.priority] || 'bg-gray-400'}`}
                    title={`Priority: ${task.priority}`}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {task.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee?.avatar_url || ''} alt={assigneeName} />
                    <AvatarFallback className="text-xs">
                      {assigneeName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{assigneeName}</span>
                </div>
                {task.due_date && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(task.due_date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
} 