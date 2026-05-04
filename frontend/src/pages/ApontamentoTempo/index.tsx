import { useEffect, useMemo, useState } from "react";
import ApontamentoListaTarefas from "./ListaTarefas";
import type { Tarefa } from "../../types/tarefa";
import type { Item } from "../../types/item";
import TarefasInfo from "./TarefasInfo";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import apiTarefas from "../../services/apiTarefas";
import { useAuth } from "../../contexts/AuthContext";
import type { TipoTarefa } from "../../types/tipoTarefa";
import { toastError } from "../../utils/toastUtils";

export function getNomeTipoTarefa(
  id: number | null | undefined,
  tiposTarefa: TipoTarefa[] | null | undefined,
) {
  if (!tiposTarefa || !id) return null;

  const tipoTarefa = tiposTarefa.find((tipo) => Number(tipo.id) === Number(id));
  return tipoTarefa ? tipoTarefa.nome : null;
}

function ApontamentoTempo() {
  const { projetoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<
    Tarefa | undefined
  >();
  const [loading, setLoading] = useState<boolean>(true);
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);

  async function buscarTiposTarefa() {
    try {
      const response = await apiTarefas.get("/tipoTarefa");
      setTiposTarefa(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toastError("Erro ao buscar tipos de tarefa");
    }
  }

  async function buscarTarefas() {
    if (!projetoId || !user?.id) return;

    try {
      const response = await apiTarefas.get<Tarefa[]>(
        `/tarefas/projeto/${projetoId}/responsavel/${user.id}`,
      );

      const tarefasData = Array.isArray(response.data) ? response.data : [];

      setTarefas(tarefasData);

      if (tarefaSelecionada) {
        const tarefaAtualizada = tarefasData.find(
          (tarefa) => Number(tarefa.id) === Number(tarefaSelecionada.id),
        );

        setTarefaSelecionada(tarefaAtualizada);
      }
    } catch (error: any) {
      toast.error("Erro ao buscar tarefas", { autoClose: 2000 });
      console.error("Erro ao buscar tarefas", error);
    }
  }

  async function buscarItens() {
    if (!projetoId || !user?.id) return;

    try {
      const response = await apiTarefas.get<Item[]>(
        `/itens/projeto/${projetoId}/responsavel/${user.id}`,
      );
      setItens(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      toast.error("Erro ao buscar itens", { autoClose: 2000 });
      console.error("Erro ao buscar itens", error);
    }
  }

  async function carregarDados() {
    if (!projetoId || !user?.id) return;

    setLoading(true);

    try {
      await Promise.all([buscarTiposTarefa(), buscarTarefas(), buscarItens()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [projetoId, user?.id]);

  const metricas = useMemo(() => {
    const totalTarefas = tarefas.length;
    const tarefasSemItem = tarefas.filter((tarefa) => tarefa.itemId == null).length;
    const tempoPrevisto = tarefas.reduce(
      (total, tarefa) => total + Number(tarefa.tempoMaximoMinutos ?? 0),
      0,
    );

    return {
      totalTarefas,
      totalItens: itens.length,
      tarefasSemItem,
      tempoPrevisto,
    };
  }, [tarefas, itens]);

  const formatarTempo = (minutos: number) => {
    if (!minutos || minutos <= 0) return "0h";

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;

    return `${horas}h ${resto}min`;
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-24 h-40 w-40 rounded-full bg-purple-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <button
                  onClick={() => navigate(`/projetos/${projetoId}`)}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/15"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Voltar ao projeto
                </button>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Apontamento de horas
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Registrar tempo
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                  Selecione uma tarefa, acompanhe o tempo já registrado e
                  adicione novos apontamentos ao projeto.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[620px]">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Tarefas</p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricas.totalTarefas}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Itens</p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricas.totalItens}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Sem item</p>
                  <p className="mt-1 text-2xl font-bold">
                    {metricas.tarefasSemItem}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Previsto</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatarTempo(metricas.tempoPrevisto)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid min-h-[620px] gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-[22px] border border-white/10 bg-[#232329] shadow-lg shadow-black/10">
            <ApontamentoListaTarefas
              tarefas={tarefas}
              itens={itens}
              tiposTarefa={tiposTarefa}
              loading={loading}
              setTarefa={setTarefaSelecionada}
            />
          </aside>

          <main className="min-w-0 rounded-[22px] border border-white/10 bg-[#232329] shadow-lg shadow-black/10">
            {tarefaSelecionada ? (
              <TarefasInfo
                reloadTarefas={buscarTarefas}
                tarefa={tarefaSelecionada}
                item={itens.find(
                  (item) =>
                    Number(item.idItem) === Number(tarefaSelecionada.itemId),
                )}
                tiposTarefa={tiposTarefa}
                setTarefa={setTarefaSelecionada}
              />
            ) : (
              <div className="flex min-h-[620px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6627cc]/15 text-[#a78bfa]">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-white">
                  Selecione uma tarefa
                </h2>

                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Escolha uma tarefa na lista lateral para visualizar os
                  registros de horas e adicionar um novo apontamento.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ApontamentoTempo;