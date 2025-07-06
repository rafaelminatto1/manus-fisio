import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';

export default function KanbanColumn({ column }: { column: { id: string; title: string; tasks: { id: string; title: string }[] } }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} className="bg-white rounded shadow min-w-[250px] p-2 flex flex-col">
      <h2 className="font-bold mb-2">{column.title}</h2>
      <div className="flex flex-col gap-2">
        {column.tasks.map(task => (
          <KanbanTask key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function KanbanTask({ task }: { task: { id: string; title: string } }) {
  const { setNodeRef, attributes, listeners, isDragging } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-gray-100 rounded p-2 shadow cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      {task.title}
    </div>
  );
}

// Conteúdo removido temporariamente para corrigir o build.
// A funcionalidade de Kanban será reimplementada.
export {}