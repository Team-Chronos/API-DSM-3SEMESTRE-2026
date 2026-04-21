import itemService from './itemService';
import type { Item } from './itemService';
import { ApiTarefas } from '../services/api/servicoApi';

export interface TarefaComItem {
  id: number;
  titulo: string;
  descricao: string;
  responsavelId: number | null;
  status: string;
  projetoId: number;
  tipoTarefaId: number;
  tempoMaximoMinutos: number | string | null;
  item: Item | null;
}

class TarefaItemAdapter {
  async buscarTarefaComItem(tarefaId: number): Promise<TarefaComItem | null> {
    try {
      const response = await ApiTarefas.get(`/tarefas/${tarefaId}`);
      const tarefa = response.data;

      const itens = await itemService.getItensPorTarefa(tarefaId);
      const item = itens.length > 0 ? itens[0] : null;

      return {
        ...tarefa,
        item
      };
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${tarefaId} com item:`, error);
      return null;
    }
  }

  async buscarMultiplasTarefasComItem(tarefasIds: number[]): Promise<Map<number, TarefaComItem>> {
    const resultado = new Map<number, TarefaComItem>();

    const promises = tarefasIds.map(id => this.buscarTarefaComItem(id));
    const tarefas = await Promise.all(promises);

    tarefas.forEach(tarefa => {
      if (tarefa) {
        resultado.set(tarefa.id, tarefa);
      }
    });

    return resultado;
  }

  async buscarTarefasDoProjetoComItens(projetoId: number): Promise<TarefaComItem[]> {
    try {
      const response = await ApiTarefas.get(`/tarefas/projeto/${projetoId}`);
      const tarefas = response.data;

      if (!Array.isArray(tarefas)) {
        return [];
      }

      const tarefasComItens = await Promise.all(
        tarefas.map(async (tarefa) => {
          const itens = await itemService.getItensPorTarefa(tarefa.id);
          return {
            ...tarefa,
            item: itens.length > 0 ? itens[0] : null
          };
        })
      );

      return tarefasComItens;
    } catch (error) {
      console.error(`Erro ao buscar tarefas do projeto ${projetoId} com itens:`, error);
      return [];
    }
  }

  async criarTarefaComItem(
    tarefaData: {
      titulo: string;
      descricao: string;
      responsavelId?: number | null;
      tempoMaximoMinutos: number;
      status: string;
      tipoTarefaId: number;
      projetoId: number;
    },
    itemData: {
      nome: string;
      descricao: string;
    }
  ): Promise<TarefaComItem | null> {
    try {
      const novoItem = await itemService.criarItem(
        itemData.nome,
        itemData.descricao,
        0
      );

      const tarefaParaCriar = {
        ...tarefaData,
        itemId: novoItem.id
      };

      const response = await ApiTarefas.post("/tarefas", tarefaParaCriar);
      const novaTarefa = response.data;

      await ApiTarefas.put(`/itens/${novoItem.id}`, {
        nome: novoItem.nome,
        descricao: novoItem.descricao,
        tarefaId: novaTarefa.id
      });

      return {
        ...novaTarefa,
        item: { ...novoItem, tarefaId: novaTarefa.id }
      };
    } catch (error) {
      console.error("Erro ao criar tarefa com item:", error);
      return null;
    }
  }

  async adicionarItemATarefa(
    tarefaId: number,
    nome: string,
    descricao: string
  ): Promise<Item | null> {
    try {
      const novoItem = await itemService.criarItem(nome, descricao, tarefaId);

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
        itemId: novoItem.id
      };

      await ApiTarefas.put(`/tarefas/${tarefaId}`, tarefaAtualizada);

      return novoItem;
    } catch (error) {
      console.error("Erro ao adicionar item à tarefa:", error);
      return null;
    }
  }

  async removerItemDaTarefa(tarefaId: number): Promise<boolean> {
    try {
      const tarefaResponse = await ApiTarefas.get(`/tarefas/${tarefaId}`);
      const tarefa = tarefaResponse.data;

      if (!tarefa.itemId) {
        return true;
      }

      const tarefaAtualizada = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: tarefa.responsavelId,
        tempoMaximoMinutos: tarefa.tempoMaximoMinutos,
        status: tarefa.status,
        tipoTarefaId: tarefa.tipoTarefaId,
        projetoId: tarefa.projetoId,
        itemId: null
      };

      await ApiTarefas.put(`/tarefas/${tarefaId}`, tarefaAtualizada);

      return true;
    } catch (error) {
      console.error("Erro ao remover item da tarefa:", error);
      return false;
    }
  }
}

export default new TarefaItemAdapter();
