import { useMemo, useState } from "react";
import { filtrarProfissionais, filtrarProjetos } from "../lib/filtrosFinanceiro";
import type { ProfissionalGanhos, ProjetoFinanceiro } from "../types/financeiro";

export function useBuscaFinanceira(
  projetos: ProjetoFinanceiro[],
  profissionais: ProfissionalGanhos[],
) {
  const [buscaProjetos, setBuscaProjetos] = useState("");
  const [buscaProfissionais, setBuscaProfissionais] = useState("");

  const projetosFiltrados = useMemo(
    () => filtrarProjetos(projetos, buscaProjetos),
    [projetos, buscaProjetos],
  );

  const profissionaisFiltrados = useMemo(
    () => filtrarProfissionais(profissionais, buscaProfissionais),
    [profissionais, buscaProfissionais],
  );

  return {
    buscaProjetos,
    setBuscaProjetos,
    buscaProfissionais,
    setBuscaProfissionais,
    projetosFiltrados,
    profissionaisFiltrados,
  };
}
