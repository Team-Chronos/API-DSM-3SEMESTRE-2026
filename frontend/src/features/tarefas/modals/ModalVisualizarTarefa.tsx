import { useEffect, useState } from 'react';
import { ApiTarefas } from '../../../services/api/servicoApi';
import projetoService from '../../../types/projetoService';
import profissionalService from '../../../types/profissionalService';
import type { Profissional } from '../../../types/profissionalService';
import tarefaItemAdapter from '../../../types/tarefaItemAdapter';
import type { TarefaComItem } from '../../../types/tarefaItemAdapter';

interface Props {
  tarefa: any | null;
  isOpen: boolean;
  onFechar: () => void;
  onAtualizar?: () => void;
}

export default function ModalVisualizarTarefa({ tarefa, isOpen, onFechar, onAtualizar }: Props) {
  const [tarefaComItem, setTarefaComItem] = useState<TarefaComItem | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [editandoResponsavel, setEditandoResponsavel] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState<string>("");
  const [responsaveis, setResponsaveis] = useState<Profissional[]>([]);
  const [carregandoResponsaveis, setCarregandoResponsaveis] = useState(false);
  const [nomeResponsavelAtual, setNomeResponsavelAtual] = useState<string>("Carregando...");

  useEffect(() => {
    if (isOpen && tarefa?.id) {
      carregarTarefaComItem();
      carregarResponsaveis();
      if (tarefa.projetoId) {
        carregarNomeProjeto(tarefa.projetoId);
      }
    }
  }, [isOpen, tarefa]);

  useEffect(() => {
    if (responsaveis.length > 0 && tarefa?.responsavelId) {
      const responsavel = responsaveis.find(r => r.id === tarefa.responsavelId);
      if (responsavel) {
        setNomeResponsavelAtual(responsavel.nome);
      } else {
        setNomeResponsavelAtual(`ID: ${tarefa.responsavelId}`);
      }
    } else if (tarefa?.responsavelId && responsaveis.length === 0) {
      setNomeResponsavelAtual(`ID: ${tarefa.responsavelId}`);
    } else if (!tarefa?.responsavelId) {
      setNomeResponsavelAtual("Não atribuído");
    }
  }, [responsaveis, tarefa]);

  const carregarTarefaComItem = async () => {
    setCarregando(true);
    try {
      const resultado = await tarefaItemAdapter.buscarTarefaComItem(tarefa.id);
      setTarefaComItem(resultado);
    } catch (err) {
      console.error("Erro ao carregar tarefa com item:", err);
      setTarefaComItem(null);
    } finally {
      setCarregando(false);
    }
  };

  const carregarResponsaveis = async () => {
    setCarregandoResponsaveis(true);
    try {
      const responsaveisLista = await profissionalService.listarTodos();
      console.log("Responsáveis carregados:", responsaveisLista);
      setResponsaveis(responsaveisLista);
      
      if (tarefa?.responsavelId) {
        setResponsavelSelecionado(String(tarefa.responsavelId));
      } else {
        setResponsavelSelecionado("");
      }
    } catch (err) {
      console.error("Erro ao carregar responsáveis:", err);
      setResponsaveis([]);
    } finally {
      setCarregandoResponsaveis(false);
    }
  };

  const carregarNomeProjeto = async (projetoId: number) => {
    try {
      const projeto = await projetoService.buscarPorId(projetoId);
      setNomeProjeto(projeto?.nome || `Projeto ${projetoId}`);
    } catch (err) {
      console.error("Erro ao carregar projeto:", err);
      setNomeProjeto(`Projeto ${projetoId}`);
    }
  };

  const handleSalvarResponsavel = async () => {
    if (!tarefa || !responsavelSelecionado) return;
    
    setSalvando(true);
    try {
      const tarefaAtualizada = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: Number(responsavelSelecionado),
        tempoMaximoMinutos: tarefa.tempoMaximoMinutos,
        status: tarefa.status,
        tipoTarefaId: tarefa.tipoTarefaId,
        projetoId: tarefa.projetoId,
        itemId: tarefa.itemId
      };
      
      await ApiTarefas.put(`/tarefas/${tarefa.id}`, tarefaAtualizada);
      
      const novoResponsavel = responsaveis.find(r => r.id === Number(responsavelSelecionado));
      if (novoResponsavel) {
        setNomeResponsavelAtual(novoResponsavel.nome);
      }
      
      setEditandoResponsavel(false);
      
      await carregarTarefaComItem();
      
      if (onAtualizar) onAtualizar();
      
    } catch (err) {
      console.error("Erro ao atualizar responsável:", err);
      alert("Erro ao atualizar responsável. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAbrirEdicao = () => {
    setResponsavelSelecionado(tarefa?.responsavelId ? String(tarefa.responsavelId) : "");
    setEditandoResponsavel(true);
  };

  const getNomeResponsavel = (): string => {
    if (carregandoResponsaveis && responsaveis.length === 0) {
      return "Carregando...";
    }
    return nomeResponsavelAtual;
  };

  const formatarData = (data: string | number | null) => {
    if (!data) return 'Não definido';
    
    try {
      let timestamp: number;
      
      if (typeof data === 'string') {
        timestamp = parseInt(data, 10);
        if (isNaN(timestamp)) {
          return new Date(data).toLocaleDateString('pt-BR');
        }
      } else {
        timestamp = data;
      }
      
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (!isOpen || !tarefa) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      <div className="absolute inset-0 bg-black/70" onClick={onFechar}></div>
      
      <div className="relative p-6 rounded-lg shadow-2xl w-full max-w-lg z-10 border border-[#3e3e3e]" style={{ backgroundColor: '#252525' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white italic">Detalhes da Tarefa</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
            <p className="text-white text-lg">{tarefa.titulo}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
            <p className="text-gray-300 bg-[#1f1f1f] p-3 rounded border border-[#3e3e3e] mt-1">
              {tarefa.descricao || "Sem descrição."}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Responsável</label>
            
            {!editandoResponsavel ? (
              <div 
                className="flex items-center justify-between bg-[#1f1f1f] p-3 rounded border border-[#3e3e3e] cursor-pointer hover:border-blue-500 transition-colors"
                onClick={handleAbrirEdicao}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white">
                    {getNomeResponsavel()}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={responsavelSelecionado}
                  onChange={(e) => setResponsavelSelecionado(e.target.value)}
                  className="w-full p-2 rounded text-white bg-[#1f1f1f] border border-[#3e3e3e]"
                  disabled={salvando || carregandoResponsaveis}
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((responsavel) => (
                    <option key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome}
                    </option>
                  ))}
                </select>
                {carregandoResponsaveis && (
                  <p className="text-xs text-gray-400">Carregando responsáveis...</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditandoResponsavel(false)}
                    className="px-3 py-1 rounded text-sm text-gray-400 hover:text-white transition-colors"
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarResponsavel}
                    className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    disabled={salvando || !responsavelSelecionado}
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Prazo</label>
              <p className="text-white mt-1">{tarefa.tempoMaximoMinutos} minutos</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <p className="text-white mt-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  tarefa.status === 'CONCLUIDA' ? 'bg-green-500' : 
                  tarefa.status === 'EM_ANDAMENTO' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></span>
                {tarefa.status === 'PENDENTE' ? 'Pendente' : 
                 tarefa.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Concluída'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Projeto</label>
              <p className="text-white mt-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {nomeProjeto}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo Tarefa</label>
              <p className="text-white mt-1">{tarefa.tipoTarefaId}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
              Item / Subtarefa
            </label>
            <div className="space-y-2">
              {carregando ? (
                <p className="text-gray-500 animate-pulse">Carregando item...</p>
              ) : tarefaComItem?.item ? (
                <div className="p-3 rounded bg-[#2a2a2a] border-l-4 border-blue-500 shadow-sm">
                  <div className="text-white text-sm font-semibold">{tarefaComItem.item.nome}</div>
                  <div className="text-gray-400 text-xs">{tarefaComItem.item.descricao}</div>
                  {tarefaComItem.item.createdAt && (
                    <div className="text-gray-500 text-[10px] mt-1">
                      Criado em: {new Date(tarefaComItem.item.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-[#1f1f1f] rounded">
                  <p className="text-gray-500 italic text-sm">
                    Nenhum item vinculado a esta tarefa.
                  </p>
                  <button
                    onClick={() => {
                      onFechar();
                      window.dispatchEvent(new CustomEvent('abrirModalItem', { detail: { tarefaId: tarefa.id } }));
                    }}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Adicionar item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={onFechar}
          className="mt-8 w-full py-3 rounded font-bold text-white transition-all hover:brightness-125"
          style={{ backgroundColor: '#3e3e3e' }}
        >
          FECHAR
        </button>
      </div>
    </div>
  );
}