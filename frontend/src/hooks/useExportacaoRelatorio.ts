import { useState } from "react";
import {
  exportarRelatorioFinanceiro,
  type FormatoExportacao,
} from "../lib/financeiroExport";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoFinanceiro,
} from "../types/financeiro";

interface UseExportacaoRelatorioParams {
  dashboard: DashboardData | null;
  projetos: ProjetoFinanceiro[];
  projetosFiltrados: ProjetoFinanceiro[];
  profissionais: ProfissionalGanhos[];
  profissionaisFiltrados: ProfissionalGanhos[];
  competenciaLabel: string;
  atualizando: boolean;
}

export function useExportacaoRelatorio({
  dashboard,
  projetos,
  projetosFiltrados,
  profissionais,
  profissionaisFiltrados,
  competenciaLabel,
  atualizando,
}: UseExportacaoRelatorioParams) {
  const [modalAberto, setModalAberto] = useState(false);
  const [formato, setFormato] = useState<FormatoExportacao>("csv");
  const [incluirIndicadores, setIncluirIndicadores] = useState(true);
  const [incluirProjetos, setIncluirProjetos] = useState(true);
  const [incluirProfissionais, setIncluirProfissionais] = useState(true);
  const [apenasFiltrados, setApenasFiltrados] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function abrirModal() {
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setErro(null);
  }

  async function exportarRelatorio() {
    if (!dashboard || atualizando) {
      return;
    }

    try {
      setCarregando(true);
      setErro(null);

      exportarRelatorioFinanceiro({
        formato,
        incluirIndicadores,
        incluirProjetos,
        incluirProfissionais,
        apenasFiltrados,
        dashboard,
        projetos: apenasFiltrados ? projetosFiltrados : projetos,
        profissionais: apenasFiltrados ? profissionaisFiltrados : profissionais,
        competenciaLabel,
      });

      setModalAberto(false);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao exportar relatório";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return {
    modalAberto,
    abrirModal,
    fecharModal,
    formato,
    setFormato,
    incluirIndicadores,
    setIncluirIndicadores,
    incluirProjetos,
    setIncluirProjetos,
    incluirProfissionais,
    setIncluirProfissionais,
    apenasFiltrados,
    setApenasFiltrados,
    carregando,
    erro,
    exportarRelatorio,
  };
}
