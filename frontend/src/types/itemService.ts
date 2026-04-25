import { ApiTarefas } from "../service/servicoApi";

export interface Item {
  idItem: number;
  nome: string;
  descricao: string;
  tarefaId?: number;
}

class ItemService {
  async getItensPorTarefa(tarefaId: number): Promise<Item[]> {
    try {
      const response = await ApiTarefas.get(`/tarefas/itens/tarefa/${tarefaId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Erro ao buscar itens da tarefa ${tarefaId}:`, error);
      return [];
    }
  }

  async criarItem(nome: string, descricao: string, tarefaId: number): Promise<Item> {
    const response = await ApiTarefas.post("/tarefas/itens", {
      nome,
      descricao,
      tarefaId
    });
    return response.data;
  }
}

export default new ItemService();