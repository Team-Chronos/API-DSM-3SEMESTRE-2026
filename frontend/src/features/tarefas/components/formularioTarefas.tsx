import { useState, useEffect } from "react";
import { ApiTarefas } from "../../../services/api/servicoApi";
import projetoService from "../../../types/projetoService";
import profissionalService from "../../../types/profissionalService";
import type { Projeto, ResponsavelProjeto } from "../../../types/projetoService";

interface Props {
  isOpen: boolean;
  onFechar: () => void;
  onSucesso?: () => void;
  projetoIdPadrao?: number;
}

interface TipoTarefa {
  id: number;
  nome: string;
}

export default function ModalCadastroTarefa({ isOpen, onFechar, onSucesso, projetoIdPadrao }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [tipoId, setTipoId] = useState<string>("");
  const [projetoId, setProjetoId] = useState<string>(projetoIdPadrao ? String(projetoIdPadrao) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelProjeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (projetoIdPadrao) {
      setProjetoId(String(projetoIdPadrao));
    }
  }, [projetoIdPadrao]);

  useEffect(() => {
    if (isOpen) {
      carregarDadosIniciais();
    }
  }, [isOpen]);

  const carregarDadosIniciais = async () => {
    setCarregandoDados(true);
    setErro(null);
    try {
      // Carregar tipos de tarefa
      const tiposRes = await ApiTarefas.get('/tipoTarefa');
      setTiposTarefa(tiposRes.data || []);

      // Carregar projetos
      const projetosLista = await projetoService.listarTodos();
      setProjetos(projetosLista || []);

      // Carregar responsáveis
      const responsaveisLista = await profissionalService.listarTodos();
      setResponsaveis(responsaveisLista || []);

      // Se tiver projetoIdPadrao, carregar seus detalhes
      if (projetoIdPadrao) {
        try {
          const projeto = await projetoService.buscarPorId(projetoIdPadrao);
          setProjetoSelecionado(projeto || null);
          
          if (projeto?.responsavelId) {
            setResponsavelId(String(projeto.responsavelId));
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes do projeto padrão:", err);
        }
      }

    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro("Erro ao carregar dados necessários. Tente novamente.");
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleProjetoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setProjetoId(id);

    if (id) {
      try {
        const projeto = await projetoService.buscarPorId(Number(id));
        setProjetoSelecionado(projeto || null);

        if (projeto?.responsavelId) {
          setResponsavelId(String(projeto.responsavelId));
        } else {
          setResponsavelId("");
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do projeto:", err);
        setProjetoSelecionado(null);
        setResponsavelId("");
      }
    } else {
      setProjetoSelecionado(null);
      setResponsavelId("");
    }
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setResponsavelId("");
    setPrazo("");
    setStatus("PENDENTE");
    setTipoId("");
    if (!projetoIdPadrao) {
      setProjetoId("");
    }
    setProjetoSelecionado(null);
    setErro(null);
  };

  const handleClose = () => {
    resetForm();
    onFechar();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    // Validações
    if (!titulo.trim()) {
      setErro("Título é obrigatório");
      setCarregando(false);
      return;
    }
    
    if (!descricao.trim()) {
      setErro("Descrição é obrigatória");
      setCarregando(false);
      return;
    }
    
    if (!prazo) {
      setErro("Prazo (minutos) é obrigatório");
      setCarregando(false);
      return;
    }
    
    const minutos = Number(prazo);
    if (isNaN(minutos) || minutos <= 0) {
      setErro("Prazo deve ser um número válido em minutos (ex: 30, 60, 120)");
      setCarregando(false);
      return;
    }
    
    if (!tipoId) {
      setErro("Selecione um tipo de tarefa");
      setCarregando(false);
      return;
    }
    
    if (!projetoId) {
      setErro("Selecione um projeto");
      setCarregando(false);
      return;
    }

    const novaTarefa = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      responsavelId: responsavelId ? Number(responsavelId) : null,
      tempoMaximoMinutos: minutos,
      status: status,
      tipoTarefaId: Number(tipoId),
      projetoId: Number(projetoId)
    };

    try {
      await ApiTarefas.post("/tarefas", novaTarefa);
      
      resetForm();
      onFechar();
      if (onSucesso) onSucesso();

    } catch (err: any) {
      console.error("Erro ao criar tarefa:", err);
      
      let mensagemErro = "Erro ao criar tarefa. Tente novamente.";
      if (err.response?.data?.message) {
        mensagemErro = err.response.data.message;
      } else if (err.response?.data?.errors) {
        mensagemErro = Object.values(err.response.data.errors).join("\n");
      } else if (err.message) {
        mensagemErro = err.message;
      }
      
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative p-6 rounded shadow-lg w-full max-w-lg z-10" style={{ backgroundColor: '#252525', border: '1px solid #3e3e3e' }}>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white ml-2">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={handleClose}></div>

      <div className="relative p-6 rounded overflow-y-auto shadow-lg w-full max-w-lg z-10" style={{ backgroundColor: '#252525', border: '1px solid #3e3e3e' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Cadastrar Tarefa</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            disabled={carregando}
          >
            &times;
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded whitespace-pre-wrap">
            <strong>Erro:</strong><br />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Título */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Título *</label>
            <input
              type="text"
              placeholder="Digite o título da tarefa"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              disabled={carregando}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Descrição *</label>
            <textarea
              placeholder="Descreva a tarefa em detalhes"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              rows={3}
              disabled={carregando}
              required
            />
          </div>

          {/* Projeto */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Projeto *</label>
            <select
              value={projetoId}
              onChange={handleProjetoChange}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              disabled={carregando || !!projetoIdPadrao}
              required
            >
              <option value="">Selecione o Projeto</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.nome} {projeto.codigo ? `(${projeto.codigo})` : ''}
                </option>
              ))}
            </select>
            {projetoIdPadrao && (
              <p className="text-xs text-gray-500 mt-1">
                Projeto definido automaticamente
              </p>
            )}
          </div>

          {/* Responsável */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Responsável (opcional)</label>
            <select
              value={responsavelId}
              onChange={(e) => setResponsavelId(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              disabled={carregando}
            >
              <option value="">Selecione o Responsável</option>
              {responsaveis.map((responsavel) => (
                <option key={responsavel.id} value={responsavel.id}>
                  {responsavel.nome}
                </option>
              ))}
            </select>
            {projetoSelecionado?.responsavelId && (
              <p className="text-xs text-blue-400 mt-1">
                Sugestão: responsável do projeto
              </p>
            )}
          </div>

          {/* Prazo */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Prazo (minutos) *</label>
            <input
              type="number"
              placeholder="Ex: 30, 60, 120"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full border p-2 rounded text-white placeholder-gray-500"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              min="1"
              step="1"
              disabled={carregando}
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
              disabled={carregando}
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>

          {/* Tipo de Tarefa */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Tipo de Tarefa *</label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full border p-2 rounded text-white"
              style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
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

          {/* Botões */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded transition-colors text-white"
              style={{ backgroundColor: '#3e3e3e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4e4e4e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#3e3e3e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4e4e4e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}