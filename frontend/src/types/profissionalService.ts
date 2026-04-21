import { ApiResponsaveis } from "../services/api/servicoApi";

export interface Profissional {
  id: number;
  nome: string;
  email?: string;
  ativo?: boolean;
}

class ProfissionalService {
  async listarTodos(): Promise<Profissional[]> {
    try {
      // Endpoint que retorna todos os profissionais com id e nome
      const response = await ApiResponsaveis.get("/api/profissionais");
      
      console.log("Resposta do microsserviço:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Mapeia para garantir que só temos id e nome
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

  // Método específico para buscar apenas nomes (se o endpoint /nomes existir)
  async listarNomes(): Promise<Profissional[]> {
    try {
      const response = await ApiResponsaveis.get("/api/profissionais/nomes");
      
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