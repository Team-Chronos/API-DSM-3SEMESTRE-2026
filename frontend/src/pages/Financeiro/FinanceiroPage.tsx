import { useEffect, useRef, useMemo, useState } from "react";
import IndicadoresGrid from "../../components/dashboard/IndicadoresGrid";
import ListaProfissionais from "../../components/dashboard/ListaProfissionais";
import ListaProjetos from "../../components/dashboard/ListaProjetos";
import ModalExportarRelatorio from "../../components/modais/ModalExportarRelatorio";
import SemConteudo from "../../components/ui/SemConteudo";
import { useDashboardFinanceiro } from "../../hooks/useDashboardFinanceiro";
import {
  exportarRelatorioFinanceiro,
  type FormatoExportacao,
} from "../../lib/financeiroExport";
import type { ProfissionalGanhos, ProjetoFinanceiro } from "../../types/financeiro";

interface CompetenciaFinanceira {
  ano: number;
  mes: number;
  chave: string;
  label: string;
  labelArquivo: string;
}

const NOMES_MESES = [
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

const ABREV_MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function valorValido(valor: number): boolean {
  return Number.isFinite(valor);
}

function formatarMoeda(valor: number): string {
  if (!valorValido(valor)) return "--";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarInteiro(valor: number): string {
  if (!valorValido(valor)) return "--";

  return new Intl.NumberFormat("pt-BR").format(valor);
}

function criarCompetencia(data: Date): CompetenciaFinanceira {
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

function criarCompetenciaPorAnoMes(ano: number, mes: number): CompetenciaFinanceira {
  return criarCompetencia(new Date(ano, mes - 1, 1));
}

function compararCompetencias(
  primeira: CompetenciaFinanceira,
  segunda: CompetenciaFinanceira,
): number {
  return primeira.ano * 12 + primeira.mes - (segunda.ano * 12 + segunda.mes);
}

function limitarCompetenciaFutura(
  competencia: CompetenciaFinanceira,
  competenciaAtual: CompetenciaFinanceira,
): CompetenciaFinanceira {
  if (compararCompetencias(competencia, competenciaAtual) > 0) {
    return competenciaAtual;
  }

  return competencia;
}

function filtrarProjetos(
  projetos: ProjetoFinanceiro[],
  busca: string,
): ProjetoFinanceiro[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) {
    return projetos;
  }

  return projetos.filter((projeto) => {
    return (
      projeto.nomeProjeto.toLowerCase().includes(termo) ||
      projeto.tipoProjeto.toLowerCase().includes(termo) ||
      String(projeto.projetoId).includes(termo)
    );
  });
}

function filtrarProfissionais(
  profissionais: ProfissionalGanhos[],
  busca: string,
): ProfissionalGanhos[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) {
    return profissionais;
  }

  return profissionais.filter((profissional) => {
    return (
      profissional.usuarioNome.toLowerCase().includes(termo) ||
      String(profissional.usuarioId).includes(termo)
    );
  });
}

interface MonthPickerProps {
  competencia: CompetenciaFinanceira;
  competenciaAtual: CompetenciaFinanceira;
  onSelecionar: (ano: number, mes: number) => void;
}

function MonthPicker({ competencia, competenciaAtual, onSelecionar }: MonthPickerProps) {
  const [aberto, setAberto] = useState(false);
  const [anoVisivel, setAnoVisivel] = useState(competencia.ano);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aberto) {
      setAnoVisivel(competencia.ano);
    }
  }, [aberto, competencia.ano]);

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", fecharAoClicarFora);
    }

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, [aberto]);

  function selecionarMes(mes: number) {
    onSelecionar(anoVisivel, mes);
    setAberto(false);
  }

  function isFutura(mes: number): boolean {
    return (
      anoVisivel > competenciaAtual.ano ||
      (anoVisivel === competenciaAtual.ano && mes > competenciaAtual.mes)
    );
  }

  function isSelecionada(mes: number): boolean {
    return anoVisivel === competencia.ano && mes === competencia.mes;
  }

  function isAtual(mes: number): boolean {
    return anoVisivel === competenciaAtual.ano && mes === competenciaAtual.mes;
  }

  const podeAvancarAno = anoVisivel < competenciaAtual.ano;

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="group flex h-10 w-full min-w-[10.5rem] items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/35 hover:bg-white/20 sm:w-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <span className="capitalize">
          {NOMES_MESES[competencia.mes - 1]}
        </span>

        <span className="text-white/60">{competencia.ano}</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-0.5 opacity-60 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[min(18rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#1e1c2e] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={() => setAnoVisivel((a) => a - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
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

            <span className="text-sm font-bold tracking-wide text-white">
              {anoVisivel}
            </span>

            <button
              type="button"
              onClick={() => setAnoVisivel((a) => a + 1)}
              disabled={!podeAvancarAno}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
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

          <div className="grid grid-cols-4 gap-1.5 p-3">
            {ABREV_MESES.map((abrev, index) => {
              const mes = index + 1;
              const futuro = isFutura(mes);
              const selecionado = isSelecionada(mes);
              const atual = isAtual(mes);

              return (
                <button
                  key={mes}
                  type="button"
                  disabled={futuro}
                  onClick={() => selecionarMes(mes)}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150",
                    selecionado
                      ? "bg-[#6627cc] text-white shadow-[0_4px_16px_rgba(102,39,204,0.45)]"
                      : futuro
                        ? "cursor-not-allowed text-white/20"
                        : atual
                          ? "border border-[#6627cc]/50 text-white hover:bg-white/10"
                          : "text-white/60 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {abrev}
                  {atual && !selecionado && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#6627cc]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/10 px-3 pb-3">
            <button
              type="button"
              onClick={() => {
                onSelecionar(competenciaAtual.ano, competenciaAtual.mes);
                setAberto(false);
              }}
              disabled={
                competencia.ano === competenciaAtual.ano &&
                competencia.mes === competenciaAtual.mes
              }
              className="w-full rounded-xl py-2 text-xs font-semibold text-white/50 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Ir para o mês atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinanceiroPage() {
  const competenciaAtual = useMemo(() => criarCompetencia(new Date()), []);

  const [competenciaSelecionada, setCompetenciaSelecionada] =
    useState<CompetenciaFinanceira>(competenciaAtual);

  const podeAvancarMes =
    compararCompetencias(competenciaSelecionada, competenciaAtual) < 0;

  const {
    dashboard,
    projetos,
    profissionais,
    carregandoInicial,
    atualizando,
    error,
    recarregar,
  } = useDashboardFinanceiro(competenciaSelecionada.ano, competenciaSelecionada.mes);

  const [modalExportacaoAberto, setModalExportacaoAberto] = useState(false);
  const [formatoExportacao, setFormatoExportacao] =
    useState<FormatoExportacao>("csv");
  const [incluirIndicadores, setIncluirIndicadores] = useState(true);
  const [incluirProjetos, setIncluirProjetos] = useState(true);
  const [incluirProfissionais, setIncluirProfissionais] = useState(true);
  const [apenasFiltrados, setApenasFiltrados] = useState(true);
  const [carregandoExportacao, setCarregandoExportacao] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);

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

  async function exportarRelatorio() {
    if (!dashboard || atualizando) {
      return;
    }

    try {
      setCarregandoExportacao(true);
      setErroExportacao(null);

      exportarRelatorioFinanceiro({
        formato: formatoExportacao,
        incluirIndicadores,
        incluirProjetos,
        incluirProfissionais,
        apenasFiltrados,
        dashboard,
        projetos: apenasFiltrados ? projetosFiltrados : projetos,
        profissionais: apenasFiltrados ? profissionaisFiltrados : profissionais,
        competenciaLabel: competenciaSelecionada.label,
      });

      setModalExportacaoAberto(false);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao exportar relatório";
      setErroExportacao(mensagem);
    } finally {
      setCarregandoExportacao(false);
    }
  }

  if (carregandoInicial) {
    return (
      <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto w-full max-w-[1280px] space-y-5">
          <div className="h-36 animate-pulse rounded-2xl bg-[#232329]" />

          <div className="grid gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl bg-[#232329]"
              />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-155 animate-pulse rounded-2xl bg-[#232329]" />
              <div className="h-155 animate-pulse rounded-2xl bg-[#232329]" />
            </div>

            <div className="h-170.25 animate-pulse rounded-2xl bg-[#232329]" />
          </div>
        </div>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <SemConteudo
            title="Erro ao carregar financeiro"
            description={error ?? "Não foi possível carregar os dados."}
          />

          <div className="mt-6">
            <button
              type="button"
              onClick={() => void recarregar()}
              className="rounded-xl bg-gradient-to-r from-[#6627cc] to-[#4a1898] px-5 py-3 font-medium text-white transition hover:brightness-110"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] text-white">
      <div className="mx-auto w-full max-w-[1280px] min-w-0 space-y-6 px-4 py-10 sm:px-6">
        <div className="relative min-w-0 rounded-2xl border border-white/10 bg-[#232329] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="relative overflow-visible rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Competência financeira
                </p>
                <h1 className="mt-2 text-3xl font-bold capitalize text-white">
                  {NOMES_MESES[competenciaSelecionada.mes - 1]}{" "}
                  <span className="text-white/60">{competenciaSelecionada.ano}</span>
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
                <div className="flex w-full min-w-0 items-center gap-1 rounded-2xl border border-white/15 bg-white/10 p-1 backdrop-blur sm:w-auto">
                  <button
                    type="button"
                    onClick={irParaMesAnterior}
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
                    competencia={competenciaSelecionada}
                    competenciaAtual={competenciaAtual}
                    onSelecionar={selecionarCompetencia}
                  />

                  <button
                    type="button"
                    onClick={irParaProximoMes}
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
                  onClick={() => setModalExportacaoAberto(true)}
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
              Projetos: {projetosFiltrados.length}/{projetos.length} • Profissionais: {profissionaisFiltrados.length}/{profissionais.length}
            </p>
            <p className="min-w-0 text-left md:text-right">Navegação livre para meses anteriores. Meses futuros permanecem bloqueados.</p>
          </div>
        </div>

        {error && dashboard && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm text-red-100">
            Não foi possível atualizar os dados agora. Os valores exibidos são os últimos carregados.
          </div>
        )}

        <div className="relative min-w-0">
          {atualizando && (
            <div className="absolute inset-0 z-20 flex items-start justify-center rounded-2xl bg-[#1b1b1f]/35 pt-10 backdrop-blur-[1px]">
              <div className="rounded-full border border-white/10 bg-[#232329]/95 px-4 py-2 text-sm font-semibold text-white shadow-2xl">
                Carregando novos dados...
              </div>
            </div>
          )}

          <div
            className={`grid min-w-0 gap-5 transition-opacity duration-200 xl:grid-cols-[minmax(0,1fr)_280px] ${
              atualizando ? "pointer-events-none opacity-45" : "opacity-100"
            }`}
          >
            <div className="min-w-0 space-y-5">
            <IndicadoresGrid dashboard={dashboard} />

            <section className="grid min-w-0 gap-5 lg:grid-cols-2">
              <ListaProjetos
                projetos={projetos}
                ano={competenciaSelecionada.ano}
                mes={competenciaSelecionada.mes}
                buscaExterna={buscaProjetos}
                onBuscaExternaChange={setBuscaProjetos}
              />
              <ListaProfissionais
                profissionais={profissionais}
                buscaExterna={buscaProfissionais}
                onBuscaExternaChange={setBuscaProfissionais}
              />
            </section>
          </div>

          <aside className="relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#6627cc] to-[#4a1898] p-6 shadow-[0_20px_60px_rgba(76,29,149,0.35)]">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <div className="space-y-2">
                <p className="text-sm text-white/80">Desenvolvedores</p>

                <p className="text-3xl font-semibold">
                  {formatarInteiro(dashboard.totalDesenvolvedores)}
                </p>
              </div>

              <div className="my-6 h-px bg-white/20" />

              <div className="space-y-2">
                <p className="text-sm text-white/80">Custo Total Projetos</p>

                <p className="text-3xl font-semibold">
                  {formatarMoeda(dashboard.custoTotal)}
                </p>
              </div>

              <div className="my-6 h-px bg-white/20" />

              <div className="space-y-2">
                <p className="text-sm text-white/80">Projetos Concluidos</p>

                <p className="text-3xl font-semibold">
                  {formatarInteiro(dashboard.projetosConcluidos)}
                </p>
              </div>
            </div>
            </aside>
          </div>
        </div>

        <ModalExportarRelatorio
          aberto={modalExportacaoAberto}
          onFechar={() => {
            setModalExportacaoAberto(false);
            setErroExportacao(null);
          }}
          formato={formatoExportacao}
          onFormatoChange={setFormatoExportacao}
          incluirIndicadores={incluirIndicadores}
          onIncluirIndicadoresChange={setIncluirIndicadores}
          incluirProjetos={incluirProjetos}
          onIncluirProjetosChange={setIncluirProjetos}
          incluirProfissionais={incluirProfissionais}
          onIncluirProfissionaisChange={setIncluirProfissionais}
          apenasFiltrados={apenasFiltrados}
          onApenasFiltradosChange={setApenasFiltrados}
          carregando={carregandoExportacao}
          erro={erroExportacao}
          onConfirmar={exportarRelatorio}
        />
      </div>
    </section>
  );
}