'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityLabel = (priority: string | null) => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Não definida';
  }
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue ? 'border-red-200 bg-red-50' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
          {task.priority && (
            <Badge 
              variant="outline" 
              className={`ml-2 text-xs ${getPriorityColor(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="space-y-2">
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <CalendarDays className="h-3 w-3" />
              <span>
                {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              {isOverdue && <span className="text-red-600 font-medium">(Atrasada)</span>}
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Criada em {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {task.assignee.full_name || 'Usuário'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-xs">Não atribuída</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 