import { ApiProjeto } from "../service/servicoApi";

export interface Projeto1 {
  id: number;
  nome: string;
  codigo?: string;
  descricao?: string;
  status?: string;
  responsavelId?: number;
  dataCriacao: string;
}

class ProjetoService {
  async listarTodos(): Promise<Projeto1[]> {
    try {
      const response = await ApiProjeto.get("/projeto/projetos");
      return response.data || [];
    } catch (error) {
      console.warn("Erro ao buscar projetos:", error);
      return [];
    }
  }

  async buscarPorId(id: number): Promise<Projeto1 | undefined> {
    try {
      const response = await ApiProjeto.get(`/projeto/projetos/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Erro ao buscar projeto:", error);
      return undefined;
    }
  }
}

export default new ProjetoService();