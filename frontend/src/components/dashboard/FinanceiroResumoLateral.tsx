import { formatarInteiro, formatarMoeda } from "../../lib/formatadoresFinanceiro";
import type { DashboardData } from "../../types/financeiro";

interface FinanceiroResumoLateralProps {
  dashboard: DashboardData;
}

export default function FinanceiroResumoLateral({
  dashboard,
}: FinanceiroResumoLateralProps) {
  return (
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
  );
}
