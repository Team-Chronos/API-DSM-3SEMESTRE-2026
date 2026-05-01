import { memo, useMemo, useState } from "react";
import SemConteudo from "../ui/SemConteudo";
import Search from "../ui/Search";
import ModalDetalheProjeto from "../modais/ModalDetalheProjeto";
import { apiFinanceiro } from "../../lib/apiFinanceiro";
import type { ProjetoDetalhe, ProjetoFinanceiro } from "../../types/financeiro";

interface ListaProjetosProps {
  projetos: ProjetoFinanceiro[];
  buscaExterna?: string;
  onBuscaExternaChange?: (valor: string) => void;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarHoras(valor: number): string {
  if (!Number.isFinite(valor) || valor < 0) {
    return "--";
  }

  const horas = Math.floor(valor);
  const minutos = Math.round((valor - horas) * 60);

  if (minutos === 0) {
    return `${horas}h`;
  }

  return `${horas}h${String(minutos).padStart(2, "0")}m`;
}

function ListaProjetos({
  projetos,
  buscaExterna,
  onBuscaExternaChange,
}: ListaProjetosProps) {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [buscaInterna, setBuscaInterna] = useState("");
  const [projetoSelecionado, setProjetoSelecionado] =
    useState<ProjetoDetalhe | null>(null);
  const [carregandoProjetoId, setCarregandoProjetoId] = useState<number | null>(
    null
  );
  const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);

  const busca = buscaExterna ?? buscaInterna;
  const atualizarBusca = onBuscaExternaChange ?? setBuscaInterna;

  const projetosFiltrados = useMemo(() => {
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
  }, [projetos, busca]);

  async function abrirDetalheProjeto(projetoId: number) {
    try {
      setErroDetalhe(null);
      setCarregandoProjetoId(projetoId);

      const detalhe = await apiFinanceiro.buscarProjetoDetalhe(projetoId);
      setProjetoSelecionado(detalhe);
    } catch (err) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Erro ao carregar detalhe do projeto";
      setErroDetalhe(mensagem);
    } finally {
      setCarregandoProjetoId(null);
    }
  }

  return (
    <>
      <section className="rounded-[15px] bg-[#232329] p-5">
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="h-4 w-4 rounded-md bg-gradient-to-br from-pink-500 to-cyan-400" />
              <h2 className="text-[20px] font-semibold uppercase tracking-wide text-white">
                Projetos
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setBuscaAberta((prev) => !prev)}
              className="rounded-md p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              aria-label="Buscar projetos"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-7 w-7 transition-transform duration-300 ${
                  buscaAberta ? "rotate-90 text-white" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>
          </div>

          <div
            className={`grid transition-all duration-300 ease-out ${
              buscaAberta
                ? "mt-4 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`transition-all duration-300 ease-out ${
                  buscaAberta
                    ? "translate-y-0 scale-100"
                    : "-translate-y-2 scale-[0.98]"
                }`}
              >
                <Search
                  value={busca}
                  onChange={atualizarBusca}
                  placeholder="Buscar por nome, tipo ou ID"
                />
              </div>
            </div>
          </div>

          {erroDetalhe && (
            <p className="mt-3 text-sm text-red-300">{erroDetalhe}</p>
          )}
        </div>

        <div className="h-[500px] overflow-y-auto pr-1">
          <div className="space-y-4">
            {projetosFiltrados.length === 0 ? (
              <SemConteudo
                title="Nenhum projeto encontrado"
                description="Tente outro filtro para localizar projetos."
              />
            ) : (
              projetosFiltrados.map((projeto) => (
                <button
                  key={projeto.projetoId}
                  type="button"
                  className="block w-full rounded-[15px] bg-[#54545a] p-6 text-left transition hover:bg-[#5c5c63]"
                  onClick={() => void abrirDetalheProjeto(projeto.projetoId)}
                  disabled={carregandoProjetoId === projeto.projetoId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[22px] font-semibold text-white">
                        {projeto.nomeProjeto}
                      </p>
                      <p className="mt-2 text-[15px] uppercase text-white/70">
                        {projeto.tipoProjeto}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[16px] text-white/75">
                        {carregandoProjetoId === projeto.projetoId
                          ? "..."
                          : formatarHoras(projeto.totalHoras)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="text-[15px] text-white/70">Custo total</p>
                    <p className="mt-2 text-[22px] font-semibold text-white">
                      {formatarMoeda(projeto.custoTotal)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      <ModalDetalheProjeto
        aberto={!!projetoSelecionado}
        onFechar={() => setProjetoSelecionado(null)}
        projeto={projetoSelecionado}
      />
    </>
  );
}

export default memo(ListaProjetos);