import { useEffect, useMemo, useState } from "react";
import {
  listarProfissionais,
  listarProjetos,
  listarProjetosVinculados,
  vincularProjetoAoProfissional,
  type ProfissionalResposta,
  type ProjetoDisponivel,
  type ProjetoVinculadoResposta,
} from "../../../services/profissionais/profissionaisApi";
import { BriefcaseBusiness, ChevronDown, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import SearchInput from "../../../components/ui/Search";

function AssociacaoProfissionalProjeto() {
  const [profissionais, setProfissionais] = useState<ProfissionalResposta[]>([]);
  const [projetos, setProjetos] = useState<ProjetoDisponivel[]>([]);

  const [profissionalId, setProfissionalId] = useState("");
  const [projetoId, setProjetoId] = useState("");
  const [valorHora, setValorHora] = useState("");
  const [buscaVinculo, setBuscaVinculo] = useState("");

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

  const profissionalSelecionado = profissionais.find(
    (profissional) => profissional.id === Number(profissionalId)
  );

  const projetosDisponiveisParaVinculo = useMemo(() => {
    const idsJaVinculados = new Set(
      projetosVinculados.map((projeto) => projeto.projetoId)
    );

    return projetos.filter((projeto) => !idsJaVinculados.has(projeto.id));
  }, [projetos, projetosVinculados]);

  const projetosVinculadosFiltrados = useMemo(() => {
    const termo = buscaVinculo.trim().toLowerCase();

    if (!termo) {
      return projetosVinculados;
    }

    return projetosVinculados.filter((projeto) =>
      `${projeto.nomeProjeto} ${projeto.codigoProjeto}`
        .toLowerCase()
        .includes(termo)
    );
  }, [buscaVinculo, projetosVinculados]);

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

      await toast.promise(
        vincularProjetoAoProfissional(
          Number(profissionalId),
          Number(projetoId),
          valorHoraNumero
        ),
        {
          pending: "Realizando associação",
          success: "Associado com sucesso!",
          error: "Erro ao realizar associação",
        }
      );

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

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Associação Profissional / Projeto
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Vincule profissionais aos projetos e defina um valor por hora para cada associação.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#232329] px-4 py-3 shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6627cc] to-[#4a1898] shadow-lg shadow-purple-900/30">
              <BriefcaseBusiness size={20} className="text-white" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Resumo
              </p>
              <p className="text-sm font-medium text-white">
                {projetosVinculados.length} vínculo(s) do profissional selecionado
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="relative border-b border-white/8 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#4a1898] px-6 py-6 sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/15" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Nova associação
                </h2>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  Escolha um profissional, selecione um projeto disponível e ajuste o valor da hora.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
                  {profissionais.length} profissional(is)
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
                  {projetosDisponiveisParaVinculo.length} projeto(s) disponível(is)
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            {mensagem && (
              <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-4 text-sm text-purple-100">
                {mensagem}
              </div>
            )}

            {carregando ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 animate-pulse rounded-2xl border border-white/8 bg-[#1b1b1f] p-6">
                  <div className="h-5 w-40 rounded bg-white/10" />
                  <div className="mt-6 h-12 rounded-xl bg-white/10" />
                  <div className="mt-4 h-12 rounded-xl bg-white/10" />
                  <div className="mt-4 h-12 rounded-xl bg-white/10" />
                </div>
                <div className="lg:col-span-5 animate-pulse rounded-2xl border border-white/8 bg-[#1b1b1f] p-6">
                  <div className="h-5 w-36 rounded bg-white/10" />
                  <div className="mt-6 h-12 rounded-xl bg-white/10" />
                  <div className="mt-4 h-24 rounded-2xl bg-white/10" />
                  <div className="mt-4 h-24 rounded-2xl bg-white/10" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="rounded-2xl border border-white/8 p-5 shadow-inner shadow-black/20">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                          <UserPlus size={18} className="text-white/85" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Dados da associação</h3>
                          <p className="text-sm text-slate-400">
                            Selecione quem vai atuar, em qual projeto e o valor/hora aplicado.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Profissional
                          </label>

                          <div className="relative">
                            <select
                              value={profissionalId}
                              onChange={(event) => {
                                setProfissionalId(event.target.value);
                                setProjetoId("");
                                setValorHora("");
                                setBuscaVinculo("");
                              }}
                              className="w-full appearance-none rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 pr-10 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
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
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Projeto
                          </label>

                          <div className="relative">
                            <select
                              value={projetoId}
                              onChange={(event) => handleSelecionarProjeto(event.target.value)}
                              disabled={!profissionalId}
                              className="w-full appearance-none rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 pr-10 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
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
                            className="w-full rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">
                            {profissionalSelecionado
                              ? `Selecionado: ${profissionalSelecionado.nome}`
                              : "Selecione um profissional"}
                          </p>
                          <p className="text-sm text-slate-400">
                            {profissionalSelecionado
                              ? `Email: ${profissionalSelecionado.email}`
                              : "O valor/hora pode começar com a base do projeto e ser ajustado antes de salvar."}
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={salvando || !profissionalId || !projetoId}
                          className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#6627cc] to-[#4a1898] px-6 font-medium text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {salvando ? "Associando..." : "Associar projeto"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-2xl border border-white/8 p-5 shadow-inner shadow-black/20">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                        <BriefcaseBusiness size={18} className="text-white/85" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Projetos vinculados</h3>
                        <p className="text-sm text-slate-400">
                          Consulte os vínculos atuais do profissional selecionado.
                        </p>
                      </div>
                    </div>

                    <SearchInput
                      value={buscaVinculo}
                      onChange={setBuscaVinculo}
                      placeholder="Buscar vínculo por nome ou código..."
                    />

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                      <span className="text-slate-400">Vínculos listados</span>
                      <span className="font-medium text-white">
                        {profissionalId ? projetosVinculadosFiltrados.length : 0}
                      </span>
                    </div>

                    {!profissionalId && (
                      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#1b1b1f] px-4 py-8 text-center text-sm text-slate-400">
                        Selecione um profissional para consultar os projetos já vinculados.
                      </div>
                    )}

                    {profissionalId && projetosVinculados.length === 0 && (
                      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#1b1b1f] px-4 py-8 text-center text-sm text-slate-400">
                        Este profissional ainda não possui projetos vinculados.
                      </div>
                    )}

                    {profissionalId && projetosVinculados.length > 0 && (
                      <div className="mt-4 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                        {projetosVinculadosFiltrados.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-[#1b1b1f] px-4 py-8 text-center text-sm text-slate-400">
                            Nenhum vínculo encontrado para a busca informada.
                          </div>
                        )}

                        {projetosVinculadosFiltrados.map((projeto) => (
                          <div
                            key={projeto.projetoId}
                            className="rounded-2xl border border-white/8 bg-[#1b1b1f] p-4 transition hover:border-white/15"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  {projeto.nomeProjeto}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {projeto.codigoProjeto}
                                </p>
                              </div>

                              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                                R$ {projeto.valorHora.toFixed(2)}/h
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssociacaoProfissionalProjeto;
