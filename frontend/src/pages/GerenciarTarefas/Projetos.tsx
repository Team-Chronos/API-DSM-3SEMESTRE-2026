import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import projetoService from "../../types/projetoService";
import type { Projeto1 } from "../../types/projetoService";
import profissionalService from "../../types/profissionalService";
import type { Profissional } from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";

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
      console.error("Erro ao carregar projetos:", err);
      setError("Não foi possível carregar os projetos.");
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
        className="min-h-screen flex items-center justify-center"
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
      <div className="min-h-screen p-6" style={{ backgroundColor: "#1f1f1f" }}>
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <strong>Erro:</strong> {error}
        </div>
        <button
          onClick={carregarDados}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1f1f1f" }}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Projetos</h1>
          <p className="text-gray-400 mt-1">
            Selecione um projeto para gerenciar suas tarefas
          </p>
        </div>

        {projetos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Nenhum projeto encontrado
            </div>
            {podeGerenciarProjetos && (
              <button
                onClick={() => navigate("/projetos/novo")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Criar primeiro projeto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                onClick={() => handleProjetoClick(projeto.id)}
                className="rounded-lg p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{
                  backgroundColor: "#252525",
                  border: "1px solid #3e3e3e",
                  cursor: "pointer",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {projeto.nome}
                    </h3>
                    {projeto.codigo && (
                      <p className="text-gray-500 text-sm">
                        Código: {projeto.codigo}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(projeto.status)}`}
                  ></div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {projeto.descricao || "Sem descrição disponível."}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    <span>
                      {projeto.responsavelId
                        ? responsaveis.get(projeto.responsavelId) ||
                          `ID: ${projeto.responsavelId}`
                        : "Sem responsável"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
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
                        ? new Date(projeto.dataCriacao).toLocaleDateString(
                            "pt-BR",
                          )
                        : "Sem data"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#3e3e3e] flex justify-end">
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    Ver tarefas
                    <svg
                      className="w-3 h-3"
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
