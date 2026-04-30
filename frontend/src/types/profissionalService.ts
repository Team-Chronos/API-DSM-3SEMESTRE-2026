import { ApiProfissionais } from "../service/servicoApi";

export interface Profissional {
  id: number;
  nome: string;
  email?: string;
  ativo?: boolean;
}

export interface ProjetoVinculado {
  id?: number;
  projetoId?: number;
  nome?: string;
  codigo?: string;
  responsavelId?: number;
}

class ProfissionalService {
  async listarTodos(): Promise<Profissional[]> {
    try {
      const response = await ApiProfissionais.get(
        "/profissionais/api/profissionais",
      );
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      return [];
    }
  }

  async listarProjetosVinculados(
    usuarioId: number,
  ): Promise<ProjetoVinculado[]> {
    try {
      const response = await ApiProfissionais.get(
        `/profissionais/api/profissionais/${usuarioId}/projetos`,
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Erro ao buscar projetos vinculados:", error);
      return [];
    }
  }
}

export default new ProfissionalService();
