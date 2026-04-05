import { useEffect, useMemo, useState } from "react";
import {
  cadastrarProfissional,
  listarProjetos,
  type ProjetoDisponivel,
  type ProjetoVinculoPayload,
} from "../../services/profissionaisApi";

import {
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  UserPlus,
} from "lucide-react";

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

  const totalProjetosSelecionados = Object.keys(projetosSelecionados).length;

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
    <div className="p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Cadastro de Profissional
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Cadastre um profissional, defina o cargo e vincule projetos com valor por hora.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#232329] px-4 py-3 shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6627cc] to-[#4a1898] shadow-lg shadow-purple-900/30">
              <UserPlus size={20} className="text-white" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Resumo
              </p>
              <p className="text-sm font-medium text-white">
                {totalProjetosSelecionados} projeto(s) selecionado(s)
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
                  Novo profissional
                </h2>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  Preencha os dados principais e, se quiser, já associe os projetos na mesma tela.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
                  {projetosDisponiveis.length} projeto(s) disponível(is)
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-sm">
                  {ativo ? "Status: ativo" : "Status: inativo"}
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
                <div className="flex flex-col gap-4 lg:col-span-7">
                  <div className="rounded-2xl border border-white/8 p-5 shadow-inner shadow-black/20">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-13.5 w-10 items-center justify-center rounded-2xl bg-white/5">
                        <UserPlus size={18} className="text-white/85" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Dados do profissional</h3>
                        <p className="text-sm text-slate-400">
                          Informações principais para cadastro e acesso.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Nome
                        </label>
                        <input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                          placeholder="Digite o nome do profissional"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Email
                        </label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                          placeholder="nome@empresa.com"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Senha
                        </label>

                        <div className="relative">
                          <input
                            type={mostrarSenha ? "text" : "password"}
                            value={senhaHash}
                            onChange={(e) => setSenhaHash(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 pr-12 text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                            placeholder="Defina a senha"
                          />

                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                          >
                            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Cargo
                        </label>

                        <div className="relative">
                          <select
                            value={cargoId}
                            onChange={(e) => setCargoId(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 pr-10 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
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
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 transition hover:border-white/12">
                          <input
                            type="checkbox"
                            checked={ativo}
                            onChange={(e) => setAtivo(e.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-violet-500"
                          />
                          Profissional ativo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Conferiu os dados?</p>
                        <p className="text-sm text-slate-400">
                          Os campos principais são obrigatórios. Os projetos podem ser vinculados agora ou depois.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={salvando}
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#6627cc] to-[#4a1898] px-6 font-medium text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {salvando ? "Salvando..." : "Cadastrar profissional"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 p-5 shadow-inner shadow-black/20 lg:col-span-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                      <BriefcaseBusiness size={18} className="text-white/85" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Projetos vinculados</h3>
                      <p className="text-sm text-slate-400">
                        Pesquise, selecione e ajuste o valor da hora por projeto.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      placeholder="Buscar projeto..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#3d3d40] py-3 pl-10 pr-3 text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
                    <span className="text-slate-400">Projetos filtrados</span>
                    <span className="font-medium text-white">{projetosFiltrados.length}</span>
                  </div>

                  <div className="mt-4 max-h-[20rem] space-y-3 overflow-y-auto pr-1">
                    {carregandoProjetos &&
                      Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse rounded-2xl border border-white/8 bg-[#1b1b1f] p-4"
                        >
                          <div className="h-4 w-2/3 rounded bg-white/10" />
                          <div className="mt-3 h-3 w-1/3 rounded bg-white/10" />
                        </div>
                      ))}

                    {!carregandoProjetos && projetosFiltrados.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-[#1b1b1f] px-4 py-8 text-center text-sm text-slate-400">
                        Nenhum projeto encontrado para a busca informada.
                      </div>
                    )}

                    {!carregandoProjetos &&
                      projetosFiltrados.map((projeto) => {
                        const selecionado = projetosSelecionados[projeto.id] !== undefined;

                        return (
                          <div
                            key={projeto.id}
                            className={`rounded-2xl border p-4 transition ${
                              selecionado
                                ? "border-purple-500/35 bg-purple-500/10 shadow-[0_0_0_1px_rgba(147,51,234,0.08)]"
                                : "border-white/8 bg-[#1b1b1f] hover:border-white/15"
                            }`}
                          >
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selecionado}
                                onChange={() => toggleProjeto(projeto.id)}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-violet-500"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-white">{projeto.nome}</p>
                                    <p className="mt-1 text-xs text-slate-500">{projeto.codigo}</p>
                                  </div>

                                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                                    Base: R$ {Number(projeto.valorHoraBase || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </label>

                            {selecionado && (
                              <div className="mt-4 border-t border-white/8 pt-4">
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                  Valor da hora neste projeto
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={projetosSelecionados[projeto.id]}
                                  onChange={(e) =>
                                    atualizarValorHoraProjeto(projeto.id, e.target.value)
                                  }
                                  className="w-full rounded-xl border border-white/10 bg-[#3d3d40] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                                  placeholder="Valor por hora"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroProfissional;