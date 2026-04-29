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
import { ApiTarefas } from '../service/servicoApi';
import profissionalService from '../types/profissionalService';
import ModalVisualizarTarefa from './Modal/ModalVisualizarTarefa';
import type { Profissional } from '../types/profissionalService';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [colunas, setColunas] = useState<Coluna[]>([
    { id: 'pendente', titulo: 'Pendente', status: 'PENDENTE', tarefas: [] },
    { id: 'em_andamento', titulo: 'Em Andamento', status: 'EM_ANDAMENTO', tarefas: [] },
    { id: 'concluida', titulo: 'Concluída', status: 'CONCLUIDA', tarefas: [] },
  ]);

  const [profissionais, setProfissionais] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (projetoId && user?.id) {
      carregarTarefas();
    }
  }, [projetoId, user?.id, refreshKey]);

  const getNomeResponsavel = (responsavelId: number | null): string => {
    if (!responsavelId) return 'Não atribuído';
    return profissionais.get(responsavelId) ?? 'Não atribuído';
  };

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const response = await ApiTarefas.get(`/tarefas/tarefas/projeto/${projetoId}/responsavel/${user.id}`);
      let tarefasData = response.data;
      if (!Array.isArray(tarefasData)) tarefasData = [];

      const profissionaisLista = await profissionalService.listarTodos();
      const profissionaisMap = new Map<number, string>();
      profissionaisLista.forEach((p: Profissional) => profissionaisMap.set(p.id, p.nome));
      setProfissionais(profissionaisMap);

      const tarefas = tarefasData.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        descricao: t.descricao,
        responsavelId: t.responsavelId,
        status: t.status,
        projetoId: t.projetoId,
        tipoTarefaId: t.tipoTarefaId,
        tempoMaximoMinutos: t.tempoMaximoMinutos,
      }));

      setColunas(prev =>
        prev.map(col => ({
          ...col,
          tarefas: tarefas.filter((t:any) => t && t.status === col.status),
        }))
      );
    } catch (err: any) {
      console.error('Erro ao carregar tarefas:', err);
      setError('Não foi possível carregar as tarefas do servidor.');
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
      const t = col.tarefas.find(task => task.id.toString() === activeId);
      if (t) {
        tarefaParaMover = t;
        colOrigemIdx = idx;
      }
    });

    if (!tarefaParaMover || colDestinoIdx === -1 || colOrigemIdx === colDestinoIdx) return;

    const novoStatus = colunas[colDestinoIdx].status;

    const novasColunas = [...colunas];
    novasColunas[colOrigemIdx].tarefas = novasColunas[colOrigemIdx].tarefas.filter(
      t => t.id.toString() !== activeId
    );
    novasColunas[colDestinoIdx].tarefas.push({ ...tarefaParaMover, status: novoStatus });
    setColunas(novasColunas);

    try {
      await ApiTarefas.patch(`/tarefas/tarefas/${tarefaParaMover.id}/status`, `"${novoStatus}"`, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      await carregarTarefas(); 
    }
  };

  const handleAbrirVisualizar = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setModalVisualizarAberto(true);
  };

  const handleAtualizarTarefa = () => {
    carregarTarefas();
  };

  const handleAbrirModalItem = (tarefaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onAbrirModalItem?.(tarefaId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
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
        <button onClick={carregarTarefas} className="px-4 py-2 bg-blue-500 text-white rounded">
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
            {colunas.map(coluna => (
              <Droppable key={coluna.id} id={coluna.id} titulo={coluna.titulo}>
                <div className="space-y-2">
                  {coluna.tarefas.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 text-sm italic bg-[#1f1f1f] rounded-lg">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    coluna.tarefas.map(tarefa => (
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
                            prazo: typeof tarefa.tempoMaximoMinutos === 'number' ? tarefa.tempoMaximoMinutos : null,
                            status: tarefa.status,
                          }}
                          onAddItem={e => handleAbrirModalItem(tarefa.id, e)}
                        />
                      </div>
                    ))
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