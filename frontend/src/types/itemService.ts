import { ApiTarefas } from "../service/servicoApi";

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  tarefaId: number;
}

class ItemService {
  async criarItem(nome: string, descricao: string, tarefaId: number): Promise<Item> {
    const response = await ApiTarefas.post("/tarefas/itens", {
      nome,
      descricao,
      tarefaId
    });
    return response.data;
  }

  async listarItensPorTarefa(tarefaId: number): Promise<Item[]> {
    const response = await ApiTarefas.get(`/tarefas/itens/tarefa/${tarefaId}`);
    return response.data;
  }
}

export default new ItemService();