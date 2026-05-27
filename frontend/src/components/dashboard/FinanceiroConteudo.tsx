import IndicadoresGrid from "./IndicadoresGrid";
import ListaProfissionais from "./ListaProfissionais";
import ListaProjetos from "./ListaProjetos";
import FinanceiroResumoLateral from "./FinanceiroResumoLateral";
import type { CompetenciaFinanceira } from "../../lib/competenciaFinanceira";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoFinanceiro,
} from "../../types/financeiro";

interface FinanceiroConteudoProps {
  dashboard: DashboardData;
  projetos: ProjetoFinanceiro[];
  profissionais: ProfissionalGanhos[];
  competencia: CompetenciaFinanceira;
  buscaProjetos: string;
  buscaProfissionais: string;
  atualizando: boolean;
  onBuscaProjetosChange: (busca: string) => void;
  onBuscaProfissionaisChange: (busca: string) => void;
}

export default function FinanceiroConteudo({
  dashboard,
  projetos,
  profissionais,
  competencia,
  buscaProjetos,
  buscaProfissionais,
  atualizando,
  onBuscaProjetosChange,
  onBuscaProfissionaisChange,
}: FinanceiroConteudoProps) {
  return (
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
              ano={competencia.ano}
              mes={competencia.mes}
              buscaExterna={buscaProjetos}
              onBuscaExternaChange={onBuscaProjetosChange}
            />

            <ListaProfissionais
              profissionais={profissionais}
              buscaExterna={buscaProfissionais}
              onBuscaExternaChange={onBuscaProfissionaisChange}
            />
          </section>
        </div>

        <FinanceiroResumoLateral dashboard={dashboard} />
      </div>
    </div>
  );
}
