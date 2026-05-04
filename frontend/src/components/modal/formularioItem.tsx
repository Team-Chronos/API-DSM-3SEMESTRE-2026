import { useEffect, useState } from "react";
import { ApiTarefas } from "../../service/servicoApi";
import { toastSuccess, toastError } from "../../utils/toastUtils";

interface Props {
  tarefaId: number;
  isOpen: boolean;
  onFechar: () => void;
  onSucesso: () => void;
  itemParaEditar?: { idItem: number; nome: string; descricao: string } | null;
}

export default function ModalCadastroItem({
  tarefaId,
  isOpen,
  onFechar,
  onSucesso,
  itemParaEditar = null,
}: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNome(itemParaEditar?.nome ?? "");
      setDescricao(itemParaEditar?.descricao ?? "");
    }
  }, [isOpen, itemParaEditar]);

  const handleSalvar = async () => {
    if (!nome.trim() || !descricao.trim()) {
      toastError("Preencha nome e descrição.");
      return;
    }
    setSalvando(true);
    try {
      const payload = { nome, descricao, tarefaId };
      if (itemParaEditar) {
        await ApiTarefas.put(`/itens/${itemParaEditar.idItem}`, payload);
      } else {
        await ApiTarefas.post("/itens", payload);
      }
      toastSuccess(itemParaEditar ? "Item atualizado!" : "Item criado!");
      onSucesso();
    } catch {
      toastError("Erro ao salvar item.");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70]">
      <div className="absolute inset-0 bg-black/70" onClick={onFechar} />
      <div className="relative p-6 rounded-lg shadow-2xl w-full max-w-md z-10 border border-[#3e3e3e]" style={{ backgroundColor: "#252525" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white italic">
            {itemParaEditar ? "Editar Item" : "Adicionar Item"}
          </h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 rounded text-white bg-[#1f1f1f] border border-[#3e3e3e] outline-none"
              disabled={salvando}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full p-2 rounded text-white bg-[#1f1f1f] border border-[#3e3e3e] outline-none resize-none"
              disabled={salvando}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onFechar} className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white" disabled={salvando}>
            Cancelar
          </button>
          <button onClick={handleSalvar} className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}