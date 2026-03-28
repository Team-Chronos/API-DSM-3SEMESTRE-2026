import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';

import { Droppable } from '../componentes/colunas';
import { Draggable } from '../componentes/cardTarefa';
import Api from '../servico/servicoApi';
import ModalVisualizarTarefa from '../componentes/modal/ModalVisualizarTarefa';

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  responsavelId: number;  
  prazo?: string;
  status: string;
}

interface Coluna {
  id: string;
  titulo: string;
  status: string;
  tarefas: Tarefa[];
}

interface DragDropTarefasProps {
  onAbrirModalItem?: (tarefaId: number) => void;
}

export default function DragDropTarefas({ onAbrirModalItem }: DragDropTarefasProps) {
  const [colunas, setColunas] = useState<Coluna[]>([
    { id: 'pendente', titulo: 'Pendente', status: 'PENDENTE', tarefas: [] },
    { id: 'em_andamento', titulo: 'Em Andamento', status: 'EM_ANDAMENTO', tarefas: [] },
    { id: 'concluida', titulo: 'Concluída', status: 'CONCLUIDA', tarefas: [] },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/tarefas');
      const tarefas: Tarefa[] = response.data;
      
      setColunas(prev => prev.map(col => ({
        ...col,
        tarefas: tarefas.filter(t => t.status === col.status)
      })));
    } catch (err) {
      setError("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    let tarefaParaMover: Tarefa | undefined;
    let colOrigemIdx = -1;
    let colDestinoIdx = colunas.findIndex(c => c.id === overId);

    colunas.forEach((col, idx) => {
      const t = col.tarefas.find(task => task.id.toString() === activeId);
      if (t) {
        tarefaParaMover = t;
        colOrigemIdx = idx;
      }
    });

    if (!tarefaParaMover || colDestinoIdx === -1 || colOrigemIdx === colDestinoIdx) return;

    const novoStatus = colunas[colDestinoIdx].status;

    try {
      await Api.patch(`/tarefas/${tarefaParaMover.id}/status`, novoStatus, {
        headers: { 'Content-Type': 'text/plain' }
      });

      const novasColunas = [...colunas];
      novasColunas[colOrigemIdx].tarefas = novasColunas[colOrigemIdx].tarefas.filter(t => t.id.toString() !== activeId);
      novasColunas[colDestinoIdx].tarefas.push({ ...tarefaParaMover, status: novoStatus });
      setColunas(novasColunas);
    } catch (err) {
      setError("Erro ao atualizar status.");
    }
  };

  const handleAbrirVisualizar = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setModalVisualizarAberto(true);
  };

  const handleAbrirModalItem = (tarefaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAbrirModalItem) {
      onAbrirModalItem(tarefaId);
    }
  };

  if (loading) return <div className="p-6 text-white">Carregando...</div>;

  return (
    <div className="p-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {colunas.map((coluna) => (
            <Droppable key={coluna.id} id={coluna.id} titulo={coluna.titulo}>
              <div className="space-y-2">
                {coluna.tarefas.map((tarefa) => (
                  <div 
                    key={tarefa.id} 
                    onClick={() => handleAbrirVisualizar(tarefa)}
                  >
                    <Draggable 
                      id={tarefa.id.toString()}
                      tarefa={{
                        ...tarefa,
                        responsavel: tarefa.responsavelId?.toString() || 'N/A',
                        prazo: new Date()
                      }}
                      onAddItem={(e) => handleAbrirModalItem(tarefa.id, e)}
                    />
                  </div>
                ))}
              </div>
            </Droppable>
          ))}
        </div>
      </DndContext>

      <ModalVisualizarTarefa 
        tarefa={tarefaSelecionada}
        isOpen={modalVisualizarAberto}
        onFechar={() => setModalVisualizarAberto(false)}
      />
    </div>
  );
}