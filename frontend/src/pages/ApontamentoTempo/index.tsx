// src/pages/ApontamentoTempo/index.tsx
import { useEffect, useState } from "react";
import ApontamentoListaTarefas from "./ListaTarefas";
import type { Tarefa } from "../../types/tarefa";
import type { Item } from "../../types/item";
import TarefasInfo from "./TarefasInfo";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import apiTarefas from "../../services/apiTarefas";
import { useAuth } from "../../contexts/AuthContext";
import type { TipoTarefa } from "../../types/tipoTarefa";

export function getNomeTipoTarefa(id: number | null | undefined, tiposTarefa: TipoTarefa[] | null | undefined) {
  if (!tiposTarefa || !id) return null;
  const tipoTarefa = tiposTarefa.find((tipo) => tipo.id === id);
  return tipoTarefa ? tipoTarefa.nome : null;
}

function ApontamentoTempo() {
  const { projetoId } = useParams();
  const { user } = useAuth();

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);

  async function buscarTiposTarefa() {
    try {
      const response = await apiTarefas.get("/tipoTarefa");
      setTiposTarefa(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar tipos de tarefa");
    }
  }

  async function buscarTarefas() {
    if (!projetoId || !user?.id) {
      console.warn("projetoId ou user.id não disponível");
      return;
    }
    try {
      const response = await apiTarefas.get<Tarefa[]>(`/tarefas/projeto/${projetoId}/responsavel/${user.id}`);
      setTarefas(response.data);
    } catch (error: any) {
      toast.error("Erro ao buscar tarefas", { autoClose: 2000 });
      console.error("Erro ao buscar tarefas", error);
    }
  }

  async function buscarItens() {
    if (!projetoId || !user?.id) return;
    setLoading(true);
    try {
      const response = await apiTarefas.get<Item[]>(`/itens/projeto/${projetoId}/responsavel/${user.id}`);
      setItens(response.data);
    } catch (error: any) {
      toast.error("Erro ao buscar itens", { autoClose: 2000 });
      console.error("Erro ao buscar itens", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projetoId && user?.id) {
      buscarTiposTarefa();
      buscarTarefas();
      buscarItens();
    }
  }, [projetoId, user?.id]);

  return (
    <div className="w-full h-full flex flex-row bg-[#1b1b1f] text-gray-50 p-8">
      <div className="grow max-w-4/12 xl:max-w-3/12 min-w-max border-r-2 border-r-mist-700">
        <ApontamentoListaTarefas
          tarefas={tarefas}
          itens={itens}
          tiposTarefa={tiposTarefa}
          loading={loading}
          setTarefa={setTarefaSelecionada}
        />
      </div>
      <div className="grow">
        {tarefaSelecionada && (
          <TarefasInfo
            reloadTarefas={buscarTarefas}
            tarefa={tarefaSelecionada}
            item={itens.find((item) => item.idItem === tarefaSelecionada.itemId)}
            tiposTarefa={tiposTarefa}
            setTarefa={setTarefaSelecionada}
          />
        )}
      </div>
    </div>
  );
}

export default ApontamentoTempo;