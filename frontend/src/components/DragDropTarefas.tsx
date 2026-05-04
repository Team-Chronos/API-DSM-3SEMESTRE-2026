import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { Droppable } from "./colunas";
import { Draggable } from "./cardTarefa";
import { ApiTarefas } from "../service/servicoApi";
import profissionalService from "../types/profissionalService";
import ModalVisualizarTarefa from "./Modal/ModalVisualizarTarefa";
import type { Profissional } from "../types/profissionalService";
import { useAuth } from "../contexts/AuthContext";
import { toastError } from '../utils/toastUtils';

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

const formatarPrazo = (tempoMaximoMinutos: number | string | null): string | null => {
  if (tempoMaximoMinutos === null || tempoMaximoMinutos === undefined) return null;
  const minutos = typeof tempoMaximoMinutos === "string"
    ? parseInt(tempoMaximoMinutos, 10)
    : tempoMaximoMinutos;
  if (isNaN(minutos) || minutos <= 0) return null;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

export default function DragDropTarefas({
  projetoId,
  onAbrirModalItem,
  refreshKey,
}: DragDropTarefasProps) {
  const { user, loading: authLoading } = useAuth();

  const userRoles = user?.roles ?? [];
  const podeGerenciarTodasTarefas =
    userRoles.includes("ROLE_ADMIN") ||
    userRoles.includes("ROLE_FINANCE") ||
    userRoles.includes("ROLE_GERENTE_PROJETO");
  const rolesKey = userRoles.join("|");

  const [colunas, setColunas] = useState<Coluna[]>([
    { id: "pendente", titulo: "Pendente", status: "PENDENTE", tarefas: [] },
    { id: "em_andamento", titulo: "Em Andamento", status: "EM_ANDAMENTO", tarefas: [] },
    { id: "concluida", titulo: "Concluída", status: "CONCLUIDA", tarefas: [] },
  ]);

  const [profissionais, setProfissionais] = useState<Map<number, string>>(new Map());
  const [loadingTarefas, setLoadingTarefas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!authLoading && projetoId && user?.id) {
      carregarTarefas();
    }
  }, [projetoId, user?.id, rolesKey, refreshKey, authLoading]);

  const getNomeResponsavel = (responsavelId: number | null): string => {
    if (!responsavelId) return "Não atribuído";
    return profissionais.get(responsavelId) ?? "Não atribuído";
  };

  const carregarTarefas = async () => {
    try {
      setLoadingTarefas(true);
      setError(null);

      if (!user?.id) throw new Error("Usuário não autenticado");

      const endpoint = podeGerenciarTodasTarefas
        ? `/tarefas/tarefas/projeto/${projetoId}`
        : `/tarefas/tarefas/projeto/${projetoId}/responsavel/${user.id}`;

      const response = await ApiTarefas.get(endpoint);
      const rawData = response.data;
      const tarefasData = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.content)
        ? rawData.content
        : [];

      const profissionaisLista = await profissionalService.listarTodos();
      const profissionaisMap = new Map<number, string>();
      profissionaisLista.forEach((p: Profissional) =>
        profissionaisMap.set(p.id, p.nome),
      );
      setProfissionais(profissionaisMap);

      const tarefas: Tarefa[] = tarefasData.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        descricao: t.descricao,
        responsavelId: t.responsavelId,
        status: t.status?.toUpperCase().trim(),
        projetoId: t.projetoId,
        tipoTarefaId: t.tipoTarefaId,
        tempoMaximoMinutos: t.tempoMaximoMinutos,
      }));

      setColunas(prev =>
        prev.map(col => ({
          ...col,
          tarefas: tarefas.filter(t => t && t.status === col.status),
        }))
      );
    } catch (err: any) {
      toastError("Erro ao carregar tarefas. Tente novamente.");
      setError("Não foi possível carregar as tarefas do servidor.");
    } finally {
      setLoadingTarefas(false);
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
      const tarefa = col.tarefas.find(task => task.id.toString() === activeId);
      if (tarefa) {
        tarefaParaMover = tarefa;
        colOrigemIdx = idx;
      }
    });

    if (!tarefaParaMover || colDestinoIdx === -1 || colOrigemIdx === colDestinoIdx) return;

    const novoStatus = colunas[colDestinoIdx].status;

    setColunas(prev =>
      prev.map((col, idx) => {
        if (idx === colOrigemIdx) {
          return { ...col, tarefas: col.tarefas.filter(t => t.id.toString() !== activeId) };
        }
        if (idx === colDestinoIdx) {
          return { ...col, tarefas: [...col.tarefas, { ...tarefaParaMover!, status: novoStatus }] };
        }
        return col;
      })
    );

    try {
      await ApiTarefas.patch(
        `/tarefas/tarefas/${tarefaParaMover.id}/status`,
        `"${novoStatus}"`,
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      toastError("Erro ao atualizar status da tarefa. Tente novamente.");
      await carregarTarefas();
    }
  };

  const handleAbrirVisualizar = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa);
    setModalVisualizarAberto(true);
  };

  const handleAtualizarTarefa = () => carregarTarefas();

  const handleAbrirModalItem = (tarefaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onAbrirModalItem?.(tarefaId);
  };

  if (authLoading || loadingTarefas) {
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colunas.map(coluna => (
              <Droppable
                key={coluna.id}
                id={coluna.id}
                titulo={coluna.titulo}
                count={coluna.tarefas.length}
              >
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
                            prazo: formatarPrazo(tarefa.tempoMaximoMinutos),
                            status: tarefa.status,
                          }}
                          onAddItem={
                            podeGerenciarTodasTarefas
                              ? e => handleAbrirModalItem(tarefa.id, e)
                              : undefined
                          }
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
        podeGerenciarTodasTarefas={podeGerenciarTodasTarefas}
      />
    </>
  );
}