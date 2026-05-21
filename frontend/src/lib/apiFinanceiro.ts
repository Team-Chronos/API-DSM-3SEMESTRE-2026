import axios from "axios";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoDetalhe,
  ProjetoFinanceiro,
} from "../types/financeiro";

const API_BASE = "/api/financeiro";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

function competenciaParams(ano: number, mes: number) {
  return { ano, mes };
}

export const apiFinanceiro = {
  async buscarDashboard(ano: number, mes: number): Promise<DashboardData> {
    const response = await api.get<DashboardData>("/financeiro/dashboard", {
      params: competenciaParams(ano, mes),
    });
    return response.data;
  },

  async buscarProjetos(ano: number, mes: number): Promise<ProjetoFinanceiro[]> {
    const response = await api.get<ProjetoFinanceiro[]>("/financeiro/projetos", {
      params: competenciaParams(ano, mes),
    });
    return response.data;
  },

  async buscarProfissionais(
    ano: number,
    mes: number,
  ): Promise<ProfissionalGanhos[]> {
    const response = await api.get<ProfissionalGanhos[]>(
      "/financeiro/profissionais",
      {
        params: competenciaParams(ano, mes),
      },
    );
    return response.data;
  },

  async buscarProfissionalPorId(
    usuarioId: number,
    bonus = 0,
    ano: number,
    mes: number,
  ): Promise<ProfissionalGanhos> {
    const response = await api.get<ProfissionalGanhos>(
      `/financeiro/profissionais/${usuarioId}`,
      {
        params: { bonus, ano, mes },
      },
    );
    return response.data;
  },

  async buscarProjetoDetalhe(
    projetoId: number,
    ano: number,
    mes: number,
  ): Promise<ProjetoDetalhe> {
    const response = await api.get<ProjetoDetalhe>(
      `/financeiro/projetos/${projetoId}/detalhes`,
      {
        params: competenciaParams(ano, mes),
      },
    );
    return response.data;
  },
};
