import { useEffect, useMemo, useState } from "react";
import {
  cadastrarProfissional,
  listarProjetos,
  type ProjetoDisponivel,
  type ProjetoVinculoPayload,
} from "../../services/profissionaisApi";

import { ChevronDown, Eye, EyeOff, Search } from "lucide-react";

const CARGOS = [
  { id: 1, nome: "Desenvolvedor" },
  { id: 2, nome: "Gerente" },
  { id: 3, nome: "Financeiro" },
];

function CadastroProfissional() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaHash, setSenhaHash] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [cargoId, setCargoId] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [busca, setBusca] = useState("");
  const [projetosDisponiveis, setProjetosDisponiveis] = useState<ProjetoDisponivel[]>([]);
  const [projetosSelecionados, setProjetosSelecionados] = useState<Record<number, string>>({});
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const carregarProjetos = async () => {
      setCarregandoProjetos(true);

      try {
        const projetos = await listarProjetos();
        setProjetosDisponiveis(projetos);
      } catch (error) {
        const mensagemErro =
          error instanceof Error ? error.message : "Erro ao carregar projetos.";
        setMensagem(mensagemErro);
      } finally {
        setCarregandoProjetos(false);
      }
    };

    void carregarProjetos();
  }, []);

  const projetosFiltrados = useMemo(
    () =>
      projetosDisponiveis.filter((projeto) =>
        `${projeto.nome} ${projeto.codigo}`.toLowerCase().includes(busca.toLowerCase())
      ),
    [busca, projetosDisponiveis]
  );

  const toggleProjeto = (id: number) => {
    if (projetosSelecionados[id] !== undefined) {
      const copia = { ...projetosSelecionados };
      delete copia[id];
      setProjetosSelecionados(copia);
    } else {
      const projeto = projetosDisponiveis.find((item) => item.id === id);
      setProjetosSelecionados({
        ...projetosSelecionados,
        [id]: projeto?.valorHoraBase?.toString() || "0",
      });
    }
  };

  const atualizarValorHoraProjeto = (projetoId: number, valor: string) => {
    setProjetosSelecionados({
      ...projetosSelecionados,
      [projetoId]: valor,
    });
  };

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setSenhaHash("");
    setCargoId("");
    setAtivo(true);
    setBusca("");
    setProjetosSelecionados({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senhaHash || !cargoId) {
      setMensagem("Preencha os campos obrigatórios.");
      return;
    }

    const projetosPayload: ProjetoVinculoPayload[] = Object.entries(
      projetosSelecionados
    ).map(([projetoId, valorHora]) => ({
      projetoId: Number(projetoId),
      valorHora: Number(valorHora),
    }));

    try {
      setSalvando(true);

      const resposta = await cadastrarProfissional({
        nome,
        email,
        senhaHash,
        ativo,
        cargoId: Number(cargoId),
        projetos: projetosPayload,
      });

      const quantidade = resposta.projetos?.length ?? 0;

      setMensagem(`Profissional cadastrado. Projetos vinculados: ${quantidade}`);
      limparFormulario();
    } catch (error) {
      setMensagem("Erro ao cadastrar profissional.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">

      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-semibold">
            Cadastro de Profissional
          </h1>
          <p className="text-sm text-gray-400">
            Cadastre um profissional e vincule projetos
          </p>
        </div>

        <div className="bg-[#18181c] border border-white/5 p-8 rounded-2xl shadow-2xl">

          {mensagem && (
            <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm">
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[#111116] border border-white/5 outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[#111116] border border-white/5 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Senha</label>

              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senhaHash}
                  onChange={(e) => setSenhaHash(e.target.value)}
                  className="w-full mt-2 px-4 py-3 pr-12 rounded-xl bg-[#111116] border border-white/5 outline-none focus:border-purple-500"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-[60%] -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Cargo</label>

              <div className="relative">
                <select
                  value={cargoId}
                  onChange={(e) => setCargoId(e.target.value)}
                  className="w-full mt-2 px-4 py-3 pr-10 rounded-xl bg-[#111116] border border-white/5 outline-none appearance-none focus:border-purple-500"
                >
                  <option value="">Selecione um cargo</option>

                  {CARGOS.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 text-gray-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              Profissional ativo
            </label>

            <div>
              <label className="text-sm text-gray-400">
                Projetos vinculados
              </label>

              <div className="relative mt-2">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  placeholder="Buscar projeto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#111116] border border-white/5 outline-none focus:border-purple-500"
                />
              </div>

              <div className="max-h-72 overflow-y-auto mt-3 space-y-2">

                {projetosFiltrados.map((projeto) => {
                  const selecionado =
                    projetosSelecionados[projeto.id] !== undefined;

                  return (
                    <div
                      key={projeto.id}
                      className="bg-[#111116] border border-white/5 p-3 rounded-xl hover:border-purple-500/30 transition"
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => toggleProjeto(projeto.id)}
                        />

                        <div>
                          <p className="text-sm">
                            {projeto.nome}
                          </p>

                          <p className="text-xs text-gray-500">
                            {projeto.codigo}
                          </p>
                        </div>
                      </label>

                      {selecionado && (
                        <>
                          <p className={`mt-2`}>Valor da hora:</p>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={projetosSelecionados[projeto.id]}
                            onChange={(e) =>
                              atualizarValorHoraProjeto(
                                projeto.id,
                                e.target.value
                              )
                            }
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/5 outline-none focus:border-purple-500 text-sm"
                            placeholder="Valor por hora"
                          />
                      </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              disabled={salvando}
              className="
                w-full
                h-12
                rounded-xl
                bg-gradient-to-b
                from-[#6627cc]
                to-[#4a1898]
                font-medium
                shadow-lg
                hover:brightness-110
                transition
                disabled:opacity-50
              "
            >
              {salvando ? "Salvando..." : "Cadastrar profissional"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CadastroProfissional;