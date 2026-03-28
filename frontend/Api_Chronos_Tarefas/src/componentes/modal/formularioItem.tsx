import { useState, FormEvent } from "react";
import Api from "../../servico/servicoApi";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    Api.post("/itens", { nome, descricao, tarefaId })
      .then(() => {
        setNome("");
        setDescricao("");
        onFechar(); 
        if (onSucesso) onSucesso(); 
      })
      .catch((err) => {
        console.error("Erro ao criar item:", err);
        
        if (err.response) {
          if (err.response.data && err.response.data.errors) {
            const errors = err.response.data.errors;
            const mensagemErro = errors.map((error: any) => 
              `${error.field}: ${error.defaultMessage}`
            ).join('\n');
            setErro(mensagemErro);
          } else if (err.response.data && err.response.data.message) {
            setErro(err.response.data.message);
          } else {
            setErro("Erro ao criar item! Verifique os dados e tente novamente.");
          }
        } else {
          setErro("Erro ao criar item! Verifique sua conexão com o servidor.");
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onFechar}
      ></div>

      <div 
        className="relative p-6 rounded shadow-lg w-full max-w-md z-10"
        style={{ backgroundColor: '#252525', border: '1px solid #3e3e3e' }}
      >
        <h2 className="text-lg font-bold mb-4 text-white">Cadastrar Item</h2>

        {erro && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded whitespace-pre-wrap">
            <strong>Erro:</strong><br />
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome do item"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          <input
            type="text"
            placeholder="Descrição do item"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />

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
              className="px-4 py-2 rounded transition-colors text-white"
              style={{ backgroundColor: '#3e3e3e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4e4e4e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3e3e3e'}
              disabled={carregando}
            >
              Concluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}