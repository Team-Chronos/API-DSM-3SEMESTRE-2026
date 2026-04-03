import type { DashboardData } from "../../types/financeiro";

interface IndicadoresGridProps {
  dashboard: DashboardData;
}

function valorValido(valor: number): boolean {
  return Number.isFinite(valor);
}

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

interface CardResumoProps {
  titulo: string;
  valor: number;
}

function CardResumo({ titulo, valor }: CardResumoProps) {
  const temValor = valorValido(valor);

  return (
    <div className="rounded-[15px] bg-[#232329] px-7 py-7">
      <p className="text-[15px] text-white/75">{titulo}</p>

      <p className="mt-10 text-3xl font-semibold leading-none text-white">
        {temValor ? formatarNumero(valor) : "--"}
      </p>

      {!temValor && (
        <p className="mt-4 text-sm text-white/45">Sem dados disponíveis</p>
      )}
    </div>
  );
}

export default function IndicadoresGrid({
  dashboard,
}: IndicadoresGridProps) {
  return (
    <section className="grid gap-5 md:grid-cols-3">
      <CardResumo
        titulo="Horas Trabalhadas"
        valor={dashboard.totalHoras}
      />

      <CardResumo
        titulo="Task Concluídas"
        valor={dashboard.tarefasConcluidas}
      />

      <CardResumo
        titulo="Projetos em Andamento"
        valor={dashboard.totalProjetos}
      />
    </section>
  );
}