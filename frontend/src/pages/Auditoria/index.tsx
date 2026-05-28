import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  FolderKanban,
  ListFilter,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import ListaAuditoria from "../../components/auditoria/ListaAuditoria";
import ModalDetalhesAuditoria from "../../components/auditoria/ModalDetalhesAuditoria";
import { useAuditoria } from "../../hooks/useAuditoria";
import type {
  AuditoriaModulo,
  AuditoriaRegistro,
  AuditoriaTipoEvento,
} from "../../types/auditoria";

interface AbaAuditoria {
  id: AuditoriaModulo;
  label: string;
  descricao: string;
  icon: typeof Activity;
}

const ABAS_AUDITORIA: AbaAuditoria[] = [
  {
    id: "todos",
    label: "Visão Geral",
    descricao: "Todos",
    icon: Activity,
  },
  {
    id: "profissionais",
    label: "Profissionais",
    descricao: "Cadastros e vínculos",
    icon: Users,
  },
  {
    id: "projetos",
    label: "Projetos",
    descricao: "Projetos e valores",
    icon: FolderKanban,
  },
  {
    id: "tarefas",
    label: "Tarefas",
    descricao: "Status e responsáveis",
    icon: ClipboardList,
  },
];

const FILTROS_EVENTO: { id: AuditoriaTipoEvento; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "login", label: "Login" },
  { id: "criacao", label: "Criação" },
  { id: "atualizacao", label: "Atualização" },
  { id: "remocao", label: "Remoção" },
];

function removerAcentos(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarTexto(valor: string): string {
  return removerAcentos(valor.trim().toLowerCase());
}

function identificarTipoEvento(acao: string): AuditoriaTipoEvento {
  const acaoNormalizada = normalizarTexto(acao);

  if (
    acaoNormalizada.includes("login") ||
    acaoNormalizada.includes("sign in") ||
    acaoNormalizada.includes("signin") ||
    acaoNormalizada.includes("autenticacao")
  ) {
    return "login";
  }

  if (
    acaoNormalizada.includes("criacao") ||
    acaoNormalizada.includes("create") ||
    acaoNormalizada.includes("insert") ||
    acaoNormalizada.includes("post") ||
    acaoNormalizada.includes("cadastro") ||
    acaoNormalizada.includes("associacao")
  ) {
    return "criacao";
  }

  if (
    acaoNormalizada.includes("atualizacao") ||
    acaoNormalizada.includes("alteracao") ||
    acaoNormalizada.includes("atualizado") ||
    acaoNormalizada.includes("update") ||
    acaoNormalizada.includes("put") ||
    acaoNormalizada.includes("patch") ||
    acaoNormalizada.includes("edicao")
  ) {
    return "atualizacao";
  }

  if (
    acaoNormalizada.includes("remocao") ||
    acaoNormalizada.includes("exclusao") ||
    acaoNormalizada.includes("delete") ||
    acaoNormalizada.includes("remove")
  ) {
    return "remocao";
  }

  return "todos";
}

export default function AuditoriaPage() {
  const [abaAtiva, setAbaAtiva] = useState<AuditoriaModulo>("todos");
  const [tipoEvento, setTipoEvento] = useState<AuditoriaTipoEvento>("todos");
  const [busca, setBusca] = useState("");
  const [auditoriaSelecionada, setAuditoriaSelecionada] = useState<AuditoriaRegistro | null>(null);

  const {
    registros,
    loading,
    carregandoInicial,
    atualizando,
    error,
    indisponivel,
    mensagemIndisponivel,
    recarregar,
  } = useAuditoria(abaAtiva);

  const registrosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return registros.filter((registro) => {
      const tipoRegistro = identificarTipoEvento(registro.acao);
      const bateTipoEvento = tipoEvento === "todos" || tipoRegistro === tipoEvento;

      if (!bateTipoEvento) {
        return false;
      }

      if (!termo) {
        return true;
      }

      return [
        registro.codigo,
        registro.responsavel.nome,
        registro.responsavel.email,
        registro.local,
        registro.acao,
        registro.campo,
        registro.valorAnterior,
        registro.novoValor,
        registro.tabela,
        registro.descricao,
      ]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(termo);
    });
  }, [busca, registros, tipoEvento]);

  const totaisPorModulo = useMemo(() => {
    return registros.reduce(
      (acumulador, registro) => ({
        ...acumulador,
        [registro.modulo]: acumulador[registro.modulo] + 1,
      }),
      {
        profissionais: 0,
        projetos: 0,
        tarefas: 0,
        sistema: 0,
      },
    );
  }, [registros]);

  return (
    <section className="min-h-full w-full overflow-x-hidden bg-[#1b1b1f] text-white">
      <div className="mx-auto w-full max-w-[1280px] min-w-0 space-y-6 px-4 py-10 sm:px-6">
        <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#232329] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-5 py-6 sm:px-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Controle e rastreabilidade
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Tela de Auditoria</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  Acompanhe eventos de login, criação, atualização e remoção em profissionais, projetos e tarefas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[520px] xl:grid-cols-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Profissionais</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totaisPorModulo.profissionais}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Projetos</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totaisPorModulo.projetos}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Tarefas</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totaisPorModulo.tarefas}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Sistema</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totaisPorModulo.sistema}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-5 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {ABAS_AUDITORIA.map((aba) => {
                const Icon = aba.icon;
                const ativa = abaAtiva === aba.id;

                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      ativa
                        ? "border-violet-400/50 bg-violet-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>
                      <span className="block text-sm font-semibold">{aba.label}</span>
                      <span className="block text-xs text-white/45">{aba.descricao}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Tipo de evento
                </p>

                <div className="flex flex-wrap gap-2">
                  {FILTROS_EVENTO.map((filtro) => {
                    const ativo = tipoEvento === filtro.id;

                    return (
                      <button
                        key={filtro.id}
                        type="button"
                        onClick={() => setTipoEvento(filtro.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          ativo
                            ? "border-violet-400/50 bg-violet-500/20 text-white"
                            : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {filtro.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[460px]">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Pesquisar auditoria"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void recarregar()}
                  disabled={loading || indisponivel}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCcw size={16} className={atualizando ? "animate-spin" : ""} />
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#232329] p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20">
                <ListFilter size={18} />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Resultado da auditoria</h2>
                <p className="mt-1 text-sm text-white/50">
                  {registrosFiltrados.length} registro{registrosFiltrados.length !== 1 ? "s" : ""} encontrado{registrosFiltrados.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {atualizando && <p className="text-sm text-white/45">Atualizando dados...</p>}
            {!atualizando && !indisponivel && <p className="text-sm text-white/45">Clique em um registro para abrir os detalhes.</p>}
          </div>

          {carregandoInicial && (
            <div className="rounded-[15px] border border-white/10 bg-black/20 px-5 py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="mt-4 text-sm text-white/60">Carregando auditoria...</p>
            </div>
          )}

          {!carregandoInicial && error && (
            <div className="rounded-[15px] border border-red-400/20 bg-red-500/10 px-5 py-8 text-center">
              <AlertTriangle className="mx-auto text-red-200" size={28} />
              <p className="mt-4 text-base font-semibold text-white">Erro ao carregar auditoria</p>
              <p className="mt-2 text-sm text-white/60">{error}</p>
              <button
                type="button"
                onClick={() => void recarregar()}
                className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregandoInicial && !error && indisponivel && (
            <div className="rounded-[15px] border border-amber-400/20 bg-amber-500/10 px-5 py-8 text-center">
              <AlertTriangle className="mx-auto text-amber-200" size={28} />
              <p className="mt-4 text-base font-semibold text-white">Módulo ainda não integrado</p>
              <p className="mt-2 text-sm text-white/60">{mensagemIndisponivel}</p>
            </div>
          )}

          {!carregandoInicial && !error && !indisponivel && registrosFiltrados.length === 0 && (
            <div className="rounded-[15px] border border-white/10 bg-black/20 px-5 py-10 text-center">
              <p className="text-base font-semibold text-white">Nenhum registro encontrado</p>
              <p className="mt-2 text-sm text-white/50">
                Tente alterar a aba, o tipo de evento ou o termo de busca.
              </p>
            </div>
          )}

          {!carregandoInicial && !error && !indisponivel && registrosFiltrados.length > 0 && (
            <ListaAuditoria registros={registrosFiltrados} onSelecionar={setAuditoriaSelecionada} />
          )}
        </section>

        <ModalDetalhesAuditoria
          aberto={!!auditoriaSelecionada}
          auditoria={auditoriaSelecionada}
          onFechar={() => setAuditoriaSelecionada(null)}
        />
      </div>
    </section>
  );
}
