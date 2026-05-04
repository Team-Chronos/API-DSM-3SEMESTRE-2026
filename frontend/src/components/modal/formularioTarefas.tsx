import { useState, useEffect } from "react";
import { ApiTarefas } from "../../service/servicoApi";
import projetoService from "../../types/projetoService";
import profissionalService from "../../types/profissionalService";
import { carregarProfissionaisPorProjeto } from "../../service/servicoProfissionais";
import type { Projeto1 } from "../../types/projetoService";
import { toastError, toastSuccess } from "../../utils/toastUtils";

interface TarefaParaEditar {
  id: number;
  titulo: string;
  descricao: string;
  responsavelId?: number | null;
  tempoMaximoMinutos: number;
  status: string;
  tipoTarefaId: number;
  projetoId: number;
  itemId?: number | null;
}

interface Props {
  isOpen: boolean;
  onFechar: () => void;
  onSucesso?: () => void;
  projetoIdPadrao?: number;
  tarefaParaEditar?: TarefaParaEditar | null;
}

interface TipoTarefa {
  id: number;
  nome: string;
}

export default function ModalCadastroTarefa({
  isOpen,
  onFechar,
  onSucesso,
  projetoIdPadrao,
  tarefaParaEditar,
}: Props) {
  const modoEdicao = !!tarefaParaEditar;

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [tipoId, setTipoId] = useState<string>("");
  const [projetoId, setProjetoId] = useState<string>(
    projetoIdPadrao ? String(projetoIdPadrao) : ""
  );
  const [carregando, setCarregando] = useState(false);
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);
  const [projetos, setProjetos] = useState<Projeto1[]>([]);
  const [responsaveisFiltrados, setResponsaveisFiltrados] = useState<any[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto1 | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (projetoIdPadrao) setProjetoId(String(projetoIdPadrao));
  }, [projetoIdPadrao]);

  useEffect(() => {
    if (isOpen) carregarDadosIniciais();
  }, [isOpen]);

  const carregarDadosIniciais = async () => {
    setCarregandoDados(true);
    try {
      const tiposRes = await ApiTarefas.get("/tipoTarefa");
      setTiposTarefa(tiposRes.data || []);

      const projetosLista = await projetoService.listarTodos();
      setProjetos(projetosLista || []);

      const pidReferencia = tarefaParaEditar?.projetoId ?? projetoIdPadrao;

      if (pidReferencia) {
        const projeto = await projetoService.buscarPorId(pidReferencia);
        setProjetoSelecionado(projeto || null);

        const vinculados = await carregarProfissionaisPorProjeto(pidReferencia);
        setResponsaveisFiltrados(vinculados);

        if (modoEdicao && tarefaParaEditar) {
          setTitulo(tarefaParaEditar.titulo);
          setDescricao(tarefaParaEditar.descricao);
          setPrazo(String(tarefaParaEditar.tempoMaximoMinutos));
          setStatus(tarefaParaEditar.status);
          setTipoId(String(tarefaParaEditar.tipoTarefaId));
          setProjetoId(String(tarefaParaEditar.projetoId));
          setResponsavelId(tarefaParaEditar.responsavelId ? String(tarefaParaEditar.responsavelId) : "");
        } else if (projeto?.responsavelId) {
          const existe = vinculados.some(
            (p) => Number(p.id) === Number(projeto.responsavelId)
          );
          setResponsavelId(existe ? String(projeto.responsavelId) : "");
        }
      } else {
        const todos = await profissionalService.listarTodos();
        setResponsaveisFiltrados(todos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toastError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleProjetoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setProjetoId(id);
    setResponsavelId("");

    if (id) {
      try {
        const projeto = await projetoService.buscarPorId(Number(id));
        setProjetoSelecionado(projeto || null);

        const vinculados = await carregarProfissionaisPorProjeto(Number(id));
        setResponsaveisFiltrados(vinculados);

        if (projeto?.responsavelId) {
          const existe = vinculados.some(
            (p) => Number(p.id) === Number(projeto.responsavelId)
          );
          if (existe) setResponsavelId(String(projeto.responsavelId));
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do projeto:", err);
        toastError("Erro ao carregar projeto.");
        setProjetoSelecionado(null);
        const todos = await profissionalService.listarTodos();
        setResponsaveisFiltrados(todos || []);
      }
    } else {
      setProjetoSelecionado(null);
      const todos = await profissionalService.listarTodos();
      setResponsaveisFiltrados(todos || []);
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setResponsavelId("");
    setPrazo("");
    setStatus("PENDENTE");
    setTipoId("");
    if (!projetoIdPadrao) setProjetoId("");
    setProjetoSelecionado(null);
  };

  const handleClose = () => {
    resetForm();
    onFechar();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregando(true);

    if (!titulo.trim()) { toastError("Título é obrigatório"); setCarregando(false); return; }
    if (!descricao.trim()) { toastError("Descrição é obrigatória"); setCarregando(false); return; }
    if (!prazo) { toastError("Prazo (minutos) é obrigatório"); setCarregando(false); return; }

    const minutos = Number(prazo);
    if (isNaN(minutos) || minutos <= 0) {
      toastError("Prazo deve ser um número válido em minutos (ex: 30, 60, 120)");
      setCarregando(false);
      return;
    }

    if (!tipoId) { toastError("Selecione um tipo de tarefa"); setCarregando(false); return; }
    if (!projetoId) { toastError("Selecione um projeto"); setCarregando(false); return; }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      responsavelId: responsavelId ? Number(responsavelId) : null,
      tempoMaximoMinutos: minutos,
      status,
      tipoTarefaId: Number(tipoId),
      projetoId: Number(projetoId),
      itemId: tarefaParaEditar?.itemId ?? null,
    };

    try {
      if (modoEdicao && tarefaParaEditar) {
        await ApiTarefas.put(`/tarefas/tarefas/${tarefaParaEditar.id}`, payload);
        toastSuccess("Tarefa atualizada com sucesso!");
      } else {
        await ApiTarefas.post("/tarefas/tarefas", payload);
        toastSuccess("Tarefa criada com sucesso!");
      }

      resetForm();
      onFechar();
      if (onSucesso) onSucesso();
    } catch (err: any) {
      console.error("Erro ao salvar tarefa:", err);

      let mensagemErro = `Erro ao ${modoEdicao ? "atualizar" : "criar"} tarefa. Tente novamente.`;
      if (err.response?.data?.message) mensagemErro = err.response.data.message;
      else if (err.response?.data?.errors) mensagemErro = Object.values(err.response.data.errors).join("\n");
      else if (err.message) mensagemErro = err.message;

      toastError(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative p-6 rounded shadow-lg w-full max-w-lg z-10" style={{ backgroundColor: "#252525", border: "1px solid #3e3e3e" }}>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            <p className="text-white ml-2">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={handleClose} />
      <div className="relative p-6 rounded overflow-y-auto shadow-lg w-full max-w-lg z-10" style={{ backgroundColor: "#252525", border: "1px solid #3e3e3e" }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            {modoEdicao ? "Editar Tarefa" : "Cadastrar Tarefa"}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl leading-none" disabled={carregando}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Título *</label>
            <input
              type="text"
              placeholder="Digite o título da tarefa"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              disabled={carregando}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Descrição *</label>
            <textarea
              placeholder="Descreva a tarefa em detalhes"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              rows={3}
              disabled={carregando}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Projeto *</label>
            <select
              value={projetoId}
              onChange={handleProjetoChange}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              disabled={carregando || !!projetoIdPadrao || modoEdicao}
              required
            >
              <option value="">Selecione o Projeto</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome} {projeto.codigo ? `(${projeto.codigo})` : ""}
                </option>
              ))}
            </select>
            {(projetoIdPadrao || modoEdicao) && (
              <p className="text-xs text-gray-500 mt-1">Projeto definido automaticamente</p>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Responsável (opcional)</label>
            <select
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              disabled={carregando}
            >
              <option value="">Selecione o Responsável</option>
              {responsaveisFiltrados.map((responsavel: any) => (
                <option key={responsavel.id} value={responsavel.id}>
                  {responsavel.nome}
                </option>
              ))}
            </select>
            {projetoSelecionado?.responsavelId && (
              <p className="text-xs text-blue-400 mt-1">Sugestão: responsável do projeto</p>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Prazo (minutos) *</label>
            <input
              type="number"
              placeholder="Ex: 30, 60, 120"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              min="1"
              step="1"
              disabled={carregando}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              disabled={carregando}
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Tipo de Tarefa *</label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: "#1f1f1f", borderColor: "#3e3e3e" }}
              disabled={carregando}
              required
            >
              <option value="">Selecione o tipo de tarefa</option>
              {tiposTarefa.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded transition-colors text-white"
              style={{ backgroundColor: "#3e3e3e" }}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#3e3e3e" }}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Salvando...
                </>
              ) : modoEdicao ? "Salvar alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
