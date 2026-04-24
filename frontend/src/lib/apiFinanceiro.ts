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
  }
);

export const apiFinanceiro = {
  async buscarDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>("/financeiro/dashboard");
    return response.data;
  },

  async buscarProjetos(): Promise<ProjetoFinanceiro[]> {
    const response = await api.get<ProjetoFinanceiro[]>("/financeiro/projetos");
    return response.data;
  },

  async buscarProfissionais(): Promise<ProfissionalGanhos[]> {
    const response = await api.get<ProfissionalGanhos[]>("/financeiro/profissionais");
    return response.data;
  },

  async buscarProfissionalPorId(usuarioId: number, bonus = 0): Promise<ProfissionalGanhos> {
    const response = await api.get<ProfissionalGanhos>(`/financeiro/profissionais/${usuarioId}`, {
      params: { bonus },
    });
    return response.data;
  },

  async buscarProjetoDetalhe(projetoId: number): Promise<ProjetoDetalhe> {
    const response = await api.get<ProjetoDetalhe>(`/financeiro/projetos/${projetoId}/detalhes`);
    return response.data;
  },
};