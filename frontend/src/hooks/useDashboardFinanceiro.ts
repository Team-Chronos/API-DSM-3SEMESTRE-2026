import { useCallback, useEffect, useState } from "react";
import { apiFinanceiro } from "../lib/apiFinanceiro";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoFinanceiro,
} from "../types/financeiro";

interface UseDashboardFinanceiroResult {
  dashboard: DashboardData | null;
  projetos: ProjetoFinanceiro[];
  profissionais: ProfissionalGanhos[];
  loading: boolean;
  error: string | null;
  recarregar: () => Promise<void>;
}

export function useDashboardFinanceiro(): UseDashboardFinanceiroResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projetos, setProjetos] = useState<ProjetoFinanceiro[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalGanhos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, projetosResponse, profissionaisResponse] =
        await Promise.all([
          apiFinanceiro.buscarDashboard(),
          apiFinanceiro.buscarProjetos(),
          apiFinanceiro.buscarProfissionais(),
        ]);

      setDashboard(dashboardResponse);
      setProjetos(projetosResponse);
      setProfissionais(profissionaisResponse);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    dashboard,
    projetos,
    profissionais,
    loading,
    error,
    recarregar: carregar,
  };
}