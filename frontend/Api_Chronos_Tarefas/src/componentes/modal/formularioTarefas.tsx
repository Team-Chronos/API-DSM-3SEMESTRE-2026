import { useState, FormEvent } from "react";
import Api from "../../servico/servicoApi";

interface Props {
  isOpen: boolean;
  onFechar: () => void;
  onSucesso?: () => void;
}

export default function ModalCadastroTarefa({ isOpen, onFechar, onSucesso }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [tempoMaximoMinutos, setTempoMaximoMinutos] = useState("");
  const [status, setStatus] = useState("");
  const [tipoId, setTipoId] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    if (!tipoId) {
      setErro("Por favor, selecione um tipo de tarefa");
      setCarregando(false);
      return;
    }

    const statusMap: { [key: string]: string } = {
      "Pendente": "PENDENTE",
      "Em andamento": "EM_ANDAMENTO",
      "Concluída": "CONCLUIDA"
    };

    const dadosTarefa = { 
      titulo, 
      descricao, 
      responsavelId: Number(responsavelId),
      tempoMaximoMinutos: Number(tempoMaximoMinutos),
      status: statusMap[status] || status,
      tipoTarefaId: Number(tipoId)
    };

    try {
      await Api.post("/tarefas", dadosTarefa);
      
      setTitulo("");
      setDescricao("");
      setResponsavelId("");
      setTempoMaximoMinutos("");
      setStatus("");
      setTipoId("");
      
      onFechar();
      if (onSucesso) onSucesso();
    } catch (err: any) {
      console.error("Erro completo:", err);
      
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
          setErro("Erro ao criar tarefa! Verifique os dados e tente novamente.");
        }
      } else {
        setErro("Erro ao criar tarefa! Verifique os dados e tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onFechar} 
      ></div>

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
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            rows={3}
            required
          />
          
          <input
            type="number"
            placeholder="Responsável (ID)"
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          
          <input
            type="number"
            placeholder="Tempo máximo (minutos)"
            value={tempoMaximoMinutos}
            onChange={(e) => setTempoMaximoMinutos(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          />
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          >
            <option value="">Selecione o status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
          
          <select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            className="border p-2 rounded text-white"
            style={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e' }}
            required
          >  
            <option value="">Selecione o tipo</option>
            <option value="1">Desenvolvimento</option>
            <option value="2">Teste</option>
            <option value="3">Analise</option>
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
            >Concluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}