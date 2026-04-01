import axios from "axios";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoDetalhe,
  ProjetoFinanceiro,
} from "../types/financeiro";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_FINANCEIRO_URL ??
    "http://localhost:8085/financeiro",
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiFinanceiro = {
  async buscarDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>("/dashboard");
    return response.data;
  },

  async buscarProjetos(): Promise<ProjetoFinanceiro[]> {
    const response = await api.get<ProjetoFinanceiro[]>("/projetos");
    return response.data;
  },

  async buscarProfissionais(): Promise<ProfissionalGanhos[]> {
    const response = await api.get<ProfissionalGanhos[]>("/profissionais");
    return response.data;
  },

  async buscarProfissionalPorId(
    usuarioId: number,
    bonus = 0
  ): Promise<ProfissionalGanhos> {
    const response = await api.get<ProfissionalGanhos>(
      `/profissionais/${usuarioId}`,
      {
        params: { bonus },
      }
    );
    return response.data;
  },

  async buscarProjetoDetalhe(projetoId: number): Promise<ProjetoDetalhe> {
    const response = await api.get<ProjetoDetalhe>(
      `/projetos/${projetoId}/detalhes`
    );
    return response.data;
  },
};