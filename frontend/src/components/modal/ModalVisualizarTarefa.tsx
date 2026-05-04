import { useEffect, useState } from "react";
import { ApiTarefas } from "../../service/servicoApi";
import projetoService from "../../types/projetoService";
import profissionalService from "../../types/profissionalService";
import type { Profissional } from "../../types/profissionalService";
import tarefaItemAdapter from "../../types/tarefaItemAdapter";
import type { TarefaComItem } from "../../types/tarefaItemAdapter";
import { toastSuccess, toastError } from "../../utils/toastUtils";
import ModalCadastroTarefa from "./formularioTarefas";
import ModalCadastroItem from "./formularioItem";

interface Props {
  tarefa: any | null;
  isOpen: boolean;
  onFechar: () => void;
  onAtualizar?: () => void;
  podeGerenciarTodasTarefas?: boolean;
}

export default function ModalVisualizarTarefa({
  tarefa,
  isOpen,
  onFechar,
  onAtualizar,
  podeGerenciarTodasTarefas = false,
}: Props) {
  const [tarefaComItem, setTarefaComItem] = useState<TarefaComItem | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [editandoResponsavel, setEditandoResponsavel] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState<string>("");
  const [responsaveis, setResponsaveis] = useState<Profissional[]>([]);
  const [carregandoResponsaveis, setCarregandoResponsaveis] = useState(false);
  const [nomeResponsavelAtual, setNomeResponsavelAtual] = useState<string>("Carregando...");
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmandoExclusaoItem, setConfirmandoExclusaoItem] = useState<number | null>(null);
  const [excluindoItem, setExcluindoItem] = useState(false);

  useEffect(() => {
    if (isOpen && tarefa?.id) {
      carregarTarefaComItem();
      carregarResponsaveis();
      if (tarefa.projetoId) carregarNomeProjeto(tarefa.projetoId);
    }
  }, [isOpen, tarefa?.id]);

  useEffect(() => {
    if (responsaveis.length > 0 && tarefa?.responsavelId) {
      const responsavel = responsaveis.find((r) => r.id === tarefa.responsavelId);
      setNomeResponsavelAtual(responsavel ? responsavel.nome : `ID: ${tarefa.responsavelId}`);
    } else if (tarefa?.responsavelId && responsaveis.length === 0) {
      setNomeResponsavelAtual(`ID: ${tarefa.responsavelId}`);
    } else if (!tarefa?.responsavelId) {
      setNomeResponsavelAtual("Não atribuído");
    }
  }, [responsaveis, tarefa?.responsavelId]);

  const carregarTarefaComItem = async () => {
    setCarregando(true);
    try {
      const resultado = await tarefaItemAdapter.buscarTarefaComItem(tarefa.id);
      setTarefaComItem(resultado);
    } catch {
      setTarefaComItem(null);
    } finally {
      setCarregando(false);
    }
  };

  const carregarResponsaveis = async () => {
    setCarregandoResponsaveis(true);
    try {
      const lista = await profissionalService.listarTodos();
      setResponsaveis(lista);
      setResponsavelSelecionado(tarefa?.responsavelId ? String(tarefa.responsavelId) : "");
    } catch {
      setResponsaveis([]);
    } finally {
      setCarregandoResponsaveis(false);
    }
  };

  const carregarNomeProjeto = async (projetoId: number) => {
    try {
      const projeto = await projetoService.buscarPorId(projetoId);
      setNomeProjeto(projeto?.nome || `Projeto ${projetoId}`);
    } catch {
      setNomeProjeto(`Projeto ${projetoId}`);
    }
  };

  const handleSalvarResponsavel = async () => {
    if (!tarefa || !responsavelSelecionado) return;
    setSalvando(true);
    try {
      await ApiTarefas.put(`/tarefas/tarefas/${tarefa.id}`, {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        responsavelId: Number(responsavelSelecionado),
        tempoMaximoMinutos: tarefa.tempoMaximoMinutos,
        status: tarefa.status,
        tipoTarefaId: tarefa.tipoTarefaId,
        projetoId: tarefa.projetoId,
      });
      const novoResponsavel = responsaveis.find((r) => r.id === Number(responsavelSelecionado));
      if (novoResponsavel) setNomeResponsavelAtual(novoResponsavel.nome);
      setEditandoResponsavel(false);
      toastSuccess("Responsável atualizado com sucesso!");
      await carregarTarefaComItem();
      if (onAtualizar) onAtualizar();
    } catch {
      toastError("Erro ao atualizar responsável. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!tarefa) return;
    setExcluindo(true);
    try {
      await ApiTarefas.delete(`/tarefas/tarefas/${tarefa.id}`);
      toastSuccess("Tarefa excluída com sucesso!");
      setConfirmandoExclusao(false);
      onFechar();
      if (onAtualizar) onAtualizar();
    } catch {
      toastError("Erro ao excluir tarefa. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleExcluirItem = async (idItem: number) => {
    setExcluindoItem(true);
    try {
      await ApiTarefas.delete(`/itens/${idItem}`);
      toastSuccess("Item excluído com sucesso!");
      setConfirmandoExclusaoItem(null);
      await carregarTarefaComItem();
    } catch {
      toastError("Erro ao excluir item.");
    } finally {
      setExcluindoItem(false);
    }
  };

  const handleAbrirEditar = () => {
    onFechar();
    setTimeout(() => setModalEditarAberto(true), 150);
  };

  const handleAbrirEditarItem = (item: any) => {
    setItemSelecionado(item);
    onFechar();
    setTimeout(() => setModalItemAberto(true), 150);
  };

  const handleAbrirAdicionarItem = () => {
    setItemSelecionado(null);
    onFechar();
    setTimeout(() => setModalItemAberto(true), 150);
  };

  const getNomeResponsavel = (): string => {
    if (carregandoResponsaveis && responsaveis.length === 0) return "Carregando...";
    return nomeResponsavelAtual;
  };

  return (
    <>
      {isOpen && tarefa && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="absolute inset-0 bg-black/70" onClick={onFechar} />
          <div
            className="relative w-full max-w-lg z-10 border border-[#3e3e3e] rounded-lg shadow-2xl flex flex-col"
            style={{ backgroundColor: "#252525", maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-white italic">Detalhes da Tarefa</h2>
              <div className="flex items-center gap-2">
                {podeGerenciarTodasTarefas && (
                  <>
                    <button
                      onClick={handleAbrirEditar}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: "#3e3e3e" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmandoExclusao(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20"
                      style={{ backgroundColor: "#3e3e3e" }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  </>
                )}
                <button onClick={onFechar} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#3e3e3e #1f1f1f" }}>

              {confirmandoExclusao && (
                <div className="mb-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                  <p className="text-sm text-red-300 mb-3">
                    Tem certeza que deseja excluir a tarefa <strong>"{tarefa.titulo}"</strong>? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setConfirmandoExclusao(false)} className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white" disabled={excluindo}>
                      Cancelar
                    </button>
                    <button onClick={handleExcluir} className="px-3 py-1.5 rounded text-sm bg-red-600 text-white hover:bg-red-700" disabled={excluindo}>
                      {excluindo ? "Excluindo..." : "Confirmar exclusão"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                  <p className="text-white text-lg">{tarefa.titulo}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                  <p className="text-gray-300 bg-[#1f1f1f] p-3 rounded border border-[#3e3e3e] mt-1">{tarefa.descricao || "Sem descrição."}</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Responsável</label>
                  {!editandoResponsavel ? (
                    <div
                      className={`flex items-center justify-between bg-[#1f1f1f] p-3 rounded border border-[#3e3e3e] transition-colors ${podeGerenciarTodasTarefas ? "cursor-pointer hover:border-blue-500" : ""}`}
                      onClick={podeGerenciarTodasTarefas ? () => setEditandoResponsavel(true) : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-white">{getNomeResponsavel()}</span>
                      </div>
                      {podeGerenciarTodasTarefas && (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )}
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
                        {responsaveis.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
                      </select>
                      {carregandoResponsaveis && <p className="text-xs text-gray-400">Carregando responsáveis...</p>}
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditandoResponsavel(false)} className="px-3 py-1 rounded text-sm text-gray-400 hover:text-white" disabled={salvando}>
                          Cancelar
                        </button>
                        <button onClick={handleSalvarResponsavel} className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600" disabled={salvando || !responsavelSelecionado}>
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
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${tarefa.status === "CONCLUIDA" ? "bg-green-500" : tarefa.status === "EM_ANDAMENTO" ? "bg-blue-500" : "bg-yellow-500"}`} />
                      {tarefa.status === "PENDENTE" ? "Pendente" : tarefa.status === "EM_ANDAMENTO" ? "Em Andamento" : "Concluída"}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Itens / Subtarefas</label>
                    {podeGerenciarTodasTarefas && (
                      <button onClick={handleAbrirAdicionarItem} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        + Adicionar item
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#3e3e3e #1f1f1f" }}>
                    {carregando ? (
                      <p className="text-gray-500 animate-pulse text-sm">Carregando itens...</p>
                    ) : tarefaComItem?.itens && tarefaComItem.itens.length > 0 ? (
                      tarefaComItem.itens.map((item) => (
                        <div key={item.idItem} className="p-3 rounded bg-[#2a2a2a] border-l-4 border-blue-500 shadow-sm">
                          {confirmandoExclusaoItem === item.idItem ? (
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-red-300">Excluir <strong>{item.nome}</strong>?</p>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setConfirmandoExclusaoItem(null)}
                                  className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white"
                                  disabled={excluindoItem}
                                >
                                  Não
                                </button>
                                <button
                                  onClick={() => handleExcluirItem(item.idItem)}
                                  className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
                                  disabled={excluindoItem}
                                >
                                  {excluindoItem ? "..." : "Sim"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-white text-sm font-semibold">{item.nome}</div>
                                <div className="text-gray-400 text-xs">{item.descricao}</div>
                              </div>
                              {podeGerenciarTodasTarefas && (
                                <div className="flex gap-1 flex-shrink-0 mt-0.5">
                                  <button
                                    onClick={() => handleAbrirEditarItem(item)}
                                    className="text-gray-500 hover:text-blue-400 transition-colors"
                                    title="Editar item"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setConfirmandoExclusaoItem(item.idItem)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                    title="Excluir item"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-[#1f1f1f] rounded">
                        <p className="text-gray-500 italic text-sm">Nenhum item vinculado a esta tarefa.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 flex-shrink-0">
              <button
                onClick={onFechar}
                className="w-full py-3 rounded font-bold text-white transition-all hover:brightness-125"
                style={{ backgroundColor: "#3e3e3e" }}
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {podeGerenciarTodasTarefas && tarefa && (
        <ModalCadastroTarefa
          isOpen={modalEditarAberto}
          onFechar={() => setModalEditarAberto(false)}
          onSucesso={() => { setModalEditarAberto(false); if (onAtualizar) onAtualizar(); }}
          projetoIdPadrao={tarefa?.projetoId}
          tarefaParaEditar={tarefa}
        />
      )}

      {podeGerenciarTodasTarefas && tarefa && (
        <ModalCadastroItem
          tarefaId={tarefa.id}
          isOpen={modalItemAberto}
          onFechar={() => { setModalItemAberto(false); setItemSelecionado(null); }}
          onSucesso={() => { setModalItemAberto(false); setItemSelecionado(null); if (onAtualizar) onAtualizar(); }}
          itemParaEditar={itemSelecionado ? { idItem: itemSelecionado.idItem, nome: itemSelecionado.nome, descricao: itemSelecionado.descricao } : null}
        />
      )}
    </>
  );
}