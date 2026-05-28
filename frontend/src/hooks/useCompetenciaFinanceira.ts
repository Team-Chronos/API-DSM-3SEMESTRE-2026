import { useMemo, useState } from "react";
import {
  compararCompetencias,
  criarCompetencia,
  criarCompetenciaPorAnoMes,
  limitarCompetenciaFutura,
  type CompetenciaFinanceira,
} from "../lib/competenciaFinanceira";

export function useCompetenciaFinanceira() {
  const competenciaAtual = useMemo(() => criarCompetencia(new Date()), []);

  const [competenciaSelecionada, setCompetenciaSelecionada] =
    useState<CompetenciaFinanceira>(competenciaAtual);

  const podeAvancarMes =
    compararCompetencias(competenciaSelecionada, competenciaAtual) < 0;

  function selecionarCompetencia(ano: number, mes: number) {
    const novaCompetencia = criarCompetenciaPorAnoMes(ano, mes);
    setCompetenciaSelecionada(
      limitarCompetenciaFutura(novaCompetencia, competenciaAtual),
    );
  }

  function irParaMesAnterior() {
    setCompetenciaSelecionada((competencia) =>
      criarCompetencia(new Date(competencia.ano, competencia.mes - 2, 1)),
    );
  }

  function irParaProximoMes() {
    if (!podeAvancarMes) return;

    setCompetenciaSelecionada((competencia) =>
      limitarCompetenciaFutura(
        criarCompetencia(new Date(competencia.ano, competencia.mes, 1)),
        competenciaAtual,
      ),
    );
  }

  return {
    competenciaAtual,
    competenciaSelecionada,
    podeAvancarMes,
    selecionarCompetencia,
    irParaMesAnterior,
    irParaProximoMes,
  };
}
