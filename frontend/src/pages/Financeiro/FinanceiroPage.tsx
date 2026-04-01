import IndicadoresGrid from "../../components/dashboard/IndicadoresGrid";
import ListaProfissionais from "../../components/dashboard/ListaProfissionais";
import ListaProjetos from "../../components/dashboard/ListaProjetos";
import SemConteudo from "../../components/ui/SemConteudo";
import { useDashboardFinanceiro } from "../../hooks/useDashboardFinanceiro";

function valorValido(valor: number): boolean {
  return Number.isFinite(valor);
}

function formatarMoeda(valor: number): string {
  if (!valorValido(valor)) {
    return "--";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarInteiro(valor: number): string {
  if (!valorValido(valor)) {
    return "--";
  }

  return new Intl.NumberFormat("pt-BR").format(valor);
}

export default function FinanceiroPage() {
  const { dashboard, projetos, profissionais, loading, error, recarregar } =
    useDashboardFinanceiro();

  if (loading) {
    return (
      <section className="min-h-screen bg-[#1b1b1f] px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <div className="grid gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[15px] bg-[#232329]"
              />
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-[620px] animate-pulse rounded-[15px] bg-[#232329]" />
              <div className="h-[620px] animate-pulse rounded-[15px] bg-[#232329]" />
            </div>

            <div className="h-[681px] animate-pulse rounded-[15px] bg-[#5b21b6]" />
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
              className="rounded-2xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500"
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
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <IndicadoresGrid dashboard={dashboard} />

            <section className="grid gap-5 md:grid-cols-2">
              <ListaProjetos projetos={projetos} />
              <ListaProfissionais profissionais={profissionais} />
            </section>
          </div>

          <aside className="h-[450px] w-[250px] rounded-[15px] bg-gradient-to-b from-[#6627cc] to-[#4a1898] px-8 py-9 shadow-[0_20px_60px_rgba(76,29,149,0.35)]">
            <div className="flex h-full flex-col justify-start gap-16">
              <div>
                <p className="text-[15px] font-medium text-white/85">
                  Desenvolvedores
                </p>
                <p className="mt-4 text-3xl font-semibold leading-none">
                  {formatarInteiro(dashboard.totalDesenvolvedores)}
                </p>
              </div>

              <div>
                <p className="text-[15px] font-medium text-white/85">
                  Custo Total Projetos
                </p>
                <p className="mt-4 text-3xl font-semibold leading-tight">
                  {formatarMoeda(dashboard.custoTotal)}
                </p>
              </div>

              <div>
                <p className="text-[15px] font-medium text-white/85">
                  Projetos Concluídos
                </p>
                <p className="mt-4 text-3xl font-semibold leading-none">
                  {formatarInteiro(dashboard.projetosConcluidos)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}