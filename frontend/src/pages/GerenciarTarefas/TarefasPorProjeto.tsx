import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DragDropTarefas from "../../components/DragDropTarefas";
import ModalCadastroItem from "../../components/Modal/formularioItem";
import ModalCadastroTarefa from "../../components/Modal/formularioTarefas";
import { useProjetoContext } from "../../contexts/ProjetoContext";
import profissionalService from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";
import { toastError } from "../../utils/toastUtils";

export default function TarefasPorProjeto() {
  const { projeto, isLoading } = useProjetoContext();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.roles ?? [];
  const podeGerenciarTodasTarefas =
    userRoles.includes("ROLE_FINANCE") ||
    userRoles.includes("ROLE_GERENTE_PROJETO");

  const [nomeResponsavel, setNomeResponsavel] =
    useState<string>("Não informado");
  const [modalItemAberto, setModalItemAberto] = useState<boolean>(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (projeto?.responsavelId) {
      profissionalService
        .listarTodos()
        .then((profissionais) => {
          const responsavel = profissionais.find(
            (p) => p.id === projeto.responsavelId,
          );
          setNomeResponsavel(responsavel?.nome || "Não informado");
        })
        .catch(() => setNomeResponsavel("Erro ao carregar"));
    } else {
      setNomeResponsavel("Não informado");
    }
  }, [projeto]);

  const handleSucesso = () => setRefreshKey((prev) => prev + 1);

  const abrirModalItem = (tarefaId: number) => {
    setTarefaSelecionadaId(tarefaId);
    setModalItemAberto(true);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#1f1f1f" }}>
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <strong>Erro:</strong> Projeto não encontrado
        </div>
        <button
          onClick={() => navigate("/projetos")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Voltar para projetos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1f1f1f" }}>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/projetos")}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">{projeto.nome}</h1>
              {projeto.codigo && (
                <p className="text-gray-500 text-sm mt-1">
                  Código: {projeto.codigo}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Responsável: {nomeResponsavel}
              </p>
            </div>

            {podeGerenciarTodasTarefas && (
              <button
                onClick={() => setModalTarefaAberto(true)}
                className="text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: "#3e3e3e" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nova Tarefa
              </button>
            )}
          </div>
        </div>

        <DragDropTarefas
          key={refreshKey}
          projetoId={Number(projeto.id)}
          onAbrirModalItem={
            podeGerenciarTodasTarefas ? abrirModalItem : undefined
          }
          refreshKey={refreshKey}
        />

        {podeGerenciarTodasTarefas && (
          <ModalCadastroItem
            tarefaId={tarefaSelecionadaId || 0}
            isOpen={modalItemAberto}
            onFechar={() => setModalItemAberto(false)}
            onSucesso={handleSucesso}
          />
        )}

        {podeGerenciarTodasTarefas && (
          <ModalCadastroTarefa
            isOpen={modalTarefaAberto}
            onFechar={() => setModalTarefaAberto(false)}
            onSucesso={handleSucesso}
            projetoIdPadrao={Number(projeto.id)}
          />
        )}
      </div>
    </div>
  );
}