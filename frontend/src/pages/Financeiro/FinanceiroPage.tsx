import { useMemo, useState } from "react";
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

export default function FinanceiroPage() {
  const competenciaAtual = useMemo(() => criarCompetencia(new Date()), []);

  const [competenciaSelecionada, setCompetenciaSelecionada] =
    useState<CompetenciaFinanceira>(competenciaAtual);

  const podeAvancarMes =
    compararCompetencias(competenciaSelecionada, competenciaAtual) < 0;

  const { dashboard, projetos, profissionais, loading, error, recarregar } =
    useDashboardFinanceiro(competenciaSelecionada.ano, competenciaSelecionada.mes);

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

  function irParaMesAtual() {
    setCompetenciaSelecionada(competenciaAtual);
  }

  async function exportarRelatorio() {
    if (!dashboard) {
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

  if (loading) {
    return (
      <section className="min-h-screen bg-[#1b1b1f] px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-7xl space-y-5">
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

  if (error || !dashboard) {
    return (
      <section className="min-h-screen bg-[#1b1b1f] px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-7xl">
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
    <section className="min-h-screen bg-[#1b1b1f] text-white">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#232329] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Competência financeira
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white">
                  Mês {competenciaSelecionada.label}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  Os valores abaixo consideram apenas as horas apontadas dentro deste mês.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-2 py-2 backdrop-blur">
                  <button
                    type="button"
                    onClick={irParaMesAnterior}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/15"
                    aria-label="Mês anterior"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <div className="min-w-[150px] px-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                      Competência
                    </p>
                    <p className="text-sm font-bold text-white">
                      {competenciaSelecionada.label}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={irParaProximoMes}
                    disabled={!podeAvancarMes}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Próximo mês"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={irParaMesAtual}
                    disabled={competenciaSelecionada.chave === competenciaAtual.chave}
                    className="h-10 rounded-xl px-3 text-xs font-bold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Atual
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalExportacaoAberto(true)}
                  className="h-12 rounded-2xl bg-white px-5 text-sm font-bold text-[#6627cc] shadow-lg shadow-black/20 transition hover:bg-white/90"
                >
                  Exportar relatório
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-6 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>
              Projetos: {projetosFiltrados.length}/{projetos.length} • Profissionais: {profissionaisFiltrados.length}/{profissionais.length}
            </p>
            <p>Navegação livre para meses anteriores. Meses futuros permanecem bloqueados.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <IndicadoresGrid dashboard={dashboard} />

            <section className="grid gap-5 md:grid-cols-2">
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

          <aside className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#6627cc] to-[#4a1898] p-6 shadow-[0_20px_60px_rgba(76,29,149,0.35)]">
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
