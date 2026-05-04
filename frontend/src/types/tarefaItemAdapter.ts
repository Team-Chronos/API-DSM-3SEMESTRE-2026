import itemService from '../types/itemService';
import type { Item } from '../types/itemService';
import { ApiTarefas } from '../service/servicoApi';

export interface TarefaComItem {
  id: number;
  titulo: string;
  descricao: string;
  responsavelId: number | null;
  status: string;
  projetoId: number;
  tipoTarefaId: number;
  tempoMaximoMinutos: number | string | null;
  itens: Item[];
}

class TarefaItemAdapter {
  async buscarTarefaComItem(tarefaId: number): Promise<TarefaComItem | null> {
    try {
      const response = await ApiTarefas.get(`/tarefas/tarefas/${tarefaId}`);
      const tarefa = response.data;
      const itens = await itemService.getItensPorTarefa(tarefaId);
      return { ...tarefa, itens };
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
      if (tarefa) resultado.set(tarefa.id, tarefa);
    });
    return resultado;
  }

  async buscarTarefasDoProjetoComItens(projetoId: number): Promise<TarefaComItem[]> {
    try {
      const response = await ApiTarefas.get(`/tarefas/tarefas/projeto/${projetoId}`);
      const tarefas = response.data;
      if (!Array.isArray(tarefas)) return [];
      return await Promise.all(
        tarefas.map(async (tarefa) => {
          const itens = await itemService.getItensPorTarefa(tarefa.id);
          return { ...tarefa, itens };
        })
      );
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
    itemData: { nome: string; descricao: string }
  ): Promise<TarefaComItem | null> {
    try {
      const response = await ApiTarefas.post('/tarefas/tarefas', tarefaData);
      const novaTarefa = response.data;
      const novoItem = await itemService.criarItem(itemData.nome, itemData.descricao, novaTarefa.id);
      return { ...novaTarefa, itens: [novoItem] };
    } catch (error) {
      console.error('Erro ao criar tarefa com item:', error);
      return null;
    }
  }

  async adicionarItemATarefa(tarefaId: number, nome: string, descricao: string): Promise<Item | null> {
    try {
      return await itemService.criarItem(nome, descricao, tarefaId);
    } catch (error) {
      console.error('Erro ao adicionar item à tarefa:', error);
      return null;
    }
  }
}

export default new TarefaItemAdapter();