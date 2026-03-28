import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { UniqueIdentifier } from '@dnd-kit/core';

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: Date;
  status: string;
}

type DraggableProps = {
  id: UniqueIdentifier;
  tarefa: Tarefa;
  onAddItem?: (e: React.MouseEvent) => void;
};

export function Draggable({ id, tarefa, onAddItem }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: '#1f1f1f',
    border: '1px solid #3e3e3e',
    zIndex: isDragging ? 50 : undefined,
    position: 'relative'
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        rounded-lg p-4 mb-2
        cursor-grab active:cursor-grabbing 
        hover:border-gray-500 transition-colors duration-200 
        shadow-lg select-none
        ${isDragging ? 'shadow-2xl rotate-2' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <h3 className="text-white font-medium text-sm truncate flex-1">
          {tarefa.titulo}
        </h3>
        <div className={`w-2 h-2 rounded-full ml-2 ${
          tarefa.status === 'CONCLUIDA' ? 'bg-green-500' : 
          tarefa.status === 'EM_ANDAMENTO' ? 'bg-blue-500' : 'bg-yellow-500'
        }`}></div>
      </div>
      
      <p className="text-gray-400 text-xs mb-3 line-clamp-2 pointer-events-none">
        {tarefa.descricao || "Sem descrição disponível."}
      </p>
      
      <div className="flex items-center justify-between text-xs pointer-events-none">
        <div className="flex items-center text-gray-400">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate max-w-[80px]">Resp: {tarefa.responsavel}</span>
        </div>
        
        <div className="flex items-center text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatarData(tarefa.prazo)}</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[#3e3e3e] flex justify-between items-center">
        <button
          onClick={onAddItem}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors pointer-events-auto"
        >
          + Adicionar Item
        </button>
        <span className="text-[10px] text-gray-600 uppercase font-bold">Clique para detalhes</span>
      </div>
    </div>
  );
}