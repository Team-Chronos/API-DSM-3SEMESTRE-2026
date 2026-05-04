import { useEffect, useMemo, useRef, useState } from "react";
import {
  listarProfissionais,
  listarProjetos,
  listarProjetosVinculados,
  vincularProjetoAoProfissional,
  desvincularProjetoDoProfissional,
  type ProfissionalResposta,
  type ProjetoDisponivel,
  type ProjetoVinculadoResposta,
} from "../../services/profissionaisApi";
import { BriefcaseBusiness, Search, UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";
import SearchInput from "../../components/ui/Search";

function AssociacaoProfissionalProjeto() {
  const [profissionais, setProfissionais] = useState<ProfissionalResposta[]>([]);
  const [projetos, setProjetos] = useState<ProjetoDisponivel[]>([]);

  const [profissionalId, setProfissionalId] = useState("");
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [dropdownProfissionalAberto, setDropdownProfissionalAberto] = useState(false);

  const [projetoId, setProjetoId] = useState("");
  const [buscaProjeto, setBuscaProjeto] = useState("");
  const [dropdownProjetoAberto, setDropdownProjetoAberto] = useState(false);

  const [valorHora, setValorHora] = useState("");
  const [buscaVinculo, setBuscaVinculo] = useState("");

  const [projetosVinculados, setProjetosVinculados] = useState<ProjetoVinculadoResposta[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [desvinculando, setDesvinculando] = useState<number | null>(null);
  const [confirmandoDesvincular, setConfirmandoDesvincular] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");

  const dropdownProfissionalRef = useRef<HTMLDivElement>(null);
  const dropdownProjetoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (
        dropdownProfissionalRef.current &&
        !dropdownProfissionalRef.current.contains(e.target as Node)
      ) {
        setDropdownProfissionalAberto(false);
        if (!profissionalId) setBuscaProfissional("");
      }
      if (
        dropdownProjetoRef.current &&
        !dropdownProjetoRef.current.contains(e.target as Node)
      ) {
        setDropdownProjetoAberto(false);
        if (!projetoId) setBuscaProjeto("");
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [profissionalId, projetoId]);

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
        setMensagem(
          error instanceof Error ? error.message : "Não foi possível carregar os dados da tela."
        );
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
        setMensagem(
          error instanceof Error ? error.message : "Não foi possível carregar os vínculos."
        );
      }
    };
    void carregarVinculos();
  }, [profissionalId]);

  const profissionalSelecionado = profissionais.find(
    (p) => p.id === Number(profissionalId)
  );

  const profissionaisFiltrados = useMemo(() => {
    const termo = buscaProfissional.trim().toLowerCase();
    if (!termo) return profissionais;
    return profissionais.filter((p) =>
      `${p.nome} ${p.email}`.toLowerCase().includes(termo)
    );
  }, [buscaProfissional, profissionais]);

  const projetosDisponiveisParaVinculo = useMemo(() => {
    const idsJaVinculados = new Set(projetosVinculados.map((p) => p.projetoId));
    return projetos.filter((p) => !idsJaVinculados.has(p.id));
  }, [projetos, projetosVinculados]);

  const projetosFiltrados = useMemo(() => {
    const termo = buscaProjeto.trim().toLowerCase();
    if (!termo) return projetosDisponiveisParaVinculo;
    return projetosDisponiveisParaVinculo.filter((p) =>
      `${p.nome} ${p.codigo}`.toLowerCase().includes(termo)
    );
  }, [buscaProjeto, projetosDisponiveisParaVinculo]);

  const projetosVinculadosFiltrados = useMemo(() => {
    const termo = buscaVinculo.trim().toLowerCase();
    if (!termo) return projetosVinculados;
    return projetosVinculados.filter((p) =>
      `${p.nomeProjeto} ${p.codigoProjeto}`.toLowerCase().includes(termo)
    );
  }, [buscaVinculo, projetosVinculados]);

  const limparProfissional = () => {
    setProfissionalId("");
    setBuscaProfissional("");
    setProjetoId("");
    setBuscaProjeto("");
    setValorHora("");
    setBuscaVinculo("");
    setConfirmandoDesvincular(null);
    setDropdownProfissionalAberto(false);
  };

  const limparProjeto = () => {
    setProjetoId("");
    setBuscaProjeto("");
    setValorHora("");
    setDropdownProjetoAberto(false);
  };

  const selecionarProfissional = (p: ProfissionalResposta) => {
    setProfissionalId(String(p.id));
    setBuscaProfissional(p.nome);
    setProjetoId("");
    setBuscaProjeto("");
    setValorHora("");
    setBuscaVinculo("");
    setConfirmandoDesvincular(null);
    setDropdownProfissionalAberto(false);
  };

  const selecionarProjeto = (p: ProjetoDisponivel) => {
    setProjetoId(String(p.id));
    setBuscaProjeto(`${p.nome} (${p.codigo})`);
    setValorHora(p.valorHoraBase?.toString() || "0");
    setDropdownProjetoAberto(false);
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
        vincularProjetoAoProfissional(Number(profissionalId), Number(projetoId), valorHoraNumero),
        {
          pending: "Realizando associação",
          success: "Associado com sucesso!",
          error: "Erro ao realizar associação",
        }
      );
      const vinculosAtualizados = await listarProjetosVinculados(Number(profissionalId));
      setProjetosVinculados(vinculosAtualizados);
      setProjetoId("");
      setBuscaProjeto("");
      setValorHora("");
      setMensagem("Projeto associado com sucesso.");
    } catch (error) {
      setMensagem(
        error instanceof Error ? error.message : "Erro ao associar projeto ao profissional."
      );
    } finally {
      setSalvando(false);
    }
  };

  const handleDesvincular = async (projetoIdParaRemover: number) => {
    if (!profissionalId) return;
    setDesvinculando(projetoIdParaRemover);
    setConfirmandoDesvincular(null);
    try {
      await toast.promise(
        desvincularProjetoDoProfissional(Number(profissionalId), projetoIdParaRemover),
        {
          pending: "Removendo vínculo...",
          success: "Vínculo removido com sucesso!",
          error: "Erro ao remover vínculo",
        }
      );
      const vinculosAtualizados = await listarProjetosVinculados(Number(profissionalId));
      setProjetosVinculados(vinculosAtualizados);
    } catch {
    } finally {
      setDesvinculando(null);
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
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resumo</p>
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
                        {/* Profissional */}
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Profissional
                          </label>
                          <div className="relative" ref={dropdownProfissionalRef}>
                            <div className="relative">
                              <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={buscaProfissional}
                                onChange={(e) => {
                                  setBuscaProfissional(e.target.value);
                                  setProfissionalId("");
                                  setDropdownProfissionalAberto(true);
                                }}
                                onFocus={() => setDropdownProfissionalAberto(true)}
                                placeholder="Buscar profissional"
                                className="w-full rounded-xl border border-white/10 bg-[#3d3d40] py-3 pl-9 pr-10 text-white outline-none transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                              />
                              {(buscaProfissional || profissionalId) && (
                                <button
                                  type="button"
                                  onClick={limparProfissional}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>

                            {dropdownProfissionalAberto && (
                              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#2a2a2e] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                {profissionaisFiltrados.length === 0 ? (
                                  <p className="px-4 py-3 text-sm text-slate-400">
                                    Nenhum profissional encontrado.
                                  </p>
                                ) : (
                                  <ul className="max-h-52 overflow-y-auto">
                                    {profissionaisFiltrados.map((p) => (
                                      <li key={p.id}>
                                        <button
                                          type="button"
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={() => selecionarProfissional(p)}
                                          className={`w-full px-4 py-2.5 text-left transition hover:bg-white/8 ${
                                            profissionalId === String(p.id) ? "bg-violet-500/15" : ""
                                          }`}
                                        >
                                          <p className="text-sm font-medium text-white">{p.nome}</p>
                                          <p className="text-xs text-slate-400">{p.email}</p>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Projeto */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Projeto
                          </label>
                          <div
                            className={`relative ${!profissionalId ? "pointer-events-none opacity-50" : ""}`}
                            ref={dropdownProjetoRef}
                          >
                            <div className="relative">
                              <Search
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                type="text"
                                value={buscaProjeto}
                                onChange={(e) => {
                                  setBuscaProjeto(e.target.value);
                                  setProjetoId("");
                                  setValorHora("");
                                  setDropdownProjetoAberto(true);
                                }}
                                onFocus={() => setDropdownProjetoAberto(true)}
                                disabled={!profissionalId}
                                placeholder="Buscar projeto"
                                className="w-full rounded-xl border border-white/10 bg-[#3d3d40] py-3 pl-9 pr-10 text-white outline-none transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed"
                              />
                              {(buscaProjeto || projetoId) && (
                                <button
                                  type="button"
                                  onClick={limparProjeto}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                                >
                                  <X size={15} />
                                </button>
                              )}
                            </div>

                            {dropdownProjetoAberto && profissionalId && (
                              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[#2a2a2e] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                                {projetosFiltrados.length === 0 ? (
                                  <p className="px-4 py-3 text-sm text-slate-400">
                                    Nenhum projeto disponível.
                                  </p>
                                ) : (
                                  <ul className="max-h-52 overflow-y-auto">
                                    {projetosFiltrados.map((p) => (
                                      <li key={p.id}>
                                        <button
                                          type="button"
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={() => selecionarProjeto(p)}
                                          className={`w-full px-4 py-2.5 text-left transition hover:bg-white/8 ${
                                            projetoId === String(p.id) ? "bg-violet-500/15" : ""
                                          }`}
                                        >
                                          <p className="text-sm font-medium text-white">{p.nome}</p>
                                          <p className="text-xs text-slate-400">
                                            {p.codigo} · R$ {p.valorHoraBase?.toFixed(2)}/h
                                          </p>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Valor por hora */}
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

                              <div className="flex shrink-0 items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                                  R$ {projeto.valorHora.toFixed(2)}/h
                                </span>

                                {confirmandoDesvincular === projeto.projetoId ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => void handleDesvincular(projeto.projetoId)}
                                      disabled={desvinculando === projeto.projetoId}
                                      className="rounded-lg border border-red-500/30 bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/35 disabled:opacity-50"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmandoDesvincular(null)}
                                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmandoDesvincular(projeto.projetoId)}
                                    title="Remover vínculo"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/25"
                                  >
                                    {desvinculando === projeto.projetoId ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                    ) : (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    )}
                                  </button>
                                )}
                              </div>
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