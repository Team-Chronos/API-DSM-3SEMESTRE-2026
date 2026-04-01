import { ApiTarefas } from './servicoApi';

export interface Projeto {
  id: number;
  nome: string;
  codigo?: string;
  tipoProjeto?: string;
  valorHoraBase?: number;
  horasContratadas?: number;
  valorTotal?: number;
  dataInicio?: string;
  dataFim?: string;
  responsavelId?: number;
}

export interface ResponsavelProjeto {
  id: number;
  nome: string;
}

class ProjetoService {
  async listarTodos(): Promise<Projeto[]> {
    try {
      const response = await ApiTarefas.get('/api/projeto/todos');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Erro ao buscar projetos:", error);
      return [];
    }
  }

  async buscarPorId(id: number): Promise<Projeto | undefined> {
    try {
      const response = await ApiTarefas.get(`/api/projeto/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Erro ao buscar projeto:", error);
      return undefined;
    }
  }

  async listarResponsaveis(): Promise<ResponsavelProjeto[]> {
    try {
      const response = await ApiTarefas.get('/api/projeto/responsaveis');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Erro ao buscar responsáveis dos projetos:", error);
      return [];
    }
  }
}

export default new ProjetoService();