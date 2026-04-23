import { ApiTarefas } from "../service/servicoApi";

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  tarefaId: number;
}

class ItemService {
  async criarItem(nome: string, descricao: string, tarefaId: number): Promise<any> {
    const response = await ApiTarefas.post('/itens', {
      nome,
      descricao,
      tarefaId
    });
    return response.data;
  }

  async vincularItemATarefa(tarefaId: number, itemId: number): Promise<boolean> {
    try {
      await ApiTarefas.put(`/tarefas/${tarefaId}/item/${itemId}`);
      return true;
    } catch (error) {
      console.error("Erro ao vincular item:", error);
      return false;
    }
  }

  async getItensPorTarefa(tarefaId: number): Promise<Item[]> {
    try {
      const response = await ApiTarefas.get(`/tarefas/${tarefaId}/itens`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("Erro ao buscar itens:", error);
      return [];
    }
  }
}

export default new ItemService();
