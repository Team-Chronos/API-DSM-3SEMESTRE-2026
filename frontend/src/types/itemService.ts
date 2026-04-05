import { ApiTarefas } from '../service/servicoApi';

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  tarefaId?: number;
  createdAt?: string;
}

class ItemService {
  async getItensPorTarefa(tarefaId: number): Promise<Item[]> {
    try {
      const response = await ApiTarefas.get(`/itens/tarefa/${tarefaId}`);
      if (response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      }
      return [];
    } catch (error) {
      console.error(`Erro ao buscar itens da tarefa ${tarefaId}:`, error);
      return [];
    }
  }

  async criarItem(nome: string, descricao: string, tarefaId: number): Promise<Item> {
    try {
      const response = await ApiTarefas.post('/itens', {
        nome,
        descricao
      });
      
      const novoItem = response.data;
      const itemId = novoItem.idItem || novoItem.id;
      
      const tarefaResponse = await ApiTarefas.get(`/tarefas/${tarefaId}`);
      const tarefa = tarefaResponse.data;
      
      const tarefaAtualizada = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: tarefa.responsavelId,
        tempoMaximoMinutos: tarefa.tempoMaximoMinutos,
        status: tarefa.status,
        tipoTarefaId: tarefa.tipoTarefaId,
        projetoId: tarefa.projetoId,
        itemId: itemId  
      };
      
      await ApiTarefas.put(`/tarefas/${tarefaId}`, tarefaAtualizada);
      
      return {
        id: itemId,
        nome: novoItem.nome,
        descricao: novoItem.descricao,
        tarefaId,
        createdAt: novoItem.createdAt || new Date().toISOString()
      };
      
    } catch (error) {
      console.error("Erro detalhado ao criar item:", error);
      throw error;
    }
  }

  async deletarItem(itemId: number): Promise<void> {
    try {
      await ApiTarefas.delete(`/itens/${itemId}`);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  }

  async atualizarItem(itemId: number, nome: string, descricao: string): Promise<Item | null> {
    try {
      const response = await ApiTarefas.put(`/itens/${itemId}`, { nome, descricao });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return null;
    }
  }

  async vincularItemATarefa(tarefaId: number, itemId: number): Promise<boolean> {
    try {
      const tarefaResponse = await ApiTarefas.get(`/tarefas/${tarefaId}`);
      const tarefa = tarefaResponse.data;
      
      const tarefaAtualizada = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: tarefa.responsavelId,
        tempoMaximoMinutos: tarefa.tempoMaximoMinutos,
        status: tarefa.status,
        tipoTarefaId: tarefa.tipoTarefaId,
        projetoId: tarefa.projetoId,
        itemId: itemId
      };
      
      await ApiTarefas.put(`/tarefas/${tarefaId}`, tarefaAtualizada);
      return true;
    } catch (error) {
      console.error("Erro ao vincular item:", error);
      return false;
    }
  }
}

export default new ItemService();