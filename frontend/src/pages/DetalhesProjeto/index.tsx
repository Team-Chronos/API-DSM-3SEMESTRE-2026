import { useEffect, useState } from "react";
import Search from "../../components/ui/Search";
import { useProjetoContext } from "../../contexts/ProjetoContext";
import type { Tarefa } from "../../types/tarefa";
import type { Profissional } from "../../types/profissionalService";
import { carregarItensPorProjeto, carregarTarefasPorProjeto } from "../../service/servicoTarefas";
import { carregarProfissionaisPorProjeto } from "../../service/servicoProfissionais";
import { normalizarTexto } from "../../utils";
import InformacoesProjeto from "./InformacoesProjeto";
import type { Item } from "../../types/item";
import type { TipoTarefa } from "../../types/tipoTarefa";
import ApiTarefas from "../../service/servicoApi";
import { useNavigate } from "react-router-dom";

function DetalhesProjeto() {
  const navigate = useNavigate();
  const { projeto, isLoading: projetoLoading } = useProjetoContext();

  const [pesquisaTarefa, setPesquisaTarefa] = useState<string>("");
  const [filtroTipo, setFiltroTipo] = useState<number | null>(null);
  const [filtroItem, setFiltroItem] = useState<number | null>(null);
  const [filtroProfissional, setFiltroProfissional] = useState<number | null>(null);
  const [pesquisaProfissional, setPesquisaProfissional] = useState<string>("");

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tipos, setTipos] = useState<TipoTarefa[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [loadingItens, setLoadingItens] = useState<boolean>(false);

  useEffect(() => {
    async function loadTipos() {
      try {
        const res = await ApiTarefas.get("/tarefas/tipoTarefa");
        setTipos(res.data || []);
      } catch (error) {
        console.error("Erro ao carregar tipos de tarefa:", error);
        setTipos([]);
      }
    }
    loadTipos();
  }, []);

  useEffect(() => {
    const projetoId = projeto?.id;

    if (projetoId === undefined || projetoId === null) return;

    async function load(id: number) {
      setLoadingItens(true);

      try {
        const [tarefasData, profissionaisData, itensData] = await Promise.all([
          carregarTarefasPorProjeto(id),
          carregarProfissionaisPorProjeto(id),
          carregarItensPorProjeto(id),
        ]);

        setTarefas(tarefasData);
        setProfissionais(profissionaisData);
        setItens(itensData);
      } catch (error) {
        console.error("Erro ao carregar dados do projeto:", error);
      } finally {
        setLoadingItens(false);
      }
    }

    load(projetoId);
  }, [projeto?.id]);

  if (projetoLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1f1f1f]">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1f1f1f]">
        <div className="text-red-500">Projeto não encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-8 p-4 text-white/95">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <div className="rounded-xl bg-white/7 p-4 flex flex-col gap-4">
          <h3 className="text-center text-lg">Projeto</h3>
          <InformacoesProjeto />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => navigate("./tarefas")}
              className="bg-black/21 rounded-lg py-2 px-4 cursor-pointer"
            >
              Gerenciar Tarefas
            </button>
            <button
              onClick={() => navigate("./apontamento")}
              className="bg-black/21 rounded-lg py-2 px-4 cursor-pointer"
            >
              Apontamento
            </button>
          </div>
        </div>
        <hr className="my-2 opacity-30" />
        <div className="mb-1 flex flex-col gap-4 rounded-xl bg-white/7 p-4 flex-wrap">
          <div className="h-9 min-w-1/5">
            <Search
              placeholder="Pesquisar tarefa..."
              value={pesquisaTarefa}
              onChange={setPesquisaTarefa}
              className="h-full"
            />
          </div>
          <div className="flex gap-2 *:flex-1 *:rounded-lg *:bg-black/21 *:p-2 *:cursor-pointer flex-wrap">
            <select onChange={(e) => setFiltroTipo(Number(e.target.value) || null)}>
              <option value="">Tipo de Tarefa</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>

            <select onChange={(e) => setFiltroItem(Number(e.target.value) || null)}>
              <option value="">{loadingItens ? "Carregando..." : "Item"}</option>
              {itens.map((item) => (
                <option key={item.idItem} value={item.idItem}>
                  {item.nome}
                </option>
              ))}
            </select>

            <select onChange={(e) => setFiltroProfissional(Number(e.target.value) || null)}>
              <option value="">Profissional</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-4 *:rounded-xl *:bg-white/7 *:px-4 *:py-8">
          {tarefas.length > 0 ? (
            tarefas
              .filter((tarefa) => {
                const matchTexto = normalizarTexto(tarefa.titulo).includes(normalizarTexto(pesquisaTarefa));
                const matchTipo = filtroTipo === null || tarefa.tipoTarefaId === filtroTipo;
                const matchItem = filtroItem === null || tarefa.itemId === filtroItem;
                const matchProfissional = filtroProfissional === null || tarefa.responsavelId === filtroProfissional;
                return matchTexto && matchTipo && matchItem && matchProfissional;
              })
              .map((tarefa) => <div key={tarefa.id}>{tarefa.titulo}</div>)
          ) : (
            <div>Sem tarefas cadastradas</div>
          )}
        </div>
      </div>

      <div className="flex w-3/12 max-w-sm resize-x flex-col gap-4 overflow-y-auto rounded-xl bg-white/7 p-4 text-sm">
        <h3 className="text-center text-lg">Profissionais</h3>
        <hr className="opacity-30" />
        <Search
          placeholder="Pesquisar profissional..."
          value={pesquisaProfissional}
          onChange={setPesquisaProfissional}
        />
        <div className="flex flex-col gap-2">
          {profissionais.length > 0 ? (
            profissionais
              .filter((profissional) => {
                if (pesquisaProfissional === "") return true;
                return normalizarTexto(profissional.nome).includes(normalizarTexto(pesquisaProfissional));
              })
              .map((profissional) => (
                <div key={profissional.id} className="rounded-xl bg-black/21 px-3 py-3">
                  {profissional.nome}
                </div>
              ))
          ) : (
            <div className="text-center">Sem profissionais associados</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesProjeto;