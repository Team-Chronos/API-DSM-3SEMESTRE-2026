import { ApiProfissionais } from "../service/servicoApi";

export interface Profissional {
  id: number;
  nome: string;
  email?: string;
  ativo?: boolean;
}

class ProfissionalService {
  async listarTodos(): Promise<Profissional[]> {
    try {
      const response = await ApiProfissionais.get("/profissionais/api/profissionais");
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      return [];
    }
  }
}

export default new ProfissionalService();