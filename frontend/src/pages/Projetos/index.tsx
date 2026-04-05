import { useEffect, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";
import { useNavigate } from "react-router-dom";

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

  const carregarProjetos = async () => {
    try {
      setLoading(true);
      const resposta = await fetch("http://localhost:8084/projetos");
      const dados = await resposta.json();
      setProjetos(dados);
    } catch (erro) {
      console.error("Erro ao buscar projeto ", erro);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  const projetosFiltrados = projetos.filter((projeto) => {
    const termo = busca.toLowerCase();

    return (
      projeto.nome?.toLowerCase().includes(termo) ||
      projeto.codigo?.toLowerCase().includes(termo) ||
      projeto.responsavelId?.toString().includes(termo)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Projetos
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar projeto..."
              className="bg-[#2a2a2c] text-white pl-3 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          <button
            onClick={() => setModalAberto(true)}
            className="bg-gradient-to-b from-[#6627cc] to-[#4a1898] hover:brightness-110 hover:scale-[1.03] cursor-pointer text-white px-4 py-2 rounded-lg font-medium shadow-lg transition"
          >
            + Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#2a2a2c] rounded-2xl p-4 animate-pulse"
            >
              <div className="h-6 bg-mist-950 animate-pulse rounded mb-3"></div>
              <div className="h-4 bg-mist-950 animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-mist-950 animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-mist-950 animate-pulse rounded"></div>
            </div>
          ))}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="col-span-full text-center text-slate-400 mt-10">
            Nenhum projeto encontrado
          </div>
        )}

        {!loading &&
          projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() =>
                navigate(`/projetos/${projeto.id}/apontamento`)
              }
              className="
                bg-[#2a2a2c]
                hover:bg-gradient-to-b from-[#6627cc] to-[#4a1898]
                border border-transparent
                hover:border-[#6627cc]
                text-white
                rounded-2xl
                p-4
                transition
                cursor-pointer
                shadow-md
                hover:shadow-xl
                hover:scale-[1.03]
              "
            >
              <h2 className="text-lg font-semibold mb-2">
                {projeto.nome}
              </h2>

              <div className="space-y-1 text-sm text-slate-300">
                <p>
                  <span className="text-slate-400">Código:</span>{" "}
                  {projeto.codigo}
                </p>

                <p>
                  <span className="text-slate-400">Tipo:</span>{" "}
                  {projeto.tipoProjeto}
                </p>

                <p>
                  <span className="text-slate-400">Início:</span>{" "}
                  {new Date(
                    projeto.dataInicio
                  ).toLocaleDateString("pt-BR")}
                </p>

                <p>
                  <span className="text-slate-400">
                    Responsável:
                  </span>{" "}
                  {projeto.responsavelId}
                </p>
              </div>
            </div>
          ))}
      </div>

      {modalAberto && (
        <ModalCadastro
          fecharModal={() => {
            setModalAberto(false);
            carregarProjetos();
          }}
        />
      )}
    </div>
  );
}

export default Projetos;