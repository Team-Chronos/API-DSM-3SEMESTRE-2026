import { useEffect, useMemo, useState } from "react";
import {
  listarProfissionais,
  listarProjetos,
  listarProjetosVinculados,
  vincularProjetoAoProfissional,
  type ProfissionalResposta,
  type ProjetoDisponivel,
  type ProjetoVinculadoResposta,
} from "../../services/profissionaisApi";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";

function AssociacaoProfissionalProjeto() {
  const [profissionais, setProfissionais] = useState<ProfissionalResposta[]>([]);
  const [projetos, setProjetos] = useState<ProjetoDisponivel[]>([]);

  const [profissionalId, setProfissionalId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [valorHora, setValorHora] = useState("");

  const [projetosVinculados, setProjetosVinculados] =
    useState<ProjetoVinculadoResposta[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setCarregando(true);
      setMensagem("");

      try {
        const [listaProfissionais, listaProjetos] = await Promise.all([
          listarProfissionais(),
          listarProjetos(),
        ]);

        setProfissionais(listaProfissionais);
        setProjetos(listaProjetos);
      } catch (error) {
        const mensagemErro =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados da tela.";
        setMensagem(mensagemErro);
      } finally {
        setCarregando(false);
      }
    };

    void carregarDadosIniciais();
  }, []);

  useEffect(() => {
    const carregarVinculos = async () => {
      if (!profissionalId) {
        setProjetosVinculados([]);
        return;
      }

      try {
        const vinculos = await listarProjetosVinculados(Number(profissionalId));
        setProjetosVinculados(vinculos);
      } catch (error) {
        const mensagemErro =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os vínculos.";
        setMensagem(mensagemErro);
      }
    };

    void carregarVinculos();
  }, [profissionalId]);

  const projetosDisponiveisParaVinculo = useMemo(() => {
    const idsJaVinculados = new Set(
      projetosVinculados.map((projeto) => projeto.projetoId)
    );
    return projetos.filter((projeto) => !idsJaVinculados.has(projeto.id));
  }, [projetos, projetosVinculados]);

  const handleSelecionarProjeto = (novoProjetoId: string) => {
    setProjetoId(novoProjetoId);

    if (!novoProjetoId) {
      setValorHora("");
      return;
    }

    const projetoSelecionado = projetos.find(
      (projeto) => projeto.id === Number(novoProjetoId)
    );

    setValorHora(projetoSelecionado?.valorHoraBase?.toString() || "0");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMensagem("");

    if (!profissionalId || !projetoId) {
      setMensagem("Selecione um profissional e um projeto.");
      return;
    }

    const valorHoraNumero = Number(valorHora);

    if (Number.isNaN(valorHoraNumero) || valorHoraNumero < 0) {
      setMensagem("Informe um valor/hora válido.");
      return;
    }

    try {
      setSalvando(true);

      await toast.promise(vincularProjetoAoProfissional(
        Number(profissionalId),
        Number(projetoId),
        valorHoraNumero
      ),
      {
        pending: "Realizando associação",
        success: "Associado com sucesso!",
        error: "Erro ao realizar associação"
      }) 

      const vinculosAtualizados = await listarProjetosVinculados(
        Number(profissionalId)
      );

      setProjetosVinculados(vinculosAtualizados);
      setProjetoId("");
      setValorHora("");
      setMensagem("Projeto associado com sucesso.");
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Erro ao associar projeto ao profissional.";

      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  const profissionalSelecionado = profissionais.find(
    (profissional) => profissional.id === Number(profissionalId)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white pt-4">
      
      <div>
        <h1 className="text-2xl font-semibold">
          Associação Profissional / Projeto
        </h1>
        <p className="text-sm text-gray-400">
          Vincule profissionais aos projetos e defina o valor por hora
        </p>
      </div>

      <div className="bg-[#232329] border border-white/5 p-8 rounded-2xl shadow-lg">
        
        {mensagem && (
          <div className="mb-6 rounded-xl bg-black/30 border border-white/10 p-4 text-sm">
            {mensagem}
          </div>
        )}

        {carregando ? (
          <div className="animate-pulse h-40 bg-black/20 rounded-xl" />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400">
                Profissional
              </label>

              <div className="relative">
                <select
                  value={profissionalId}
                  onChange={(event) => {
                    setProfissionalId(event.target.value);
                    setProjetoId("");
                    setValorHora("");
                  }}
                  className="
                    w-full
                    mt-2
                    px-4
                    py-3
                    pr-10
                    rounded-xl
                    bg-[#1b1b1f]
                    border border-white/10
                    outline-none
                    focus:border-purple-500
                    transition
                    appearance-none
                  "
                >
                  <option value="">Selecione um profissional</option>

                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome} ({profissional.email})
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Projeto
              </label>

              <div className="relative">
                <select
                  value={projetoId}
                  onChange={(event) =>
                    handleSelecionarProjeto(event.target.value)
                  }
                  disabled={!profissionalId}
                  className="
                    w-full
                    mt-2
                    px-4
                    py-3
                    pr-10
                    rounded-xl
                    bg-[#1b1b1f]
                    border border-white/10
                    outline-none
                    focus:border-purple-500
                    transition
                    disabled:opacity-50
                    appearance-none
                  "
                >
                  <option value="">Selecione um projeto</option>

                  {projetosDisponiveisParaVinculo.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome} ({projeto.codigo})
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-3 top-[60%] -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Valor por hora
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={valorHora}
                onChange={(event) => setValorHora(event.target.value)}
                disabled={!projetoId}
                placeholder="Ex: 120"
                className="
                  w-full
                  mt-2
                  px-4
                  py-3
                  rounded-xl
                  bg-[#1b1b1f]
                  border border-white/10
                  outline-none
                  focus:border-purple-500
                  transition
                  disabled:opacity-50
                "
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <p className="text-sm text-gray-400">
                {profissionalSelecionado
                  ? `Selecionado: ${profissionalSelecionado.nome}`
                  : "Selecione um profissional"}
              </p>

              <button
                type="submit"
                disabled={salvando || !profissionalId || !projetoId}
                className="
                  h-11
                  px-6
                  rounded-xl
                  bg-gradient-to-r
                  from-[#6627cc]
                  to-[#4a1898]
                  font-medium
                  shadow-lg
                  transition
                  hover:brightness-110
                  disabled:opacity-50
                "
              >
                {salvando ? "Associando..." : "Associar projeto"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-[#232329] border border-white/5 p-8 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Projetos vinculados
        </h2>

        {!profissionalId && (
          <p className="text-gray-400">
            Selecione um profissional para consultar
          </p>
        )}

        {profissionalId && projetosVinculados.length === 0 && (
          <p className="text-gray-400">
            Este profissional ainda não possui projetos vinculados
          </p>
        )}

        <div className="space-y-3">
          {projetosVinculados.map((projeto) => (
            <div
              key={projeto.projetoId}
              className="
                rounded-xl
                border border-white/5
                bg-[#1b1b1f]
                p-4
                flex
                items-center
                justify-between
              "
            >
              <div>
                <p className="font-medium">
                  {projeto.nomeProjeto}
                </p>

                <p className="text-sm text-gray-400">
                  Código: {projeto.codigoProjeto}
                </p>
              </div>

              <p className="text-sm font-medium text-purple-400">
                R$ {projeto.valorHora.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssociacaoProfissionalProjeto;