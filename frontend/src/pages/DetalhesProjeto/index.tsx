import { useEffect, useMemo, useState } from "react";
import Search from "../../components/ui/Search";
import { useProjetoContext } from "../../contexts/ProjetoContext";
import type { Tarefa } from "../../types/tarefa";
import type { Profissional } from "../../types/profissionalService";
import {
  carregarItensPorProjeto,
  carregarTarefasPorProjeto,
  carregarTarefasPorProjetoEResponsavel,
} from "../../service/servicoTarefas";
import { carregarProfissionaisPorProjeto } from "../../service/servicoProfissionais";
import { normalizarTexto } from "../../utils";
import type { Item } from "../../types/item";
import type { TipoTarefa } from "../../types/tipoTarefa";
import { ApiTarefas, ApiProjeto } from "../../service/servicoApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import profissionalService from "../../types/profissionalService";
import { carregarProfissionalPorId } from "../../service/servicoProfissionais";

type FormProjeto = {
  nome: string
  codigo: string
  tipoProjeto: "HORA_FECHADA" | "ALOCACAO"
  valorHoraBase: number
  horasContratadas: number
  dataInicio: string
  dataFim: string
  responsavelId: number
}

function formatarDataInput(valor: string) {
  if (!valor) return ""
  return valor.length >= 10 ? valor.slice(0, 10) : valor
}

function formatarData(data?: string | null) {
  if (!data) return "Sem data";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return "Sem data";
  }

  return dataObj.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor?: number | null) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarHorasMinutos(valor?: number | string | null) {
  const minutos = Number(valor ?? 0);

  if (!Number.isFinite(minutos) || minutos <= 0) {
    return "0h";
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  if (horas === 0) {
    return `${resto}min`;
  }

  if (resto === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${resto}min`;
}

function getTipoLabel(tipo?: string) {
  if (tipo === "HORA_FECHADA") return "Hora fechada";
  if (tipo === "ALOCACAO") return "Alocação";
  return tipo || "Não informado";
}

function getTipoStyle(tipo?: string) {
  if (tipo === "HORA_FECHADA") {
    return "border-white/10 bg-white/10 text-slate-200";
  }

  if (tipo === "ALOCACAO") {
    return "border-white/10 bg-white/10 text-slate-200";
  }

  return "border-white/10 bg-white/5 text-slate-300";
}

function getStatusLabel(status?: string) {
  if (status === "PENDENTE") return "Pendente";
  if (status === "EM_ANDAMENTO") return "Em andamento";
  if (status === "CONCLUIDA") return "Concluída";
  return status || "Não informado";
}

function getStatusStyle(status?: string) {
  if (status === "CONCLUIDA") {
    return "border-white/10 bg-white/10 text-slate-200";
  }

  if (status === "EM_ANDAMENTO") {
    return "border-white/10 bg-white/10 text-slate-200";
  }

  return "border-white/10 bg-white/10 text-slate-200";
}

function getStatusDot(status?: string) {
  if (status === "CONCLUIDA") return "bg-emerald-400";
  if (status === "EM_ANDAMENTO") return "bg-sky-400";
  return "bg-yellow-400";
}

function getInitials(nome?: string) {
  if (!nome) return "?";

  const partes = nome.trim().split(" ");

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function DetalhesProjeto() {
  const navigate = useNavigate();
  const { projeto, isLoading: projetoLoading } = useProjetoContext();
  const { user } = useAuth();

  const roles = user?.roles ?? [];
  const podeGerenciarProjetos =
    roles.includes("ROLE_FINANCE") ||
    roles.includes("ROLE_GERENTE_PROJETO") ||
    roles.includes("ROLE_ADMIN");

  const [acessoNegado, setAcessoNegado] = useState(false);
  const [pesquisaTarefa, setPesquisaTarefa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<number | null>(null);
  const [filtroItem, setFiltroItem] = useState<number | null>(null);
  const [filtroProfissional, setFiltroProfissional] = useState<number | null>(
    null,
  );
  const [pesquisaProfissional, setPesquisaProfissional] = useState("");
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tipos, setTipos] = useState<TipoTarefa[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);
  const [isEditando, setIsEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);
  const [sucessoEdicao, setSucessoEdicao] = useState<string | null>(null);
  const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<Profissional[]>([]);
  const [formProjeto, setFormProjeto] = useState<FormProjeto | null>(null);
  const [nomeResponsavelProjeto, setNomeResponsavelProjeto] = useState<string | null>(null);

  useEffect(() => {
    async function loadTipos() {
      try {
        const res = await ApiTarefas.get("/tipoTarefa");
        setTipos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erro ao carregar tipos de tarefa:", error);
        setTipos([]);
      }
    }

    loadTipos();
  }, []);

  useEffect(() => {
    const projetoId = projeto?.id;

    if (projetoId === undefined || projetoId === null) return;

    async function load(id: number) {
      setLoadingDados(true);

      try {
        const profissionaisData = await carregarProfissionaisPorProjeto(id);

        const usuarioEstaNoProjeto = profissionaisData.some(
          (profissional) => Number(profissional.id) === Number(user?.id),
        );

        if (!podeGerenciarProjetos && !usuarioEstaNoProjeto) {
          setAcessoNegado(true);
          setTarefas([]);
          setProfissionais([]);
          setItens([]);
          return;
        }

        setAcessoNegado(false);

        const [tarefasData, itensData] = await Promise.all([
          podeGerenciarProjetos
            ? carregarTarefasPorProjeto(id)
            : carregarTarefasPorProjetoEResponsavel(id, Number(user?.id)),
          carregarItensPorProjeto(id),
        ]);

        const itemIdsPermitidos = new Set(
          tarefasData
            .map((tarefa) => tarefa.itemId)
            .filter((id): id is number => typeof id === "number"),
        );

        setTarefas(tarefasData);
        setProfissionais(
          podeGerenciarProjetos
            ? profissionaisData
            : profissionaisData.filter(
                (profissional) => Number(profissional.id) === Number(user?.id),
              ),
        );
        setItens(
          podeGerenciarProjetos
            ? itensData
            : itensData.filter((item) =>
                itemIdsPermitidos.has(Number(item.idItem)),
              ),
        );
      } catch (error) {
        console.error("Erro ao carregar dados do projeto:", error);
      } finally {
        setLoadingDados(false);
      }
    }

    load(projetoId);
  }, [projeto?.id, user?.id, podeGerenciarProjetos]);

  useEffect(() => {
    async function loadResponsavelProjeto() {
      if (!projeto?.responsavelId) {
        setNomeResponsavelProjeto(null);
        return;
      }

      try {
        const responsavel = await carregarProfissionalPorId(projeto.responsavelId);
        setNomeResponsavelProjeto(responsavel?.nome ?? null);
      } catch (error) {
        console.error("Erro ao carregar responsável do projeto:", error);
        setNomeResponsavelProjeto(null);
      }
    }

    loadResponsavelProjeto();
  }, [projeto?.responsavelId]);

  const getNomeProfissional = (id?: number | null) => {
    if (!id) return "Não atribuído";

    return (
      profissionais.find((profissional) => Number(profissional.id) === Number(id))
        ?.nome ?? `ID ${id}`
    );
  };

  const getNomeTipo = (id?: number | null) => {
    if (!id) return "Não informado";

    return tipos.find((tipo) => Number(tipo.id) === Number(id))?.nome ?? `Tipo ${id}`;
  };

  const getNomeItem = (id?: number | null) => {
    if (!id) return "Sem item";

    return itens.find((item) => Number(item.idItem) === Number(id))?.nome ?? `Item ${id}`;
  };

  const tarefasFiltradas = useMemo(() => {
    const termo = normalizarTexto(pesquisaTarefa);

    return tarefas.filter((tarefa) => {
      const textoTarefa = `${tarefa.titulo ?? ""} ${tarefa.descricao ?? ""}`;
      const nomeProfissional = getNomeProfissional(tarefa.responsavelId);
      const nomeItem = getNomeItem(tarefa.itemId);

      const matchTexto =
        !termo ||
        normalizarTexto(textoTarefa).includes(termo) ||
        normalizarTexto(nomeProfissional).includes(termo) ||
        normalizarTexto(nomeItem).includes(termo);

      const matchTipo =
        filtroTipo === null || Number(tarefa.tipoTarefaId) === Number(filtroTipo);

      const matchItem =
        filtroItem === null || Number(tarefa.itemId) === Number(filtroItem);

      const matchProfissional =
        filtroProfissional === null ||
        Number(tarefa.responsavelId) === Number(filtroProfissional);

      return matchTexto && matchTipo && matchItem && matchProfissional;
    });
  }, [
    tarefas,
    pesquisaTarefa,
    filtroTipo,
    filtroItem,
    filtroProfissional,
    profissionais,
    itens,
  ]);

  const profissionaisFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisaProfissional);

    if (!termo) return profissionais;

    return profissionais.filter((profissional) =>
      normalizarTexto(profissional.nome).includes(termo),
    );
  }, [profissionais, pesquisaProfissional]);

  const metricas = useMemo(() => {
    const totalTarefas = tarefas.length;

    const pendentes = tarefas.filter(
      (tarefa) => tarefa.status === "PENDENTE",
    ).length;

    const emAndamento = tarefas.filter(
      (tarefa) => tarefa.status === "EM_ANDAMENTO",
    ).length;

    const concluidas = tarefas.filter(
      (tarefa) => tarefa.status === "CONCLUIDA",
    ).length;

    const minutosPrevistos = tarefas.reduce(
      (total, tarefa) => total + Number(tarefa.tempoMaximoMinutos ?? 0),
      0,
    );

    const horasContratadas = Number(projeto?.horasContratadas ?? 0);

    const percentualHoras =
      projeto?.tipoProjeto === "HORA_FECHADA" && horasContratadas > 0
        ? (minutosPrevistos / 60 / horasContratadas) * 100
        : 0;

    return {
      totalTarefas,
      pendentes,
      emAndamento,
      concluidas,
      minutosPrevistos,
      horasContratadas,
      percentualHoras,
    };
  }, [tarefas, projeto]);

  const responsavelProjeto = getNomeProfissional(projeto?.responsavelId);
  const responsavelProjetoExibicao = nomeResponsavelProjeto ?? responsavelProjeto;

  const iniciarEdicao = async () => {
    if (!projeto) return;

    setErroEdicao(null)
    setSucessoEdicao(null)
    setFormProjeto({
      nome: projeto.nome,
      codigo: projeto.codigo,
      tipoProjeto: projeto.tipoProjeto,
      valorHoraBase: projeto.valorHoraBase,
      horasContratadas: projeto.horasContratadas ?? 0,
      dataInicio: formatarDataInput(projeto.dataInicio),
      dataFim: formatarDataInput(projeto.dataFim),
      responsavelId: projeto.responsavelId,
    })

    const lista = await profissionalService.listarTodos()
    setResponsaveisDisponiveis(lista)
    setIsEditando(true)
  }

  const cancelarEdicao = () => {
    setIsEditando(false)
    setFormProjeto(null)
    setErroEdicao(null)
  }

  const salvarEdicao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!projeto || !formProjeto) return

    if (
      !formProjeto.nome.trim() ||
      !formProjeto.codigo.trim() ||
      !formProjeto.dataInicio ||
      !formProjeto.dataFim ||
      !formProjeto.responsavelId
    ) {
      setErroEdicao("Preencha todos os campos obrigatórios.")
      return
    }

    if (formProjeto.tipoProjeto === "HORA_FECHADA" && formProjeto.horasContratadas <= 0) {
      setErroEdicao("Para projeto de hora fechada, informe horas contratadas maiores que zero.")
      return
    }

    if (formProjeto.valorHoraBase <= 0) {
      setErroEdicao("Informe um valor hora base maior que zero.")
      return
    }

    try {
      setSalvando(true)
      setErroEdicao(null)

      await ApiProjeto.put(`/projeto/projetos/${projeto.id}`, {
        nome: formProjeto.nome,
        codigo: projeto.codigo,
        tipoProjeto: formProjeto.tipoProjeto,
        valorHoraBase: Number(formProjeto.valorHoraBase),
        horasContratadas:
          formProjeto.tipoProjeto === "HORA_FECHADA"
            ? Number(formProjeto.horasContratadas)
            : null,
        dataInicio: formProjeto.dataInicio,
        dataFim: formProjeto.dataFim,
        responsavelId: Number(formProjeto.responsavelId),
      })

      window.location.reload()
      setSucessoEdicao("Projeto atualizado com sucesso.")
    } catch (error) {
      console.error(error)
      setErroEdicao("Não foi possível atualizar o projeto. Verifique a rota PUT no backend.")
    } finally {
      setSalvando(false)
    }
  }

  if (projetoLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1f1f1f] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white" />
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1f1f1f] p-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Projeto não encontrado.</p>
          <button
            onClick={() => navigate("/projetos")}
            className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Voltar para projetos
          </button>
        </div>
      </div>
    );
  }

  if (acessoNegado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1f1f1f] p-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Acesso negado</h2>
          <p className="mt-2 text-sm text-red-100/80">
            Você não está vinculado a este projeto.
          </p>
          <button
            onClick={() => navigate("/projetos")}
            className="mt-5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
          >
            Voltar para projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6 text-white">
      <div className="mx-auto flex max-w-375 flex-col gap-5">
        <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[#232329] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/10 bg-[#26262b] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <button
                  onClick={() => navigate("/projetos")}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Voltar
                </button>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTipoStyle(
                      projeto.tipoProjeto,
                    )}`}
                  >
                    {getTipoLabel(projeto.tipoProjeto)}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {podeGerenciarProjetos ? "Gestão do projeto" : "Meu projeto"}
                  </span>
                </div>

                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white">
                  {projeto.nome}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Código {projeto.codigo} • Responsável: {responsavelProjetoExibicao}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("./apontamento")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#6627cc] px-5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#7634dd] active:scale-[0.98]"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Apontar horas
                </button>

                <button
                  onClick={() => navigate("./tarefas")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {podeGerenciarProjetos ? "Gerenciar tarefas" : "Minhas tarefas"}
                </button>

                {podeGerenciarProjetos && !isEditando && (
                  <button
                    onClick={() => void iniciarEdicao()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19H4v-3L16.5 3.5z" />
                    </svg>
                    Editar projeto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
            <div className="rounded-2xl border border-white/10 bg-[#2c2c31] p-4">
              <p className="text-xs text-slate-500">Tarefas</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {metricas.totalTarefas}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {metricas.concluidas} concluída(s)
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#2c2c31] p-4">
              <p className="text-xs text-slate-500">Em andamento</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {metricas.emAndamento}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {metricas.pendentes} pendente(s)
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#2c2c31] p-4">
              <p className="text-xs text-slate-500">Horas previstas</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {formatarHorasMinutos(metricas.minutosPrevistos)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Soma do tempo das tarefas
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#2c2c31] p-4">
              <p className="text-xs text-slate-500">Equipe</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {profissionais.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Profissional(is) vinculado(s)
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-5">
            <section className="rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-lg shadow-black/10">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Resumo do projeto
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Informações principais
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300">
                  {formatarData(projeto.dataInicio)} — {formatarData(projeto.dataFim)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
                  <p className="text-xs text-slate-500">Valor/hora</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {formatarMoeda(projeto.valorHoraBase)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
                  <p className="text-xs text-slate-500">Horas contratadas</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {projeto.tipoProjeto === "HORA_FECHADA"
                      ? `${projeto.horasContratadas ?? 0}h`
                      : "Livre"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
                  <p className="text-xs text-slate-500">Tipo</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {getTipoLabel(projeto.tipoProjeto)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
                  <p className="text-xs text-slate-500">Responsável</p>
                  <p className="mt-2 truncate text-xl font-bold text-white">
                    {responsavelProjetoExibicao}
                  </p>
                </div>
              </div>

              {projeto.tipoProjeto === "HORA_FECHADA" && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#1f1f24] p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Uso previsto das horas contratadas
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Baseado na soma do tempo máximo das tarefas cadastradas.
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                      {metricas.percentualHoras.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-[#6627cc] transition-all duration-500"
                      style={{
                        width: `${Math.min(metricas.percentualHoras, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {isEditando && formProjeto && podeGerenciarProjetos ? (
                <form onSubmit={salvarEdicao} className="mt-6 rounded-2xl border border-white/10 bg-[#1f1f24] p-5">
                  <h3 className="mb-4 text-lg font-bold text-white">Editar Projeto</h3>
                  
                  {sucessoEdicao ? <p className="mb-3 text-sm text-green-300">{sucessoEdicao}</p> : null}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <span className="mb-1 block text-xs text-white/60">Nome</span>
                      <input
                        type="text"
                        value={formProjeto.nome}
                        onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, nome: e.target.value } : prev))}
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Código</span>
                      <input
                        type="text"
                        value={formProjeto.codigo}
                        readOnly
                        disabled
                        className="w-full cursor-not-allowed rounded-md bg-black/25 px-3 py-2 opacity-60 outline-none text-white"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Tipo</span>
                      <select
                        value={formProjeto.tipoProjeto}
                        onChange={(e) =>
                          setFormProjeto((prev) =>
                            prev ? { ...prev, tipoProjeto: e.target.value as "HORA_FECHADA" | "ALOCACAO" } : prev
                          )
                        }
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      >
                        <option value="HORA_FECHADA">Hora Fechada</option>
                        <option value="ALOCACAO">Alocação</option>
                      </select>
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Data Início</span>
                      <input
                        type="date"
                        value={formProjeto.dataInicio}
                        onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, dataInicio: e.target.value } : prev))}
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Data Fim</span>
                      <input
                        type="date"
                        value={formProjeto.dataFim}
                        onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, dataFim: e.target.value } : prev))}
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Valor Hora Base</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formProjeto.valorHoraBase}
                        onChange={(e) =>
                          setFormProjeto((prev) =>
                            prev ? { ...prev, valorHoraBase: Number(e.target.value) || 0 } : prev
                          )
                        }
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs text-white/60">Horas Contratadas</span>
                      <input
                        type="number"
                        min={0}
                        value={formProjeto.horasContratadas}
                        onChange={(e) =>
                          setFormProjeto((prev) =>
                            prev ? { ...prev, horasContratadas: Number(e.target.value) || 0 } : prev
                          )
                        }
                        disabled={formProjeto.tipoProjeto !== "HORA_FECHADA"}
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="col-span-2">
                      <span className="mb-1 block text-xs text-white/60">Responsável</span>
                      <select
                        value={formProjeto.responsavelId}
                        onChange={(e) =>
                          setFormProjeto((prev) =>
                            prev ? { ...prev, responsavelId: Number(e.target.value) || 0 } : prev
                          )
                        }
                        className="w-full rounded-md bg-black/25 px-3 py-2 outline-none text-white"
                      >
                        <option value={0}>Selecione</option>
                        {responsaveisDisponiveis.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    {erroEdicao ? <p className="col-span-2 text-sm text-red-300">{erroEdicao}</p> : null}

                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={salvando}
                        className="rounded-lg bg-white/20 px-3 py-2 text-sm font-medium hover:bg-white/30 disabled:opacity-60"
                      >
                        {salvando ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : null}
            </section>

            <section className="rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-lg shadow-black/10">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Tarefas
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {podeGerenciarProjetos ? "Tarefas do projeto" : "Minhas tarefas"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {tarefasFiltradas.length} tarefa(s) encontrada(s)
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="min-w-65">
                    <Search
                      placeholder="Pesquisar tarefa..."
                      value={pesquisaTarefa}
                      onChange={setPesquisaTarefa}
                      className="h-11"
                    />
                  </div>

                  <select
                    value={filtroTipo ?? ""}
                    onChange={(e) =>
                      setFiltroTipo(e.target.value ? Number(e.target.value) : null)
                    }
                    className="h-11 rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-white/20"
                  >
                    <option value="">Todos os tipos</option>
                    {tipos.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <select
                  value={filtroItem ?? ""}
                  onChange={(e) =>
                    setFiltroItem(e.target.value ? Number(e.target.value) : null)
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-white/20"
                >
                  <option value="">
                    {loadingDados ? "Carregando itens..." : "Todos os itens"}
                  </option>
                  {itens.map((item) => (
                    <option key={item.idItem} value={item.idItem}>
                      {item.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroProfissional ?? ""}
                  onChange={(e) =>
                    setFiltroProfissional(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="h-11 rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-white/20"
                >
                  <option value="">Todos os profissionais</option>
                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
                </select>

                {(pesquisaTarefa || filtroTipo || filtroItem || filtroProfissional) && (
                  <button
                    onClick={() => {
                      setPesquisaTarefa("");
                      setFiltroTipo(null);
                      setFiltroItem(null);
                      setFiltroProfissional(null);
                    }}
                    className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {loadingDados ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-2xl border border-white/10 bg-[#2c2c31]"
                    />
                  ))}
                </div>
              ) : tarefasFiltradas.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1f1f24] p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-slate-300">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Nenhuma tarefa encontrada
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-slate-400">
                    Ajuste os filtros ou acesse o Kanban para visualizar o quadro.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {tarefasFiltradas.map((tarefa) => (
                    <div
                      key={tarefa.id}
                      className="group rounded-2xl border border-white/10 bg-[#1f1f24] p-4 transition hover:border-white/20 hover:bg-[#25252c]"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-lg font-bold text-white">
                            {tarefa.titulo}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                            {tarefa.descricao || "Sem descrição."}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            tarefa.status,
                          )}`}
                        >
                          {getStatusLabel(tarefa.status)}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-[11px] text-slate-500">
                            Responsável
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold text-white">
                            {getNomeProfissional(tarefa.responsavelId)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-[11px] text-slate-500">Tempo</p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {formatarHorasMinutos(tarefa.tempoMaximoMinutos)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-[11px] text-slate-500">Tipo</p>
                          <p className="mt-1 truncate text-sm font-semibold text-white">
                            {getNomeTipo(tarefa.tipoTarefaId)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-[11px] text-slate-500">Item</p>
                          <p className="mt-1 truncate text-sm font-semibold text-white">
                            {getNomeItem(tarefa.itemId)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="flex min-w-0 flex-col gap-5">
            <section className="rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-lg shadow-black/10">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Status
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Distribuição
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Pendente", value: metricas.pendentes, status: "PENDENTE" },
                  {
                    label: "Em andamento",
                    value: metricas.emAndamento,
                    status: "EM_ANDAMENTO",
                  },
                  { label: "Concluída", value: metricas.concluidas, status: "CONCLUIDA" },
                ].map((item) => {
                  const total = metricas.totalTarefas || 1;
                  const percentual = (item.value / total) * 100;

                  return (
                    <div key={item.status} className="rounded-2xl bg-[#1f1f24] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${getStatusDot(
                              item.status,
                            )}`}
                          />
                          <span className="text-sm font-semibold text-white">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-black/30">
                        <div
                          className={`h-full rounded-full ${getStatusDot(
                            item.status,
                          )}`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[20px] border border-white/10 bg-[#232329] p-5 shadow-lg shadow-black/10">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Equipe
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Profissionais
                  </h2>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                  {profissionais.length}
                </span>
              </div>

              <Search
                placeholder="Pesquisar profissional..."
                value={pesquisaProfissional}
                onChange={setPesquisaProfissional}
              />

              <div className="mt-4 max-h-130 space-y-3 overflow-y-auto pr-1">
                {profissionaisFiltrados.length > 0 ? (
                  profissionaisFiltrados.map((profissional) => {
                    const tarefasDoProfissional = tarefas.filter(
                      (tarefa) =>
                        Number(tarefa.responsavelId) === Number(profissional.id),
                    ).length;

                    return (
                      <div
                        key={profissional.id}
                        className="rounded-2xl border border-white/10 bg-[#1f1f24] p-4 transition hover:border-white/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold text-white">
                            {getInitials(profissional.nome)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">
                              {profissional.nome}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {tarefasDoProfissional} tarefa(s)
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-5 text-center text-sm text-slate-400">
                    Nenhum profissional encontrado.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DetalhesProjeto;