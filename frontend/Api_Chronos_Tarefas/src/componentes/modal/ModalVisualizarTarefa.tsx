import React, { useEffect, useState } from 'react';
import Api from "../../servico/servicoApi";

interface Item {
  id: number;
  nome: string;
  descricao: string;
}

interface Props {
  tarefa: any | null;
  isOpen: boolean;
  onFechar: () => void;
}

export default function ModalVisualizarTarefa({ tarefa, isOpen, onFechar }: Props) {
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (isOpen && tarefa?.id) {
      carregarItens();
    }
  }, [isOpen, tarefa]);

  const carregarItens = async () => {
    setCarregando(true);
    try {
      const response = await Api.get(`/itens/tarefa/${tarefa.id}`);
      setItens(response.data);
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
      setItens([]);
    } finally {
      setCarregando(false);
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
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Itens / Subtarefas</label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {carregando ? (
                <p className="text-gray-500 animate-pulse">A carregar itens...</p>
              ) : itens.length > 0 ? (
                itens.map(item => (
                  <div key={item.id} className="p-3 rounded bg-[#2a2a2a] border-l-4 border-blue-500 shadow-sm">
                    <div className="text-white text-sm font-semibold">{item.nome}</div>
                    <div className="text-gray-400 text-xs">{item.descricao}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm text-center py-4 bg-[#1f1f1f] rounded">
                  Nenhum item vinculado a esta tarefa.
                </p>
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