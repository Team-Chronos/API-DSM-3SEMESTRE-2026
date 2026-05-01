import { useEffect, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";
import { useNavigate } from "react-router-dom";
import { projetoService, profissionaisService } from "../../services/gateway";
import profissionalService from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";
import { toastError } from "../../utils/toastUtils";

interface Projeto {
  id: number;
  nome: string;
  codigo: string;
  tipoProjeto: string;
  valorHoraBase: number;
  horasContratadas: number;
  dataInicio: string;
  dataFim: string;
  responsavelId: number;
}

interface Profissional {
  id: number;
  nome: string;
}

function Projetos() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const podeGerenciarProjetos =
    roles.includes("ROLE_FINANCE") || roles.includes("ROLE_GERENTE_PROJETO");

  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [profissionais, setProfissionais] = useState<Map<number, string>>(
    new Map(),
  );
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const [resProjetos, resProfissionais] = await Promise.all([
        projetoService.listar(),
        profissionaisService.listar(),
      ]);

      if (!resProjetos.ok) {
        throw new Error(`Erro ao carregar projetos: ${resProjetos.status}`);
      }

      if (!resProfissionais.ok) {
        throw new Error(
          `Erro ao carregar profissionais: ${resProfissionais.status}`,
        );
      }

      const dadosProjetos = await resProjetos.json();
      const dadosProfissionais = await resProfissionais.json();

      let projetosPermitidos = dadosProjetos;

      if (!podeGerenciarProjetos && user?.id) {
        const vinculos = await profissionalService.listarProjetosVinculados(
          user.id,
        );

        const idsProjetos = new Set(
          vinculos
            .map((v: any) => Number(v.projetoId ?? v.id))
            .filter((id: number) => !Number.isNaN(id)),
        );

        projetosPermitidos = dadosProjetos.filter((projeto: Projeto) =>
          idsProjetos.has(Number(projeto.id)),
        );
      }

      setProjetos(projetosPermitidos);
      setProfissionais(
        new Map(dadosProfissionais.map((p: Profissional) => [p.id, p.nome])),
      );
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro(err instanceof Error ? err.message : "Falha ao carregar dados");
      toastError("Erro ao carregar projetos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      carregarDados();
    }
  }, [user?.id, podeGerenciarProjetos]);

  const projetosFiltrados = projetos.filter((projeto) => {
    const termo = busca.toLowerCase();
    const nomeResp = profissionais.get(projeto.responsavelId) ?? "";

    return (
      projeto.nome?.toLowerCase().includes(termo) ||
      projeto.codigo?.toLowerCase().includes(termo) ||
      nomeResp.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Projetos</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-64 rounded-lg bg-[#2a2a2c] px-3 py-2 text-white"
          />

          {podeGerenciarProjetos && (
            <button
              onClick={() => setModalAberto(true)}
              className="rounded-lg bg-linear-to-b from-[#6627cc] to-[#4a1898] px-4 py-2 text-white"
            >
              + Novo
            </button>
          )}
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-950 text-red-200 rounded">{erro}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading &&
          Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-[#2a2a2c] p-4 rounded-2xl animate-pulse h-32"
              />
            ))}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="col-span-full text-center text-slate-400">
            Nenhum projeto
          </div>
        )}

        {!loading &&
          projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() => navigate(`/projetos/${projeto.id}`)}
              className="cursor-pointer rounded-2xl bg-[#2a2a2c] p-4 text-white transition hover:scale-[1.02] hover:border-purple-500"
            >
              <h2 className="text-lg font-semibold">{projeto.nome}</h2>
              <p>Código: {projeto.codigo}</p>
              <p>Tipo: {projeto.tipoProjeto}</p>
              <p>
                Responsável: {profissionais.get(projeto.responsavelId) ?? "N/D"}
              </p>
            </div>
          ))}
      </div>

      <ModalCadastro
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onProjetoCadastrado={() => {
          setModalAberto(false);
          carregarDados();
        }}
      />
    </div>
  );
}

export default Projetos;