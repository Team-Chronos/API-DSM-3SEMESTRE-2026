import { useEffect, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";
import { useNavigate } from "react-router-dom";
import { projetoService } from "../../services/gateway";

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

function Projetos() {
  const navigate = useNavigate();

  const [modalAberto, setModalAberto] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarProjetos = async () => {
    try {
      setLoading(true);
      setErro(null);
      const resposta = await projetoService.listar();
      const dados = await resposta.json();
      setProjetos(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      console.error("Erro ao buscar projeto ", erro);
      setErro(erro instanceof Error ? erro.message : "Erro ao carregar projetos");
      setProjetos([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  const projetosFiltrados = (projetos || []).filter((projeto) => {
    const termo = busca.toLowerCase();

    return (
      projeto.nome?.toLowerCase().includes(termo) ||
      projeto.codigo?.toLowerCase().includes(termo) ||
      projeto.responsavelId?.toString().includes(termo)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Projetos</h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar projeto..."
              className="w-64 rounded-lg bg-[#2a2a2c] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="cursor-pointer rounded-lg bg-gradient-to-b from-[#6627cc] to-[#4a1898] px-4 py-2 font-medium text-white shadow-lg transition hover:scale-[1.03] hover:brightness-110"
          >
            + Novo
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-950 p-4 text-red-200">
          <strong>Erro:</strong> {erro}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#2a2a2c] p-4 animate-pulse">
              <div className="mb-3 h-6 rounded bg-mist-950 animate-pulse"></div>
              <div className="mb-2 h-4 rounded bg-mist-950 animate-pulse"></div>
              <div className="mb-2 h-4 rounded bg-mist-950 animate-pulse"></div>
              <div className="h-4 rounded bg-mist-950 animate-pulse"></div>
            </div>
          ))}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="col-span-full mt-10 text-center text-slate-400">
            Nenhum projeto encontrado
          </div>
        )}

        {!loading &&
          projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() => navigate(`/projetos/${projeto.id}/apontamento`)}
              className="
                cursor-pointer
                rounded-2xl
                border border-transparent
                bg-[#2a2a2c]
                p-4
                text-white
                shadow-md
                transition
                hover:scale-[1.03]
                hover:border-[#6627cc]
                hover:bg-gradient-to-b
                hover:from-[#6627cc]
                hover:to-[#4a1898]
                hover:shadow-xl
              "
            >
              <h2 className="mb-2 text-lg font-semibold">{projeto.nome}</h2>

              <div className="space-y-1 text-sm text-slate-300">
                <p>
                  <span className="text-slate-400">Código:</span> {projeto.codigo}
                </p>

                <p>
                  <span className="text-slate-400">Tipo:</span> {projeto.tipoProjeto}
                </p>

                <p>
                  <span className="text-slate-400">Início:</span>{" "}
                  {new Date(projeto.dataInicio).toLocaleDateString("pt-BR")}
                </p>

                <p>
                  <span className="text-slate-400">Responsável:</span>{" "}
                  {projeto.responsavelId}
                </p>
              </div>
            </div>
          ))}
      </div>

      <ModalCadastro
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onProjetoCadastrado={() => {
          setModalAberto(false);
          carregarProjetos();
        }}
      />
    </div>
  );
}

export default Projetos;
