'use client'

import { useEffect, useState } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Task } from '@/types/task.types'

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

const columnOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

const columnTitles: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  done: 'Concluído'
}

// This is a placeholder. In a real app, this would come from a project selector.
const HARDCODED_PROJECT_ID = 'your_project_id_here' // TODO: Replace with a real project ID from your DB

async function fetchTasks(projectId: string): Promise<Task[]> {
  const response = await fetch(`/api/tasks?project_id=${projectId}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch tasks')
  }
  return response.json()
}

async function updateTask(updatedTask: Partial<Task> & { id: string }) {
  const response = await fetch('/api/tasks', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTask),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update task')
  }
  return response.json()
}

export function KanbanBoard() {
  const queryClient = useQueryClient()
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  })

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ['tasks', HARDCODED_PROJECT_ID],
    queryFn: () => fetchTasks(HARDCODED_PROJECT_ID),
    enabled: !!HARDCODED_PROJECT_ID, // Only run query if project ID is set
  })

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      // Optimistically update the query data
      queryClient.setQueryData(['tasks', HARDCODED_PROJECT_ID], (oldTasks: Task[] | undefined) => {
        return oldTasks?.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task) || []
      })
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (err) => {
      toast.error(`Falha ao atualizar a tarefa: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      // Revert the state otimista in case of error
      queryClient.invalidateQueries({ queryKey: ['tasks', HARDCODED_PROJECT_ID] })
    },
  })

  useEffect(() => {
    if (tasks) {
      const newColumns: Record<TaskStatus, Task[]> = {
        todo: [],
        in_progress: [],
        review: [],
        done: [],
      }
      tasks.forEach(task => {
        const status = task.status as TaskStatus
        if (newColumns[status]) {
          newColumns[status].push(task)
        }
      })
      // Sort tasks within each column by order_index
      Object.values(newColumns).forEach(column => {
        column.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      })
      setColumns(newColumns)
    } else {
      // Clear columns if there are no tasks
      setColumns({ todo: [], in_progress: [], review: [], done: [] })
    }
  }, [tasks])

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const startColumn = columns[source.droppableId as TaskStatus]
    const endColumn = columns[destination.droppableId as TaskStatus]
    const task = startColumn.find(t => t.id === draggableId)

    if (!task) return
    
    // Optimistic UI Update
    const newColumnsState = { ...columns }
    // Remove from old column
    const newStartColumn = Array.from(startColumn)
    newStartColumn.splice(source.index, 1)
    newColumnsState[source.droppableId as TaskStatus] = newStartColumn

    // Add to new column
    const newEndColumn = Array.from(endColumn)
    if (source.droppableId === destination.droppableId) {
      newEndColumn.splice(destination.index, 0, task)
    } else {
      newEndColumn.splice(destination.index, 0, task)
      newColumnsState[destination.droppableId as TaskStatus] = newEndColumn
    }

    setColumns(newColumnsState)

    // Update backend
    const newStatus = destination.droppableId as TaskStatus
    if (!columnOrder.includes(newStatus)) {
      console.error("Invalid destination status:", newStatus)
      return;
    }

    updateTaskMutation.mutate({
      id: draggableId,
      status: newStatus,
      order_index: destination.index,
    })
  }

  if (isLoading) return <div className="p-4 text-center">Carregando quadro de tarefas...</div>
  if (error) return <div className="p-4 text-red-600 text-center">Erro ao carregar as tarefas: {(error as Error).message}</div>

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 p-4 overflow-x-auto min-h-[600px]">
        {columnOrder.map(status => (
          <div key={status} className="min-w-[300px] flex-shrink-0 w-1/4">
            <KanbanColumn 
              title={columnTitles[status]}
              status={status} 
              tasks={columns[status] || []}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  )
} 