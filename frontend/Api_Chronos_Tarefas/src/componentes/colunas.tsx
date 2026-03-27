import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { UniqueIdentifier } from '@dnd-kit/core';

type DroppableProps = {
  id: UniqueIdentifier;
  titulo: string;
  children: ReactNode;
};

export function Droppable({ id, titulo, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="rounded-lg p-4 min-h-[500px] transition-all duration-200"
      style={{
        backgroundColor: '#252525',
        border: isOver ? '2px solid #3e3e3e' : '1px solid #3e3e3e'
      }}
    >
      <div className="mb-4 pb-2 border-b" style={{ borderBottomColor: '#3e3e3e' }}>
        <h2 className="text-white font-semibold text-lg">{titulo}</h2>
        <span style={{ color: '#9ca3af' }} className="text-sm">
          {React.Children.count(children)} tarefas
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
