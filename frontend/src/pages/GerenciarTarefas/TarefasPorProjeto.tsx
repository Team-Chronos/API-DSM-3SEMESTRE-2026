import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DragDropTarefas from "../../components/DragDropTarefas";
import ModalCadastroItem from "../../components/Modal/formularioItem";
import ModalCadastroTarefa from "../../components/Modal/formularioTarefas";
import { useProjetoContext } from "../../contexts/ProjetoContext";
import profissionalService from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";

export default function TarefasPorProjeto() {
  const { projeto, isLoading } = useProjetoContext();
  const navigate = useNavigate();
  const { podeGerenciarProjetos } = useAuth();

  const podeGerenciarTodasTarefas = podeGerenciarProjetos;

  const [nomeResponsavel, setNomeResponsavel] = useState<string>("Não informado");
  const [modalItemAberto, setModalItemAberto] = useState<boolean>(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [tarefaSelecionadaId, setTarefaSelecionadaId] = useState<number | null>(null);

  useEffect(() => {
    if (projeto?.responsavelId) {
      profissionalService
        .listarTodos()
        .then((profissionais) => {
          const responsavel = profissionais.find((p) => p.id === projeto.responsavelId);
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
        className="flex min-h-screen items-center justify-center bg-[#1f1f1f] p-6"
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
      <div className="min-h-screen bg-[#1f1f1f] p-4 text-white sm:p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            <strong>Erro:</strong> Projeto não encontrado
          </div>
          <button
            onClick={() => navigate(`/projetos`)}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
          >
            Voltar para projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-4 text-white sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232329] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/10 bg-[#26262b] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <button
                  onClick={() => navigate(`/projetos/${projeto!.id}`)}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Voltar
                </button>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {projeto.nome}
                </h1>
                {projeto.codigo && (
                  <p className="mt-1 text-sm text-slate-500">Código: {projeto.codigo}</p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  Responsável: {nomeResponsavel}
                </p>
              </div>

              {podeGerenciarTodasTarefas && (
                <button
                  onClick={() => setModalTarefaAberto(true)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#3e3e3e] px-4 text-sm font-semibold text-white transition hover:bg-[#4a4a4a]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Nova Tarefa
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232329] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
          <DragDropTarefas
            key={refreshKey}
            projetoId={Number(projeto.id)}
            onAbrirModalItem={podeGerenciarTodasTarefas ? abrirModalItem : undefined}
            refreshKey={refreshKey}
          />
        </section>

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
