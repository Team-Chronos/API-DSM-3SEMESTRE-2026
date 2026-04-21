import apiTarefas from "../services/apiTarefas"
import type { Tarefa } from "../types/tarefa"

export async function carregarTarefasPorProjeto(projetoId: number | string): Promise<Tarefa[]>{
  try {
    const res = await apiTarefas.get(`tarefas/projeto/${projetoId}`)
    return res.data
  } catch (error: any) {
    console.log("Erro ao buscar tarefas do projeto ", projetoId)
    return error
  }
}