import { useEffect, useMemo, useState } from "react";
import {
  cadastrarProfissional,
  listarProjetos,
  type ProjetoDisponivel,
  type ProjetoVinculoPayload,
} from "../../services/profissionaisApi";

const CARGOS = [
  { id: 1, nome: "Desenvolvedor" },
  { id: 2, nome: "Gerente" },
  { id: 3, nome: "Financeiro" },
];

function CadastroProfissional() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaHash, setSenhaHash] = useState("");
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
      setMensagem("");

      try {
        const projetos = await listarProjetos();
        setProjetosDisponiveis(projetos);
      } catch (error) {
        const mensagemErro =
          error instanceof Error ? error.message : "Nao foi possivel carregar os projetos.";
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
    setMensagem("");

    if (!nome || !email || !senhaHash || !cargoId) {
      setMensagem("Preencha os campos obrigatorios.");
      return;
    }

    const cargoIdNumero = Number(cargoId);
    if (!Number.isInteger(cargoIdNumero) || cargoIdNumero <= 0) {
      setMensagem("Informe um cargo valido.");
      return;
    }

    const projetosPayload: ProjetoVinculoPayload[] = Object.entries(projetosSelecionados).map(
      ([projetoId, valorHora]) => ({
        projetoId: Number(projetoId),
        valorHora: Number(valorHora),
      })
    );

    const projetoComValorInvalido = projetosPayload.find(
      (projeto) => Number.isNaN(projeto.valorHora) || projeto.valorHora < 0
    );

    if (projetoComValorInvalido) {
      setMensagem("Valor hora invalido em um dos projetos selecionados.");
      return;
    }

    const payload = {
      nome,
      email,
      senhaHash,
      ativo,
      cargoId: cargoIdNumero,
      projetos: projetosPayload,
    };

    try {
      setSalvando(true);
      const resposta = await cadastrarProfissional(payload);
      const quantidadeProjetos = resposta.projetos?.length ?? 0;
      setMensagem(`Profissional cadastrado com sucesso. Projetos vinculados: ${quantidadeProjetos}.`);
      limparFormulario();
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : "Erro ao cadastrar profissional.";
      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        Cadastro de Profissional
      </h1>

      <div className="bg-[#252525] p-8 rounded-xl shadow-md">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {mensagem && (
            <div className="rounded-lg bg-gray-700 border border-gray-600 p-3 text-sm">
              {mensagem}
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Senha *</label>
            <input
              type="password"
              value={senhaHash}
              onChange={(e) => setSenhaHash(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Cargo *</label>
            <select
              value={cargoId}
              onChange={(e) => setCargoId(e.target.value)}
              className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
            >
              <option value="">Selecione um cargo</option>
              {CARGOS.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Profissional ativo
          </label>

          <div>
            <label className="text-sm text-gray-300">
              Projetos vinculados (opcional)
            </label>

            <input
              type="text"
              placeholder="Buscar projeto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg bg-[#3e3e3e] border border-[#3e3e3e] outline-none text-white"
            />

            <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
              {carregandoProjetos && (
                <p className="text-sm text-gray-300">Carregando projetos...</p>
              )}

              {!carregandoProjetos && projetosFiltrados.length === 0 && (
                <p className="text-sm text-gray-300">Nenhum projeto encontrado.</p>
              )}

              {projetosFiltrados.map((projeto) => {
                const selecionado = projetosSelecionados[projeto.id] !== undefined;

                return (
                  <div key={projeto.id} className="bg-gray-700 p-2 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selecionado}
                        onChange={() => toggleProjeto(projeto.id)}
                      />
                      <span>{projeto.nome} ({projeto.codigo})</span>
                    </label>

                    {selecionado && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={projetosSelecionados[projeto.id]}
                        onChange={(e) => atualizarValorHoraProjeto(projeto.id, e.target.value)}
                        className="w-full mt-2 p-2 rounded-lg bg-gray-800 border border-gray-600 outline-none"
                        placeholder="Valor/hora"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg font-semibold disabled:opacity-60"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Cadastrar"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CadastroProfissional;