import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import projetoService from "../../types/projetoService";
import type { Projeto1 } from "../../types/projetoService";
import profissionalService from "../../types/profissionalService";
import type { Profissional } from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";
import { toastError } from "../../utils/toastUtils";

export default function TelaProjetos() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const podeGerenciarProjetos =
    roles.includes("ROLE_FINANCE") || roles.includes("ROLE_GERENTE_PROJETO");
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto1[]>([]);
  const [responsaveis, setResponsaveis] = useState<Map<number, string>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      carregarDados();
    }
  }, [user?.id, podeGerenciarProjetos]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projetosLista, responsaveisLista, projetosVinculados] =
        await Promise.all([
          projetoService.listarTodos(),
          profissionalService.listarTodos(),
          !podeGerenciarProjetos && user?.id
            ? profissionalService.listarProjetosVinculados(user.id)
            : Promise.resolve([]),
        ]);

      let projetosPermitidos = projetosLista;

      if (!podeGerenciarProjetos) {
        const idsProjetos = new Set(
          projetosVinculados
            .map((v: any) => Number(v.projetoId ?? v.id))
            .filter((id: number) => !Number.isNaN(id)),
        );

        projetosPermitidos = projetosLista.filter((projeto) =>
          idsProjetos.has(Number(projeto.id)),
        );
      }

      setProjetos(projetosPermitidos);

      const mapaResponsaveis = new Map<number, string>();
      responsaveisLista.forEach((resp: Profissional) => {
        mapaResponsaveis.set(resp.id, resp.nome);
      });
      setResponsaveis(mapaResponsaveis);
    } catch (err) {
      toastError("Erro ao carregar projetos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjetoClick = (projetoId: number) => {
    navigate(`/projetos/${projetoId}/tarefas`);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ATIVO":
        return "bg-green-500";
      case "PAUSADO":
        return "bg-yellow-500";
      case "CONCLUIDO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#1f1f1f] p-6"
        style={{ backgroundColor: "#1f1f1f" }}
      >
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1f1f1f] p-4 text-white sm:p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            <strong>Erro:</strong> {error}
          </div>
          <button
            onClick={carregarDados}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-4 text-white sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="relative border-b border-white/10 bg-linear-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-24 h-40 w-40 rounded-full bg-purple-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {podeGerenciarProjetos ? "Gestão" : "Meus vínculos"}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {podeGerenciarProjetos ? "Projetos" : "Meus projetos"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                  Selecione um projeto para gerenciar suas tarefas.
                </p>
              </div>

              {podeGerenciarProjetos && (
                <button
                  onClick={() => navigate("/projetos/novo")}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Novo projeto
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Listagem
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {projetos.length} projeto(s) disponível(is)
              </p>
            </div>

            <button
              onClick={carregarDados}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Atualizar lista
            </button>
          </div>
        </section>

        {projetos.length === 0 ? (
          <div className="rounded-[22px] border border-white/10 bg-[#232329] p-8 text-center shadow-lg shadow-black/10">
            <div className="text-lg text-slate-300">Nenhum projeto encontrado</div>
            {podeGerenciarProjetos && (
              <button
                onClick={() => navigate("/projetos/novo")}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-[#6627cc] px-5 text-sm font-semibold text-white transition hover:bg-[#7634dd]"
              >
                Criar primeiro projeto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                onClick={() => handleProjetoClick(projeto.id)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-[#25252c] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#2a2a31] hover:shadow-xl"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {projeto.nome}
                    </h3>
                    {projeto.codigo && (
                      <p className="mt-1 text-sm text-slate-500">
                        Código: {projeto.codigo}
                      </p>
                    )}
                  </div>
                  <div
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${getStatusColor(projeto.status)}`}
                  />
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-slate-400">
                  {projeto.descricao || "Sem descrição disponível."}
                </p>

                <div className="grid gap-3 text-xs sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="min-w-0 truncate">
                      {projeto.responsavelId
                        ? responsaveis.get(projeto.responsavelId) ||
                          `ID: ${projeto.responsavelId}`
                        : "Sem responsável"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {projeto.dataCriacao
                        ? new Date(projeto.dataCriacao).toLocaleDateString("pt-BR")
                        : "Sem data"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-400">
                    Ver tarefas
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
