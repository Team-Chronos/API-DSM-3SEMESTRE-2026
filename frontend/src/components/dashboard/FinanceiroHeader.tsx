import { NOMES_MESES, type CompetenciaFinanceira } from "../../lib/competenciaFinanceira";
import MonthPicker from "./MonthPicker";

interface FinanceiroHeaderProps {
  competencia: CompetenciaFinanceira;
  competenciaAtual: CompetenciaFinanceira;
  atualizando: boolean;
  podeAvancarMes: boolean;
  totalProjetos: number;
  totalProjetosFiltrados: number;
  totalProfissionais: number;
  totalProfissionaisFiltrados: number;
  onSelecionarCompetencia: (ano: number, mes: number) => void;
  onMesAnterior: () => void;
  onProximoMes: () => void;
  onExportarRelatorio: () => void;
}

export default function FinanceiroHeader({
  competencia,
  competenciaAtual,
  atualizando,
  podeAvancarMes,
  totalProjetos,
  totalProjetosFiltrados,
  totalProfissionais,
  totalProfissionaisFiltrados,
  onSelecionarCompetencia,
  onMesAnterior,
  onProximoMes,
  onExportarRelatorio,
}: FinanceiroHeaderProps) {
  return (
    <div className="relative min-w-0 rounded-2xl border border-white/10 bg-[#232329] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="relative overflow-visible rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Competência financeira
            </p>

            <h1 className="mt-2 text-3xl font-bold capitalize text-white">
              {NOMES_MESES[competencia.mes - 1]}{" "}
              <span className="text-white/60">{competencia.ano}</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Os valores abaixo consideram apenas as horas apontadas dentro deste mês.
            </p>

            {atualizando && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Atualizando dados da competência...
              </div>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:w-auto xl:flex-none">
            <div className="flex w-full min-w-0 items-center gap-1 rounded-2xl border border-white/15 p-1 backdrop-blur sm:w-auto">
              <button
                type="button"
                onClick={onMesAnterior}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/15 hover:text-white"
                title="Mês anterior"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <MonthPicker
                competencia={competencia}
                competenciaAtual={competenciaAtual}
                onSelecionar={onSelecionarCompetencia}
              />

              <button
                type="button"
                onClick={onProximoMes}
                disabled={!podeAvancarMes}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                title="Próximo mês"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={onExportarRelatorio}
              disabled={atualizando}
              className="h-12 w-full rounded-2xl bg-white px-5 text-sm font-bold text-[#6627cc] shadow-lg shadow-black/20 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Exportar relatório
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2 px-6 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p className="min-w-0 shrink-0">
          Projetos: {totalProjetosFiltrados}/{totalProjetos} • Profissionais: {totalProfissionaisFiltrados}/{totalProfissionais}
        </p>
      </div>
    </div>
  );
}
