'use client';
import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';

const initialColumns = [
  { id: 'todo', title: 'A Fazer', tasks: [{ id: '1', title: 'Exemplo de tarefa' }] },
  { id: 'doing', title: 'Em Progresso', tasks: [] },
  { id: 'done', title: 'Concluído', tasks: [] },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const sensors = useSensors(useSensor(PointerSensor));

  // Drag and drop entre colunas e tarefas (simplificado)
  const handleDragEnd = (event: DragEndEvent) => {
    // Implementação básica: só permite reordenar tarefas dentro da mesma coluna
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumns(cols =>
      cols.map(col => {
        const idx = col.tasks.findIndex(t => t.id === active.id);
        const overIdx = col.tasks.findIndex(t => t.id === over.id);
        if (idx !== -1 && overIdx !== -1) {
          const newTasks = arrayMove(col.tasks, idx, overIdx);
          return { ...col, tasks: newTasks };
        }
        return col;
      })
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4 overflow-x-auto">
        {columns.map(col => (
          <SortableContext key={col.id} items={col.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <KanbanColumn column={col} />
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
} 