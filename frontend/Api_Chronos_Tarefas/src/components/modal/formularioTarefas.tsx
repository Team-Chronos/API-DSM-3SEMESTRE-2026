import { useState, FormEvent, useEffect } from "react";
import { ApiTarefas } from "../../api/servicoApi";
import projetoService, { Projeto, ResponsavelProjeto } from "../../api/projetoService";

interface Props {
  isOpen: boolean;
  onFechar: () => void;
  onSucesso?: () => void;
}

interface TipoTarefa {
  id: number;
  nome: string;
}

export default function ModalCadastroTarefa({ isOpen, onFechar, onSucesso }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [tipoId, setTipoId] = useState<string>("");
  const [projetoId, setProjetoId] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [tiposTarefa, setTiposTarefa] = useState<TipoTarefa[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelProjeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (isOpen) {
      carregarDadosIniciais();
    }
  }, [isOpen]);

  const carregarDadosIniciais = async () => {
    setCarregandoDados(true);
    try {
      const tiposRes = await ApiTarefas.get('/tipoTarefa');
      setTiposTarefa(tiposRes.data);
      
      const projetosLista = await projetoService.listarTodos();
      setProjetos(projetosLista);
      
      const responsaveisLista = await projetoService.listarResponsaveis();
      setResponsaveis(responsaveisLista);
      
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro("Erro ao carregar dados necessários");
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
      }
    } else {
      setProjetoSelecionado(null);
      setResponsavelId("");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

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
      
      setTitulo("");
      setDescricao("");
      setResponsavelId("");
      setPrazo("");
      setStatus("PENDENTE");
      setTipoId("");
      setProjetoId("");
      setProjetoSelecionado(null);
      
      onFechar();
      if (onSucesso) onSucesso();
      
    } catch (err: any) {
      console.error("Erro ao criar tarefa:", err);
      setErro(err.response?.data?.message || "Erro ao criar tarefa. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative p-6 rounded shadow-lg w-full max-w-lg z-10 bg-[#252525] border border-[#3e3e3e]">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white ml-2">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onFechar}></div>

      <div className="relative p-6 rounded shadow-lg w-full max-w-lg z-10" style={{ backgroundColor: '#252525', border: '1px solid #3e3e3e' }}>
        <h2 className="text-lg font-bold mb-4 text-white">Cadastrar Tarefa</h2>

        {erro && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded whitespace-pre-wrap">
            <strong>Erro:</strong><br />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          
          <textarea
            placeholder="Descrição *"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            rows={3}
            required
          />
          
          <select
            value={projetoId}
            onChange={handleProjetoChange}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          >
            <option value="">Selecione o Projeto *</option>
            {projetos.map((projeto) => (
              <option key={projeto.id} value={projeto.id}>
                {projeto.nome} {projeto.codigo ? `(${projeto.codigo})` : ''}
              </option>
            ))}
          </select>
          
          <select
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
          >
            <option value="">Selecione o Responsável (opcional)</option>
            {responsaveis.map((responsavel) => (
              <option key={responsavel.id} value={responsavel.id}>
                {responsavel.nome}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Prazo em minutos * (ex: 30, 60, 120)"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            min="1"
            step="1"
            required
          />
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          >
            <option value="PENDENTE">Pendente</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDA">Concluída</option>
          </select>
          
          <select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          >
            <option value="">Selecione o tipo de tarefa *</option>
            {tiposTarefa.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onFechar}
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
              className="px-4 py-2 rounded text-white transition-colors"
              style={{ backgroundColor: '#3e3e3e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4e4e4e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
              disabled={carregando}
            >
              {carregando ? 'Cadastrando...' : 'Concluir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}