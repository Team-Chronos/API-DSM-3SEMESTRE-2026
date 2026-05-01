import type { Tarefa } from "../../../types/tarefa";
import type { Item } from "../../../types/item";
import { useEffect, useState } from "react";
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

  const toggleItem = (id: number | string) => {
    const numId = Number(id);
    setAberto((prev) => (prev === numId ? null : numId));
  };

  useEffect(() => {
    setTarefasSemItem(tarefas?.filter((tarefa) => tarefa.itemId == null) || []);
  }, [tarefas]);

  return (
    <div className="flex flex-col p-4 gap-y-6">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shrink-0">
          {user?.nome.slice(0, 1).toUpperCase() || "💩"}
        </div>
        <div>
          <h2>{user?.nome}</h2>
        </div>
      </div>
      <ul className="flex flex-col gap-4 max-h-96 overflow-y-auto p-0.5">
        {loading && (
          <li className="flex flex-col gap-y-4">
            <div className="h-7 animate-pulse rounded-md bg-mist-950"></div>
            <div className="h-7 animate-pulse rounded-md bg-mist-950"></div>
            <div className="h-7 animate-pulse rounded-md bg-mist-950"></div>
          </li>
        )}
        {itens?.map((item) => (
          <li key={item.idItem} className="flex flex-col gap-y-2">
            <button onClick={() => toggleItem(item.idItem)}>
              <h3 className="font-medium text-left hover:text-white cursor-pointer">{item.nome}</h3>
            </button>
            {aberto === Number(item.idItem) && (
              <ul className="flex flex-col gap-y-1 pl-3">
                {tarefas
                  ?.filter((tarefa) => tarefa.itemId === item.idItem)
                  .map((tarefa) => (
                    <li key={tarefa.id}>
                      <button className="cursor-pointer hover:text-white" onClick={() => setTarefa(tarefa)}>
                        <h4 className="text-sm">
                          <span
                            className="font-bold text-indigo-500"
                            title={getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa) || ""}
                          >
                            {`[${getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa)?.slice(0, 3).toUpperCase()}]`}
                          </span>{" "}
                          {tarefa.titulo}
                        </h4>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
        {tarefasSemItem.length > 0 && (
          <li className="flex flex-col gap-y-2">
            <h3 className="font-medium text-left">Sem item</h3>
            <ul className="flex flex-col gap-y-1 pl-3">
              {tarefasSemItem.map((tarefa) => (
                <li key={tarefa.id}>
                  <button className="cursor-pointer hover:text-white" onClick={() => setTarefa(tarefa)}>
                    <h4 className="text-sm">
                      <span
                        className="font-bold text-indigo-500"
                        title={getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa) || ""}
                      >
                        {`[${getNomeTipoTarefa(tarefa.tipoTarefaId, tiposTarefa)?.slice(0, 3).toUpperCase()}]`}
                      </span>{" "}
                      {tarefa.titulo}
                    </h4>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}

export default ApontamentoListaTarefas;