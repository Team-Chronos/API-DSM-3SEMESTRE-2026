import { ApiTarefas } from '../service/servicoApi'; 

export interface Projeto {
  id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  status?: string;
  responsavelId?: number;
  dataCriacao: string;
}

export interface ResponsavelProjeto {
  id: number;
  nome: string;
}

class ProjetoService {
  async listarTodos(): Promise<Projeto[]> {
    try {
      // Agora vai para http://localhost:8089/api/projeto/todos
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