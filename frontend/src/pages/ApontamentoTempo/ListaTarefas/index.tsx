import type { Tarefa } from "../../../types/tarefa";
import type { Item } from "../../../types/item";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { TipoTarefa } from "../../../types/tipoTarefa";
import { getNomeTipoTarefa } from "..";

interface ApontamentoListaTarefasProps {
  tarefas?: Tarefa[];
  itens?: Item[];
  loading: boolean;
  tiposTarefa?: TipoTarefa[];
  setTarefa: (tarefa: Tarefa) => void;
}

function ApontamentoListaTarefas({
  tarefas,
  itens,
  loading,
  tiposTarefa,
  setTarefa,
}: ApontamentoListaTarefasProps) {
  const { user } = useAuth();
  const [aberto, setAberto] = useState<number | null>(null);
  const [tarefasSemItem, setTarefasSemItem] = useState<Tarefa[]>([]);
  const [busca, setBusca] = useState("");

  const toggleItem = (id: number | string) => {
    const numId = Number(id);
    setAberto((prev) => (prev === numId ? null : numId));
  };

  useEffect(() => {
    setTarefasSemItem(tarefas?.filter((tarefa) => tarefa.itemId == null) || []);
  }, [tarefas]);

  const normalizar = (texto?: string | null) => {
    return (texto ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const tarefasFiltradas = useMemo(() => {
    const termo = normalizar(busca);

    if (!termo) return tarefas ?? [];

    return (tarefas ?? []).filter((tarefa) => {
      const tipo = getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa) ?? "";
      return (
        normalizar(tarefa.titulo).includes(termo) ||
        normalizar(tarefa.descricao).includes(termo) ||
        normalizar(tipo).includes(termo)
      );
    });
  }, [tarefas, busca, tiposTarefa]);

  const itensComTarefas = useMemo(() => {
    return (itens ?? [])
      .map((item) => ({
        item,
        tarefas: tarefasFiltradas.filter(
          (tarefa) => Number(tarefa.itemId) === Number(item.idItem),
        ),
      }))
      .filter((grupo) => grupo.tarefas.length > 0);
  }, [itens, tarefasFiltradas]);

  const tarefasSemItemFiltradas = useMemo(() => {
    return tarefasSemItem.filter((tarefa) =>
      tarefasFiltradas.some((t) => Number(t.id) === Number(tarefa.id)),
    );
  }, [tarefasSemItem, tarefasFiltradas]);

  const getSiglaTipo = (tipo?: string | null) => {
    if (!tipo) return "TAR";
    return tipo.slice(0, 3).toUpperCase();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6627cc] to-[#4a1898] text-sm font-bold text-white shadow-lg shadow-purple-950/30">
            {user?.nome?.slice(0, 1).toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/80">
              Profissional
            </p>
            <h2 className="truncate text-lg font-bold text-white">
              {user?.nome ?? "Usuário"}
            </h2>
          </div>
        </div>

        <div className="relative mt-5">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-300/70"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            placeholder="Pesquisar tarefa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-[#1a1a20] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#6627cc]/60 focus:ring-2 focus:ring-[#6627cc]/20"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span className="text-slate-400">Tarefas exibidas</span>
          <span className="font-bold text-white">{tarefasFiltradas.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-2xl border border-white/10 bg-[#2c2c31]"
              />
            ))}
          </div>
        ) : tarefasFiltradas.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1f1f24] p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6627cc]/15 text-violet-300">
              <svg
                width="28"
                height="28"
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

            <h3 className="font-bold text-white">Nenhuma tarefa encontrada</h3>
            <p className="mt-2 text-sm text-slate-400">
              Ajuste a busca ou verifique se você está vinculado às tarefas do
              projeto.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {itensComTarefas.map(({ item, tarefas: tarefasDoItem }) => (
              <li
                key={item.idItem}
                className="rounded-2xl border border-white/10 bg-[#1f1f24] p-3"
              >
                <button
                  onClick={() => toggleItem(item.idItem)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-white">
                      {item.nome}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {tarefasDoItem.length} tarefa(s)
                    </p>
                  </div>

                  <svg
                    className={`shrink-0 text-slate-400 transition ${
                      aberto === Number(item.idItem) ? "rotate-180" : ""
                    }`}
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {aberto === Number(item.idItem) && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {tarefasDoItem.map((tarefa) => {
                      const nomeTipo = getNomeTipoTarefa(
                        tarefa.tipoTarefaId,
                        tiposTarefa,
                      );

                      return (
                        <li key={tarefa.id}>
                          <button
                            className="w-full rounded-xl border border-white/10 bg-[#26262b] px-3 py-3 text-left transition hover:border-[#6627cc]/40 hover:bg-[#2b2b31]"
                            onClick={() => setTarefa(tarefa)}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className="mt-0.5 shrink-0 rounded-lg border border-[#6627cc]/30 bg-[#6627cc]/10 px-2 py-1 text-[10px] font-bold text-violet-200"
                                title={nomeTipo || ""}
                              >
                                {getSiglaTipo(nomeTipo)}
                              </span>

                              <div className="min-w-0">
                                <h4 className="line-clamp-2 text-sm font-semibold text-white">
                                  {tarefa.titulo}
                                </h4>
                                {tarefa.descricao && (
                                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                    {tarefa.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}

            {tarefasSemItemFiltradas.length > 0 && (
              <li className="rounded-2xl border border-white/10 bg-[#1f1f24] p-3">
                <div className="px-2 py-2">
                  <h3 className="font-bold text-white">Sem item</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {tarefasSemItemFiltradas.length} tarefa(s)
                  </p>
                </div>

                <ul className="mt-2 flex flex-col gap-2">
                  {tarefasSemItemFiltradas.map((tarefa) => {
                    const nomeTipo = getNomeTipoTarefa(
                      tarefa.tipoTarefaId,
                      tiposTarefa,
                    );

                    return (
                      <li key={tarefa.id}>
                        <button
                          className="w-full rounded-xl border border-white/10 bg-[#26262b] px-3 py-3 text-left transition hover:border-[#6627cc]/40 hover:bg-[#2b2b31]"
                          onClick={() => setTarefa(tarefa)}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-0.5 shrink-0 rounded-lg border border-[#6627cc]/30 bg-[#6627cc]/10 px-2 py-1 text-[10px] font-bold text-violet-200"
                              title={nomeTipo || ""}
                            >
                              {getSiglaTipo(nomeTipo)}
                            </span>

                            <div className="min-w-0">
                              <h4 className="line-clamp-2 text-sm font-semibold text-white">
                                {tarefa.titulo}
                              </h4>
                              {tarefa.descricao && (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                  {tarefa.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ApontamentoListaTarefas;