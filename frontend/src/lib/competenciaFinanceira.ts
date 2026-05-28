export interface CompetenciaFinanceira {
  ano: number;
  mes: number;
  chave: string;
  label: string;
  labelArquivo: string;
}

export const NOMES_MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const ABREV_MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function criarCompetencia(data: Date): CompetenciaFinanceira {
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  const label = `${NOMES_MESES[mes - 1]}/${ano}`;
  const labelArquivo = `${NOMES_MESES[mes - 1]}-${ano}`;

  return {
    ano,
    mes,
    chave: `${ano}-${String(mes).padStart(2, "0")}`,
    label,
    labelArquivo,
  };
}

export function criarCompetenciaPorAnoMes(
  ano: number,
  mes: number,
): CompetenciaFinanceira {
  return criarCompetencia(new Date(ano, mes - 1, 1));
}

export function compararCompetencias(
  primeira: CompetenciaFinanceira,
  segunda: CompetenciaFinanceira,
): number {
  return primeira.ano * 12 + primeira.mes - (segunda.ano * 12 + segunda.mes);
}

export function limitarCompetenciaFutura(
  competencia: CompetenciaFinanceira,
  competenciaAtual: CompetenciaFinanceira,
): CompetenciaFinanceira {
  if (compararCompetencias(competencia, competenciaAtual) > 0) {
    return competenciaAtual;
  }

  return competencia;
}
