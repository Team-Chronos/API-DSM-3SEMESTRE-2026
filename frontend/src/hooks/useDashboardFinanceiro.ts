import { useCallback, useEffect, useRef, useState } from "react";
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
  carregandoInicial: boolean;
  atualizando: boolean;
  error: string | null;
  recarregar: () => Promise<void>;
}

export function useDashboardFinanceiro(
  ano: number,
  mes: number,
): UseDashboardFinanceiroResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projetos, setProjetos] = useState<ProjetoFinanceiro[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalGanhos[]>([]);
  const [loading, setLoading] = useState(true);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const possuiDadosRef = useRef(false);

  const carregar = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const possuiDados = possuiDadosRef.current;

    try {
      setLoading(true);
      setError(null);

      if (possuiDados) {
        setAtualizando(true);
      } else {
        setCarregandoInicial(true);
      }

      const [dashboardResponse, projetosResponse, profissionaisResponse] =
        await Promise.all([
          apiFinanceiro.buscarDashboard(ano, mes),
          apiFinanceiro.buscarProjetos(ano, mes),
          apiFinanceiro.buscarProfissionais(ano, mes),
        ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setDashboard(dashboardResponse);
      setProjetos(projetosResponse);
      setProfissionais(profissionaisResponse);
      possuiDadosRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const mensagem =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(mensagem);
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setLoading(false);
      setCarregandoInicial(false);
      setAtualizando(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    dashboard,
    projetos,
    profissionais,
    loading,
    carregandoInicial,
    atualizando,
    error,
    recarregar: carregar,
  };
}
