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

function AssociacaoProfissionalProjeto() {
  const [profissionais, setProfissionais] = useState<ProfissionalResposta[]>([]);
  const [projetos, setProjetos] = useState<ProjetoDisponivel[]>([]);

  const [profissionalId, setProfissionalId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [valorHora, setValorHora] = useState("");

  const [projetosVinculados, setProjetosVinculados] = useState<ProjetoVinculadoResposta[]>([]);

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
          error instanceof Error ? error.message : "Nao foi possivel carregar os dados da tela.";
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
          error instanceof Error ? error.message : "Nao foi possivel carregar os vinculos.";
        setMensagem(mensagemErro);
      }
    };

    void carregarVinculos();
  }, [profissionalId]);

  const projetosDisponiveisParaVinculo = useMemo(() => {
    const idsJaVinculados = new Set(projetosVinculados.map((projeto) => projeto.projetoId));
    return projetos.filter((projeto) => !idsJaVinculados.has(projeto.id));
  }, [projetos, projetosVinculados]);

  const handleSelecionarProjeto = (novoProjetoId: string) => {
    setProjetoId(novoProjetoId);

    if (!novoProjetoId) {
      setValorHora("");
      return;
    }

    const projetoSelecionado = projetos.find((projeto) => projeto.id === Number(novoProjetoId));
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
      setMensagem("Informe um valor/hora valido.");
      return;
    }

    try {
      setSalvando(true);
      await vincularProjetoAoProfissional(
        Number(profissionalId),
        Number(projetoId),
        valorHoraNumero
      );

      const vinculosAtualizados = await listarProjetosVinculados(Number(profissionalId));
      setProjetosVinculados(vinculosAtualizados);
      setProjetoId("");
      setValorHora("");
      setMensagem("Projeto associado com sucesso.");
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : "Erro ao associar projeto ao profissional.";
      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  const profissionalSelecionado = profissionais.find(
    (profissional) => profissional.id === Number(profissionalId)
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Associacao Profissional / Projeto</h1>

      <div className="bg-gray-800 p-8 rounded-xl shadow-md">
        {mensagem && (
          <div className="mb-6 rounded-lg bg-gray-700 border border-gray-600 p-3 text-sm">{mensagem}</div>
        )}

        {carregando ? (
          <p className="text-gray-300">Carregando dados...</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Profissional *</label>
              <select
                value={profissionalId}
                onChange={(event) => {
                  setProfissionalId(event.target.value);
                  setProjetoId("");
                  setValorHora("");
                }}
                className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map((profissional) => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome} ({profissional.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Projeto *</label>
              <select
                value={projetoId}
                onChange={(event) => handleSelecionarProjeto(event.target.value)}
                className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
                disabled={!profissionalId}
              >
                <option value="">Selecione um projeto</option>
                {projetosDisponiveisParaVinculo.map((projeto) => (
                  <option key={projeto.id} value={projeto.id}>
                    {projeto.nome} ({projeto.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Valor por hora *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorHora}
                onChange={(event) => setValorHora(event.target.value)}
                className="w-full mt-2 p-4 rounded-lg bg-gray-700 border border-gray-600 outline-none"
                placeholder="Ex: 120"
                disabled={!projetoId}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <p className="text-sm text-gray-300">
                {profissionalSelecionado
                  ? `Profissional selecionado: ${profissionalSelecionado.nome}`
                  : "Selecione um profissional para ver os vinculos."}
              </p>

              <button
                className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg font-semibold disabled:opacity-60"
                disabled={salvando || !profissionalId || !projetoId}
                type="submit"
              >
                {salvando ? "Associando..." : "Associar projeto"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-gray-800 p-8 rounded-xl shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Projetos vinculados</h2>

        {!profissionalId && <p className="text-gray-300">Selecione um profissional para consultar.</p>}

        {profissionalId && projetosVinculados.length === 0 && (
          <p className="text-gray-300">Este profissional ainda nao possui projetos vinculados.</p>
        )}

        <div className="space-y-3">
          {projetosVinculados.map((projeto) => (
            <div
              key={projeto.projetoId}
              className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{projeto.nomeProjeto}</p>
                <p className="text-sm text-gray-300">Codigo: {projeto.codigoProjeto}</p>
              </div>
              <p className="text-sm text-gray-200">Valor/hora: R$ {projeto.valorHora.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssociacaoProfissionalProjeto;
