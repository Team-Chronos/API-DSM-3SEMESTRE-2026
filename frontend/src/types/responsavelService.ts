import { ApiTarefas } from '../service/servicoApi';

export interface Responsavel {
  id: number;
  nome: string;
  email: string;
  cargo?: string;
}

class ResponsavelService {
  private storageKey = 'responsaveis';

  async listarTodos(): Promise<Responsavel[]> {
    try {
      const response = await ApiTarefas.get('/api/responsaveis');
      if (response.data && Array.isArray(response.data)) {
        localStorage.setItem(this.storageKey, JSON.stringify(response.data));
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Erro ao buscar responsáveis:", error);
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    }
  }

  async buscarPorId(id: number): Promise<Responsavel | undefined> {
    try {
      const response = await ApiTarefas.get(`/api/responsaveis/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Erro ao buscar responsável:", error);
      const responsaveis = await this.listarTodos();
      return responsaveis.find(r => r.id === id);
    }
  }

  getNomePorId(id: number | null): string {
    if (!id) return 'Não atribuído';
    const responsaveis = this.listarTodosSync();
    const resp = responsaveis.find(r => r.id === id);
    return resp ? resp.nome : `ID: ${id}`;
  }

  private listarTodosSync(): Responsavel[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
}

export default new ResponsavelService();