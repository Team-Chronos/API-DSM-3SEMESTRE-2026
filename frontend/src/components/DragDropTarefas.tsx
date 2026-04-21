import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import { Droppable } from './colunas';
import { Draggable } from './cardTarefa';
import Api from '../service/servicoApi';
import ModalVisualizarTarefa from './modal/ModalVisualizarTarefa';

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  responsavelId: number | null;
  status: string;
  projetoId: number;
  tipoTarefaId: number;
  tempoMaximoMinutos: number | string | null;
}

interface Coluna {
  id: string;
  titulo: string;
  status: string;
  tarefas: Tarefa[];
}

interface DragDropTarefasProps {
  projetoId: number;
  onAbrirModalItem?: (tarefaId: number) => void;
  refreshKey?: number;
}

export default function DragDropTarefas({ projetoId, onAbrirModalItem, refreshKey }: DragDropTarefasProps) {
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
    if (projetoId) {
      carregarTarefas();
    }
  }, [projetoId, refreshKey]);

  const getNomeResponsavel = (responsavelId: number | null): string => {
    if (!responsavelId) return 'Não atribuído';
    return `Responsável ID: ${responsavelId}`;
  };

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await Api.get(`/tarefas/projeto/${projetoId}`);
      let tarefasData = response.data;

      if (!Array.isArray(tarefasData)) {
        tarefasData = [];
      }

      const tarefas = tarefasData.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        descricao: t.descricao,
        responsavelId: t.responsavelId,
        status: t.status,
        projetoId: t.projetoId,
        tipoTarefaId: t.tipoTarefaId,
        tempoMaximoMinutos: t.tempoMaximoMinutos
      }));

      console.log(`Tarefas carregadas para projeto ${projetoId}:`, tarefas.length);

      setColunas(prev => prev.map(col => ({
        ...col,
        tarefas: tarefas.filter((t: Tarefa) => t && t.status === col.status)
      })));

    } catch (err: any) {
      console.error("Erro ao carregar tarefas:", err);
      setError("Não foi possível carregar as tarefas do servidor.");
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
    const colDestinoIdx = colunas.findIndex(c => c.id === overId);

    colunas.forEach((col, idx) => {
      const t = col.tarefas.find(task => task && task.id && task.id.toString() === activeId);
      if (t) {
        tarefaParaMover = t;
        colOrigemIdx = idx;
      }
    });

    if (!tarefaParaMover || colDestinoIdx === -1 || colOrigemIdx === colDestinoIdx) return;

    const novoStatus = colunas[colDestinoIdx].status;

    const novasColunas = [...colunas];
    novasColunas[colOrigemIdx].tarefas = novasColunas[colOrigemIdx].tarefas.filter(
      t => t && t.id && t.id.toString() !== activeId
    );
    novasColunas[colDestinoIdx].tarefas.push({ ...tarefaParaMover, status: novoStatus });
    setColunas(novasColunas);

    try {
      await Api.patch(`/tarefas/${tarefaParaMover.id}/status`, `"${novoStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      await carregarTarefas();
    }
  };

  const handleAbrirVisualizar = (tarefa: Tarefa) => {
    if (!tarefa) return;
    setTarefaSelecionada(tarefa);
    setModalVisualizarAberto(true);
  };

  const handleAtualizarTarefa = () => {
    carregarTarefas();
  };

  const handleAbrirModalItem = (tarefaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAbrirModalItem && tarefaId) {
      onAbrirModalItem(tarefaId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando tarefas do projeto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <strong>Erro:</strong> {error}
        </div>
        <button
          onClick={carregarTarefas}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colunas.map((coluna) => (
              <Droppable key={coluna.id} id={coluna.id} titulo={coluna.titulo}>
                <div className="space-y-2">
                  {coluna.tarefas.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 text-sm italic bg-[#1f1f1f] rounded-lg">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    coluna.tarefas.map((tarefa) => {
                      if (!tarefa || !tarefa.id) {
                        console.warn('Tarefa inválida:', tarefa);
                        return null;
                      }

                      let prazoValue: number | null = null;
                      if (tarefa.tempoMaximoMinutos) {
                        if (typeof tarefa.tempoMaximoMinutos === 'number') {
                          prazoValue = tarefa.tempoMaximoMinutos;
                        } else if (typeof tarefa.tempoMaximoMinutos === 'string') {
                          const parsed = parseInt(tarefa.tempoMaximoMinutos, 10);
                          prazoValue = isNaN(parsed) ? null : parsed;
                        }
                      }

                      return (
                        <div
                          key={tarefa.id}
                          onClick={() => handleAbrirVisualizar(tarefa)}
                          className="cursor-pointer"
                        >
                          <Draggable
                            id={String(tarefa.id)}
                            tarefa={{
                              id: tarefa.id,
                              titulo: tarefa.titulo,
                              descricao: tarefa.descricao,
                              responsavel: getNomeResponsavel(tarefa.responsavelId),
                              prazo: prazoValue,
                              status: tarefa.status
                            }}
                            onAddItem={(e) => handleAbrirModalItem(tarefa.id, e)}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </Droppable>
            ))}
          </div>
        </DndContext>
      </div>

      <ModalVisualizarTarefa
        tarefa={tarefaSelecionada}
        isOpen={modalVisualizarAberto}
        onFechar={() => setModalVisualizarAberto(false)}
        onAtualizar={handleAtualizarTarefa}
      />
    </>
  );
}