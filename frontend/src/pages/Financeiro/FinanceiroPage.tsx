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

function filtrarProjetos(
  projetos: ProjetoFinanceiro[],
  busca: string
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
  busca: string
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
  const { dashboard, projetos, profissionais, loading, error, recarregar } =
    useDashboardFinanceiro();

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
    [projetos, buscaProjetos]
  );

  const profissionaisFiltrados = useMemo(
    () => filtrarProfissionais(profissionais, buscaProfissionais),
    [profissionais, buscaProfissionais]
  );

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
      });

      setModalExportacaoAberto(false);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro ao exportar relató'rio";
      setErroExportacao(mensagem);
    } finally {
      setCarregandoExportacao(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#1b1b1f] px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-7xl space-y-5">
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
              className="
                rounded-xl
                bg-linear-to-r
                from-[#6627cc]
                to-[#4a1898]
                px-5
                py-3
                font-medium
                text-white
                transition
                hover:brightness-110
              "
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
      <div className="mx-auto w-full max-w-7xl px-6 py-10 space-y-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Financeiro</h1>
            <p className="text-sm text-gray-400">
              Visao geral dos custos e desempenho dos projetos
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalExportacaoAberto(true)}
            className="rounded-xl bg-gradient-to-b from-[#6627cc] to-[#4a1898] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
          >
            Exportar relatorio
          </button>
        </div>

        <p className="text-xs text-white/55">
          Filtros ativos: projetos ({projetosFiltrados.length}/{projetos.length}) e
          profissionais ({profissionaisFiltrados.length}/{profissionais.length}).
        </p>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">

          <div className="space-y-5">
            <IndicadoresGrid dashboard={dashboard} />

            <section className="grid gap-5 md:grid-cols-2">
              <ListaProjetos
                projetos={projetos}
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

          <aside
            className="
            relative
            overflow-hidden
            rounded-2xl
            bg-linear-to-b
            from-[#6627cc]
            to-[#4a1898]
            p-6
            shadow-[0_20px_60px_rgba(76,29,149,0.35)]
          "
          >
            <div className="absolute -top-20 -right-20 h-56 w-56 bg-white/10 rounded-full blur-3xl" />

            <div className="relative flex h-full flex-col">

              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Desenvolvedores
                </p>

                <p className="text-3xl font-semibold">
                  {formatarInteiro(dashboard.totalDesenvolvedores)}
                </p>
              </div>

              <div className="my-6 h-px bg-white/20" />

              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Custo Total Projetos
                </p>

                <p className="text-3xl font-semibold">
                  {formatarMoeda(dashboard.custoTotal)}
                </p>
              </div>

              <div className="my-6 h-px bg-white/20" />

              <div className="space-y-2">
                <p className="text-sm text-white/80">
                  Projetos Concluidos
                </p>

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