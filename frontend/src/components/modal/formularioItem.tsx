import { useState } from "react";
import itemService from "../../types/itemService";

interface Props {
  tarefaId: number;
  isOpen: boolean;
  onFechar: () => void;
  onSucesso?: () => void;
}

export default function ModalCadastroItem({ tarefaId, isOpen, onFechar, onSucesso }: Props) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    if (!nome.trim()) {
      setErro("Nome do item é obrigatório");
      setCarregando(false);
      return;
    }

    if (!descricao.trim()) {
      setErro("Descrição do item é obrigatória");
      setCarregando(false);
      return;
    }

    try {
      await itemService.criarItem(nome.trim(), descricao.trim(), tarefaId);
      setNome("");
      setDescricao("");
      onFechar();
      if (onSucesso) onSucesso();
    } catch (err: any) {
      console.error("Erro ao criar item:", err);
      setErro(`Erro ao salvar o item: ${err.response?.data?.message || err.message || "Tente novamente."}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onFechar}></div>
      <div className="relative p-6 rounded shadow-lg w-full max-w-md z-10" style={{ backgroundColor: '#252525', border: '1px solid #3e3e3e' }}>
        <h2 className="text-lg font-bold mb-4 text-white">Cadastrar Item</h2>
        {erro && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded whitespace-pre-wrap">
            <strong>Erro:</strong><br />{erro}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome do item *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          <textarea
            placeholder="Descrição do item *"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded transition-colors text-white"
              style={{ backgroundColor: '#3e3e3e' }}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded transition-colors text-white"
              style={{ backgroundColor: '#3e3e3e' }}
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}