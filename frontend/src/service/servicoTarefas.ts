import { ApiTarefas } from "./servicoApi";
import type { Tarefa } from "../types/tarefa";
import type { Item } from "../types/item";

export async function carregarTarefasPorProjeto(
  projetoId: number | string,
): Promise<Tarefa[]> {
  try {
    const res = await ApiTarefas.get(`/tarefas/tarefas/projeto/${projetoId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    console.warn("Falha ao carregar tarefas do projeto.");
    return [];
  }
}
export async function carregarTarefasPorProjetoEResponsavel(
  projetoId: number | string,
  responsavelId: number | string,
): Promise<Tarefa[]> {
  try {
    const res = await ApiTarefas.get(
      `/tarefas/tarefas/projeto/${projetoId}/responsavel/${responsavelId}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    console.warn("Falha ao carregar tarefas do projeto por responsável.");
    return [];
  }
}
export async function carregarItensPorProjeto(
  projetoId: number,
): Promise<Item[]> {
  try {
    const res = await ApiTarefas.get(`/tarefas/itens/projeto/${projetoId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    console.warn(
      "Não foi possível carregar itens do projeto. O backend pode não ter suporte a esse recurso.",
    );
    return [];
  }
}

export async function carregarTarefaPorId(
  tarefaId: number,
): Promise<Tarefa | null> {
  try {
    const res = await ApiTarefas.get(`/tarefas/tarefas/${tarefaId}`);
    return res.data || null;
  } catch {
    return null;
  }
}

export async function atualizarStatusTarefa(
  tarefaId: number,
  status: string,
): Promise<Tarefa | null> {
  try {
    const res = await ApiTarefas.patch(
      `/tarefas/tarefas/${tarefaId}/status`,
      `"${status}"`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return res.data || null;
  } catch {
    return null;
  }
}

export async function carregarItensPorTarefa(
  tarefaId: number,
): Promise<Item[]> {
  try {
    const res = await ApiTarefas.get(`/tarefas/itens/tarefa/${tarefaId}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    console.warn("Não foi possível carregar itens da tarefa:", tarefaId);
    return [];
  }
}
