import { ApiResponsaveis } from "../service/servicoApi";

export interface Profissional {
  id: number;
  nome: string;
  email?: string;
  ativo?: boolean;
}

class ProfissionalService {
  async listarTodos(): Promise<Profissional[]> {
    try {
      const response = await ApiResponsaveis.get("/profissionais");
      
      console.log("Resposta do serviço:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          email: item.email,
          ativo: item.ativo
        }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error);
      return [];
    }
  }

  async listarNomes(): Promise<Profissional[]> {
    try {
      const response = await ApiResponsaveis.get("/profissionais/nomes");
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.warn("Erro ao buscar nomes dos profissionais:", error);
      return [];
    }
  }
}

export default new ProfissionalService();
