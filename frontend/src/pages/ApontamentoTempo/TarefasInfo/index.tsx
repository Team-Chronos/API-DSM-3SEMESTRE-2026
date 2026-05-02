import { useEffect, useMemo, useState } from "react";
import type { Tarefa } from "../../../types/tarefa";
import type { RegistroHorasTarefa } from "../../../types/registroTempo";
import type { Item } from "../../../types/item";
import apiApontamento from "../../../services/apiApontamento";
import type { TipoTarefa } from "../../../types/tipoTarefa";
import { toastError } from "../../../utils/toastUtils";
import TabelaRegistroHoras from "./TabelaRegistroHoras";
import { getNomeTipoTarefa } from "..";
import ModalCadastro from "./ModalCadastro";

interface TarefasInfoProps {
  tarefa: Tarefa;
  item?: Item;
  tiposTarefa?: TipoTarefa[];
  setTarefa: (tarefa: Tarefa | undefined) => void;
  reloadTarefas: () => Promise<void>;
}

function TarefasInfo({
  tarefa,
  item,
  tiposTarefa,
  setTarefa,
  reloadTarefas,
}: TarefasInfoProps) {
  const [registroHorasTarefa, setRegistroHorasTarefa] =
    useState<RegistroHorasTarefa>();
  const [porcentagemTempo, setPorcentagemTempo] = useState<number>(0);
  const [modalCadastro, setModalCadastro] = useState<boolean>(false);
  const [loadingRegistros, setLoadingRegistros] = useState<boolean>(false);

  async function buscarRegistroHorasTarefa() {
    setLoadingRegistros(true);

    try {
      const response = await apiApontamento.get<RegistroHorasTarefa>(
        "/registros/tarefa/" + tarefa.id,
      );
      setRegistroHorasTarefa(response.data);
    } catch (error: any) {
      toastError("Erro ao buscar registro de horas da tarefa");
    } finally {
      setLoadingRegistros(false);
    }
  }

  useEffect(() => {
    const tempoRegistrado = Number(registroHorasTarefa?.tempoMinutos ?? 0);
    const tempoMaximo = Number(tarefa.tempoMaximoMinutos ?? 0);

    if (!tempoMaximo || tempoMaximo <= 0) {
      setPorcentagemTempo(0);
      return;
    }

    setPorcentagemTempo(Math.min(tempoRegistrado / tempoMaximo, 1));
  }, [registroHorasTarefa, tarefa]);

  const handleFechar = () => {
    setTarefa(undefined);
  };

  useEffect(() => {
    buscarRegistroHorasTarefa();
  }, [tarefa.id]);

  const formatarTempo = (minutos?: number | null) => {
    const total = Number(minutos ?? 0);

    if (!total || total <= 0) return "0h";

    const horas = Math.floor(total / 60);
    const resto = total % 60;

    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;

    return `${horas}h ${resto}min`;
  };

  const tempoRegistrado = Number(registroHorasTarefa?.tempoMinutos ?? 0);
  const tempoMaximo = Number(tarefa.tempoMaximoMinutos ?? 0);
  const tempoRestante = Math.max(tempoMaximo - tempoRegistrado, 0);
  const tempoEsgotado = tempoMaximo > 0 && tempoRegistrado >= tempoMaximo;

  const metricas = useMemo(() => {
    return [
      {
        label: "Registrado",
        value: formatarTempo(tempoRegistrado),
      },
      {
        label: "Restante",
        value: formatarTempo(tempoRestante),
      },
      {
        label: "Limite",
        value: formatarTempo(tempoMaximo),
      },
    ];
  }, [tempoRegistrado, tempoRestante, tempoMaximo]);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#6627cc]/30 bg-[#6627cc]/10 px-3 py-1 text-xs font-semibold text-violet-200">
                  {getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa) ||
                    "Tipo não informado"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {item?.nome || "Sem item"}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white">
                {tarefa.titulo}
              </h2>

              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                {tarefa.descricao || "Essa tarefa não possui descrição."}
              </p>
            </div>

            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              onClick={handleFechar}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 rounded-2xl border border-white/10 bg-[#1f1f24] p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Histórico
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Registros de tempo
                </h3>
              </div>

              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#6627cc] px-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#7634dd] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setModalCadastro(true)}
                disabled={tempoEsgotado}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Registrar tempo
              </button>
            </div>

            {tempoEsgotado && (
              <div className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                Tempo máximo atingido. Fale com o gerente do projeto para
                ajustar o limite da tarefa.
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-white/10">
              {loadingRegistros ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 animate-pulse rounded-xl bg-[#2c2c31]"
                    />
                  ))}
                </div>
              ) : (
                <TabelaRegistroHoras registroHorasTarefa={registroHorasTarefa} />
              )}
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-5">
            <section className="rounded-2xl border border-white/10 bg-[#1f1f24] p-5">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Controle
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Tempo da tarefa
                </h3>
              </div>

              <div className="mb-4 h-3 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6627cc] transition-all duration-500"
                  style={{ width: `${porcentagemTempo * 100}%` }}
                />
              </div>

              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {Math.round(porcentagemTempo * 100)}% utilizado
                </span>
                <span className="text-sm font-bold text-white">
                  {tempoRegistrado} / {tempoMaximo} min
                </span>
              </div>

              <div className="grid gap-3">
                {metricas.map((metrica) => (
                  <div
                    key={metrica.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#26262b] px-4 py-3"
                  >
                    <span className="text-sm text-slate-400">
                      {metrica.label}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {metrica.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#1f1f24] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Informações
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#26262b] p-4">
                  <p className="text-xs text-slate-500">Item</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {item?.nome || "Essa tarefa não possui um item"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#26262b] p-4">
                  <p className="text-xs text-slate-500">Tipo</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa) ||
                      "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#26262b] p-4">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {tarefa.status || "Não informado"}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ModalCadastro
        tempoMaximoMinutos={tarefa.tempoMaximoMinutos}
        tempoRegistradoMinutos={registroHorasTarefa?.tempoMinutos || 0}
        tarefaId={tarefa.id}
        open={modalCadastro}
        reloadTarefas={reloadTarefas}
        reloadRegistros={buscarRegistroHorasTarefa}
        onClose={() => setModalCadastro(false)}
      />
    </>
  );
}

export default TarefasInfo;