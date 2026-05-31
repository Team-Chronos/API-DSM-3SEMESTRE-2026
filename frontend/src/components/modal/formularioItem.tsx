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
        await ApiTarefas.put(`/tarefas/itens/${itemParaEditar.idItem}`, payload);
      } else {
        await ApiTarefas.post("/tarefas/itens", payload);
      }
      toastSuccess(itemParaEditar ? "Item atualizado!" : "Item criado!");
      onSucesso();
    } catch {
      toastError("Erro no servidor ao salvar item.");
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onFechar} />
      <div className="relative z-10 my-2 w-full max-w-[min(96vw,420px)] max-h-[94vh] overflow-y-auto rounded-lg border border-[#3e3e3e] p-4 shadow-2xl sm:my-0 sm:p-6" style={{ backgroundColor: "#252525" }}>
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
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onFechar} className="h-10 rounded px-4 text-sm text-gray-400 hover:text-white" disabled={salvando}>
            Cancelar
          </button>
          <button onClick={handleSalvar} className="h-10 rounded px-4 text-sm bg-blue-600 text-white hover:bg-blue-700" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}