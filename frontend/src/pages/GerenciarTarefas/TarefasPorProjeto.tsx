import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DragDropTarefas from "../../components/DragDropTarefas";
import ModalCadastroItem from "../../components/Modal/formularioItem";
import ModalCadastroTarefa from "../../components/Modal/formularioTarefas";
import projetoService from "../../types/projetoService";

export default function TarefasPorProjeto() {
  const { projetoId } = useParams<{ projetoId: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<any>(null);
  const [nomeResponsavel, setNomeResponsavel] = useState<string>("Não informado");
  const [modalItemAberto, setModalItemAberto] = useState<boolean>(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projetoId) {
      carregarProjeto();
    }
  }, [projetoId]);

  const carregarProjeto = async () => {
    try {
      setLoading(true);
      const projetoData = await projetoService.buscarPorId(Number(projetoId));
      setProjeto(projetoData);
      if (projetoData?.responsavelId) {
        const resposta = await fetch(`http://localhost:8081/api/profissionais/${projetoData.responsavelId}`);
        if (resposta.ok) {
          const profissional = await resposta.json();
          setNomeResponsavel(profissional.nome ?? "Não informado");
        }
      }
    } catch (err) {
      console.error("Erro ao carregar projeto:", err);
      setError("Projeto não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleSucesso = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const abrirModalItem = (tarefaId: number) => {
    setTarefaSelecionadaId(tarefaId);
    setModalItemAberto(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1f1f1f' }}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#1f1f1f' }}>
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <strong>Erro:</strong> {error || "Projeto não encontrado"}
        </div>
        <button
          onClick={() => navigate("/tarefas")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar para projetos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1f1f1f' }}>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/tarefas")}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para projetos
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">{projeto.nome}</h1>
              {projeto.descricao && (
                <p className="text-gray-400 mt-1">{projeto.descricao}</p>
              )}
              {projeto.codigo && (
                <p className="text-gray-500 text-sm mt-1">Código: {projeto.codigo}</p>
              )}
               <p className="text-gray-500 text-sm mt-1">Responsável: {nomeResponsavel}</p>
            </div>
            
            <button
              onClick={() => setModalTarefaAberto(true)}
              className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              style={{ backgroundColor: "#3e3e3e" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4e4e4e")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3e3e3e")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Tarefa
            </button>
          </div>
        </div>

        <DragDropTarefas
          key={refreshKey} 
          projetoId={Number(projetoId)}
          onAbrirModalItem={abrirModalItem}
        />

        <ModalCadastroItem
          tarefaId={tarefaSelecionadaId || 0}
          isOpen={modalItemAberto}
          onFechar={() => setModalItemAberto(false)}
          onSucesso={handleSucesso}
        />

        <ModalCadastroTarefa
          isOpen={modalTarefaAberto}
          onFechar={() => setModalTarefaAberto(false)}
          onSucesso={handleSucesso}
          projetoIdPadrao={Number(projetoId)}
        />
      </div>
    </div>
  );
}