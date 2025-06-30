'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_date: string | null;
  created_at: string;
  assignee: Pick<User, 'id' | 'full_name' | 'avatar_url'> | null;
  creator: Pick<User, 'id' | 'full_name' | 'avatar_url'> | null;
}

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  color?: string;
}

const statusColors: { [key: string]: string } = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'in-review': 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

export function KanbanColumn({ title, status, tasks, color }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 min-h-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge 
              variant="secondary" 
              className={statusColors[status] || 'bg-gray-100 text-gray-800'}
            >
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-full p-2 rounded-md transition-colors ${
                  snapshot.isDraggingOver ? 'bg-muted/50' : ''
                }`}
              >
                <div className="space-y-3 max-h-full overflow-y-auto">
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardContent>
      </Card>
    </div>
  );
}