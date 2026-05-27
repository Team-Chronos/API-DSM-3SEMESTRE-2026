import FinanceiroConteudo from "../../components/dashboard/FinanceiroConteudo";
import FinanceiroErro from "../../components/dashboard/FinanceiroErro";
import FinanceiroHeader from "../../components/dashboard/FinanceiroHeader";
import FinanceiroLoading from "../../components/dashboard/FinanceiroLoading";
import ModalExportarRelatorio from "../../components/modais/ModalExportarRelatorio";
import { useBuscaFinanceira } from "../../hooks/useBuscaFinanceira";
import { useCompetenciaFinanceira } from "../../hooks/useCompetenciaFinanceira";
import { useDashboardFinanceiro } from "../../hooks/useDashboardFinanceiro";
import { useExportacaoRelatorio } from "../../hooks/useExportacaoRelatorio";

export default function FinanceiroPage() {
  const {
    competenciaAtual,
    competenciaSelecionada,
    podeAvancarMes,
    selecionarCompetencia,
    irParaMesAnterior,
    irParaProximoMes,
  } = useCompetenciaFinanceira();

  const {
    dashboard,
    projetos,
    profissionais,
    carregandoInicial,
    atualizando,
    error,
    recarregar,
  } = useDashboardFinanceiro(competenciaSelecionada.ano, competenciaSelecionada.mes);

  const {
    buscaProjetos,
    setBuscaProjetos,
    buscaProfissionais,
    setBuscaProfissionais,
    projetosFiltrados,
    profissionaisFiltrados,
  } = useBuscaFinanceira(projetos, profissionais);

  const exportacao = useExportacaoRelatorio({
    dashboard,
    projetos,
    projetosFiltrados,
    profissionais,
    profissionaisFiltrados,
    competenciaLabel: competenciaSelecionada.label,
    atualizando,
  });

  if (carregandoInicial) {
    return <FinanceiroLoading />;
  }

  if (!dashboard) {
    return (
      <FinanceiroErro
        error={error}
        onRecarregar={() => void recarregar()}
      />
    );
  }

  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] text-white">
      <div className="mx-auto w-full max-w-[1280px] min-w-0 space-y-6 px-4 py-10 sm:px-6">
        <FinanceiroHeader
          competencia={competenciaSelecionada}
          competenciaAtual={competenciaAtual}
          atualizando={atualizando}
          podeAvancarMes={podeAvancarMes}
          totalProjetos={projetos.length}
          totalProjetosFiltrados={projetosFiltrados.length}
          totalProfissionais={profissionais.length}
          totalProfissionaisFiltrados={profissionaisFiltrados.length}
          onSelecionarCompetencia={selecionarCompetencia}
          onMesAnterior={irParaMesAnterior}
          onProximoMes={irParaProximoMes}
          onExportarRelatorio={exportacao.abrirModal}
        />

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm text-red-100">
            Não foi possível atualizar os dados agora. Os valores exibidos são os últimos carregados.
          </div>
        )}

        <FinanceiroConteudo
          dashboard={dashboard}
          projetos={projetos}
          profissionais={profissionais}
          competencia={competenciaSelecionada}
          buscaProjetos={buscaProjetos}
          buscaProfissionais={buscaProfissionais}
          atualizando={atualizando}
          onBuscaProjetosChange={setBuscaProjetos}
          onBuscaProfissionaisChange={setBuscaProfissionais}
        />

        <ModalExportarRelatorio
          aberto={exportacao.modalAberto}
          onFechar={exportacao.fecharModal}
          formato={exportacao.formato}
          onFormatoChange={exportacao.setFormato}
          incluirIndicadores={exportacao.incluirIndicadores}
          onIncluirIndicadoresChange={exportacao.setIncluirIndicadores}
          incluirProjetos={exportacao.incluirProjetos}
          onIncluirProjetosChange={exportacao.setIncluirProjetos}
          incluirProfissionais={exportacao.incluirProfissionais}
          onIncluirProfissionaisChange={exportacao.setIncluirProfissionais}
          apenasFiltrados={exportacao.apenasFiltrados}
          onApenasFiltradosChange={exportacao.setApenasFiltrados}
          carregando={exportacao.carregando}
          erro={exportacao.erro}
          onConfirmar={exportacao.exportarRelatorio}
        />
      </div>
    </section>
  );
}
