import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: number | Date | null;
  status: string;
}

type DraggableProps = {
  id: UniqueIdentifier;
  tarefa: Tarefa;
  onAddItem?: (e: React.MouseEvent) => void;
};

export function Draggable({ id, tarefa, onAddItem }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: "#1f1f1f",
    border: "1px solid #3e3e3e",
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };

  const formatarData = (data: number | Date | null) => {
    if (!data) return "Sem prazo";

    let dataObj: Date;

    if (typeof data === "number") {
      dataObj = new Date(data);
    } else if (data instanceof Date) {
      dataObj = data;
    } else {
      return "Data inválida";
    }

    if (isNaN(dataObj.getTime())) {
      return "Data inválida";
    }

    return dataObj.toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONCLUIDA":
        return "bg-green-500";
      case "EM_ANDAMENTO":
        return "bg-blue-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case "CONCLUIDA":
        return "Concluída";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      default:
        return "Pendente";
    }
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
        hover:border-gray-500 transition-all duration-200 
        shadow-lg select-none
        ${isDragging ? "shadow-2xl rotate-2 scale-105" : "hover:scale-[1.02]"}
      `}
    >
      <div className="flex justify-between items-start mb-2 pointer-events-none">
        <h3 className="text-white font-semibold text-sm truncate flex-1">
          {tarefa.titulo}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase">
            {getStatusTexto(tarefa.status)}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(tarefa.status)}`}
          ></div>
        </div>
      </div>

      <p className="text-gray-400 text-xs mb-3 line-clamp-2 pointer-events-none">
        {tarefa.descricao || "Sem descrição disponível."}
      </p>

      <div className="flex items-center justify-between text-xs pointer-events-none">
        <div className="flex items-center text-gray-400">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="truncate max-w-[100px]" title={tarefa.responsavel}>
            {tarefa.responsavel}
          </span>
        </div>

        <div className="flex items-center text-gray-500">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatarData(tarefa.prazo)}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#3e3e3e] flex justify-between items-center">
        {onAddItem && (
          <button
            onClick={onAddItem}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors pointer-events-auto flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Adicionar Item
          </button>
        )}
        <span className="text-[10px] text-gray-600 uppercase font-bold flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Clique para detalhes
        </span>
      </div>
    </div>
  );
}
