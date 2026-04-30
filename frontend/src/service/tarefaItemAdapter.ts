import { ApiTarefas } from "./servicoApi";

export interface TarefaComItem {
  tarefa: any;
  item: any | null;
}

class TarefaItemAdapter {
  async buscarTarefaComItem(tarefaId: number): Promise<TarefaComItem> {
    try {
      const tarefaRes = await ApiTarefas.get(`/tarefas/tarefas/${tarefaId}`);
      const tarefa = tarefaRes.data;

      const itensRes = await ApiTarefas.get(`/tarefas/itens/tarefa/${tarefaId}`);
      const item = itensRes.data?.[0] || null; 

      return { tarefa, item };
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${tarefaId} com item:`, error);
      return { tarefa: null, item: null };
    }
  }
}

export default new TarefaItemAdapter();