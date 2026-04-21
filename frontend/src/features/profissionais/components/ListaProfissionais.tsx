import { useMemo, useState } from "react";
import SemConteudo from "../../../components/ui/SemConteudo";
import Search from "../../../components/ui/Search";
import ModalDetalheProfissional from "../modals/ProfissionalDetalheModal";
import type { ProfissionalGanhos } from "../../../types/financeiro";

interface ListaProfissionaisProps {
  profissionais: ProfissionalGanhos[];
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

export default function ListaProfissionais({
  profissionais,
}: ListaProfissionaisProps) {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState<ProfissionalGanhos | null>(null);

  const profissionaisFiltrados = useMemo(() => {
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
  }, [profissionais, busca]);

  return (
    <>
      <section className="rounded-[15px] bg-[#232329] p-5">
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="h-4 w-4 rounded-md bg-gradient-to-br from-pink-500 to-cyan-400" />
              <h2 className="text-[20px] font-semibold text-white">
                DESENVOLVEDORES
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setBuscaAberta((prev) => !prev)}
              className="rounded-md p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
              aria-label="Buscar desenvolvedores"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-7 w-7 transition-transform duration-300 ${buscaAberta ? "rotate-90 text-white" : ""
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
            className={`grid transition-all duration-300 ease-out ${buscaAberta
                ? "mt-4 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <div
                className={`transition-all duration-300 ease-out ${buscaAberta
                    ? "translate-y-0 scale-100"
                    : "-translate-y-2 scale-[0.98]"
                  }`}
              >
                <Search
                  value={busca}
                  onChange={setBusca}
                  placeholder="Buscar por nome ou ID"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto pr-1">
          <div className="space-y-4">
            {profissionaisFiltrados.length === 0 ? (
              <SemConteudo
                title="Nenhum profissional encontrado"
                description="Tente outro filtro para localizar profissionais."
              />
            ) : (
              profissionaisFiltrados.map((profissional) => {
                const horasTotais = profissional.projetos.reduce(
                  (acumulador, projeto) =>
                    acumulador + projeto.horasTrabalhadas,
                  0
                );

                return (
                  <button
                    key={profissional.usuarioId}
                    type="button"
                    className="block w-full rounded-[15px] bg-[#54545a] p-6 text-left transition hover:bg-[#5c5c63]"
                    onClick={() => setProfissionalSelecionado(profissional)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-[22px] font-semibold text-white">
                          {profissional.usuarioNome}
                        </p>
                        <p className="mt-2 text-[15px] text-white/70">
                          Usuário #{profissional.usuarioId}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-5xl font-semibold leading-none text-white">
                          {profissional.projetos.length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 text-[15px]">
                      <div>
                        <p className="text-white/60">Horas</p>
                        <p className="mt-2 text-[18px] font-semibold text-white">
                          {formatarHoras(horasTotais)}
                        </p>
                      </div>

                      <div>
                        <p className="text-white/60">Total</p>
                        <p className="mt-2 text-[18px] font-semibold text-white">
                          {formatarMoeda(profissional.totalComBonus)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      <ModalDetalheProfissional
        aberto={!!profissionalSelecionado}
        onFechar={() => setProfissionalSelecionado(null)}
        profissional={profissionalSelecionado}
      />
    </>
  );
}