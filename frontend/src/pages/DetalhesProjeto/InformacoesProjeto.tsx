import { useEffect, useState } from "react"
import { useProjetoContext } from "../../contexts/ProjetoContext"
import { carregarProfissionalPorId } from "../../service/servicoProfissionais"
import { carregarTarefasPorProjeto } from "../../service/servicoTarefas"
import type { Profissional } from "../../types/profissionalService"
import apiApontamento from "../../services/apiApontamento"
import { Clock, AlertTriangle, AlertCircle } from "lucide-react"
import profissionalService from "../../types/profissionalService"
import { ApiProjeto } from "../../service/servicoApi"
import { useAuth } from "../../contexts/AuthContext"
import { projetoService } from "../../services/gateway"
import { useNavigate } from "react-router-dom"

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

type StatusProjeto = "ATIVO" | "INATIVO" | "CONCLUIDO"
type AcaoProjeto = "EXCLUIR" | "INATIVAR" | "REATIVAR" | "CONCLUIR" | null

function formatarDataInput(valor: string) {
  if (!valor) return ""
  return valor.length >= 10 ? valor.slice(0, 10) : valor
}

function getStatusLabel(status?: string) {
  if (status === "INATIVO") return "Tarefas pendentes"
  if (status === "CONCLUIDO") return "Finalizado"
  return "Em andamento"
}

function getStatusStyle(status?: string) {
  if (status === "INATIVO") return "border-orange-500/40 bg-orange-500/15 text-orange-300"
  if (status === "CONCLUIDO") return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
  return "border-green-500/40 bg-green-500/15 text-green-300"
}

function getStatusDot(status?: string) {
  if (status === "INATIVO") return "bg-orange-400"
  if (status === "CONCLUIDO") return "bg-emerald-400"
  return "bg-green-400"
}

function getTituloConfirmacao(acao: AcaoProjeto) {
  if (acao === "EXCLUIR") return "Confirmar exclusão"
  if (acao === "INATIVAR") return "Confirmar inativação"
  if (acao === "REATIVAR") return "Confirmar reativação"
  if (acao === "CONCLUIR") return "Confirmar conclusão"
  return ""
}

function getMensagemConfirmacao(acao: AcaoProjeto, semHoras: boolean) {
  if (acao === "EXCLUIR") {
    return semHoras
      ? "Esse projeto será excluído permanentemente. Essa ação não poderá ser desfeita."
      : "Esse projeto não pode ser excluído porque há horas registradas."
  }

  if (acao === "INATIVAR") {
    return "O projeto ficará inativo até ser reativado."
  }

  if (acao === "REATIVAR") {
    return "O projeto voltará ao status ativo."
  }

  if (acao === "CONCLUIR") {
    return "O projeto será marcado como concluído."
  }

  return ""
}

function InformacoesProjeto() {
  const { projeto, refetch } = useProjetoContext()
  const { user, loading: authLoading, podeGerenciarProjetos } = useAuth()
  const navigate = useNavigate()

  const [responsavel, setResponsavel] = useState<Profissional | null>(null)
  const [totalMinutos, setTotalMinutos] = useState<number>(0)
  const [horasCarregadas, setHorasCarregadas] = useState(false)
  const [isEditando, setIsEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroEdicao, setErroEdicao] = useState<string | null>(null)
  const [sucessoEdicao, setSucessoEdicao] = useState<string | null>(null)
  const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<Profissional[]>([])
  const [formProjeto, setFormProjeto] = useState<FormProjeto | null>(null)
  const [erroStatus, setErroStatus] = useState<string | null>(null)
  const [acaoPendente, setAcaoPendente] = useState<AcaoProjeto>(null)
  const [processandoAcao, setProcessandoAcao] = useState(false)

  useEffect(() => {
    async function load() {
      if (projeto?.responsavelId) {
        const resp = await carregarProfissionalPorId(projeto.responsavelId)
        setResponsavel(resp)
      }
    }
    load()
  }, [projeto?.id, projeto?.responsavelId])

  useEffect(() => {
    async function loadHoras() {
      if (!projeto) return
      setHorasCarregadas(false)
      try {
        const tarefas = await carregarTarefasPorProjeto(projeto.id)
        const resultados = await Promise.all(
          tarefas.map((t) => apiApontamento.get(`/registros/tarefa/${t.id}`)),
        )
        const soma = resultados.reduce(
          (acc, res) => acc + (res.data.tempoMinutos ?? 0),
          0,
        )
        setTotalMinutos(soma)
      } catch {
        setTotalMinutos(0)
      } finally {
        setHorasCarregadas(true)
      }
    }
    loadHoras()
  }, [projeto?.id])

  const isResponsavelProjeto =
    !!user?.id &&
    !!projeto?.responsavelId &&
    Number(user.id) === Number(projeto.responsavelId)

  const podeAdministrarProjeto =
    !authLoading && !!projeto && (podeGerenciarProjetos || isResponsavelProjeto)

  const podeEditar = podeAdministrarProjeto

  const iniciarEdicao = async () => {
    if (!projeto || !podeEditar) return

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

    const lista = await profissionalService.listarResponsaveis()
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
    if (!formProjeto || !projeto) return

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

      await refetch()
      setIsEditando(false)
      setSucessoEdicao("Projeto atualizado com sucesso.")
    } catch (error) {
      console.error(error)
      setErroEdicao("Não foi possível atualizar o projeto.")
    } finally {
      setSalvando(false)
    }
  }

  const executarAcaoConfirmada = async () => {
    if (!projeto || !acaoPendente || !podeAdministrarProjeto) return

    setProcessandoAcao(true)
    setErroStatus(null)

    try {
      if (acaoPendente === "EXCLUIR") {
        const res = await projetoService.deletar(projeto.id)

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(
            (body as { message?: string })?.message ?? "Erro ao excluir projeto.",
          )
        }

        navigate("/projetos")
        return
      }

      if (acaoPendente === "INATIVAR") {
        await projetoService.alterarStatus(projeto.id, "INATIVO")
      }

      if (acaoPendente === "REATIVAR") {
        await projetoService.alterarStatus(projeto.id, "ATIVO")
      }

      if (acaoPendente === "CONCLUIR") {
        await projetoService.alterarStatus(projeto.id, "CONCLUIDO")
      }

      await refetch()
      setAcaoPendente(null)
    } catch (err) {
      console.error(err)
      setErroStatus(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir a ação. Tente novamente.",
      )
    } finally {
      setProcessandoAcao(false)
    }
  }

  if (!projeto) return null

  const statusAtual: StatusProjeto = (projeto as any).status ?? "ATIVO"
  const isHoraFechada = projeto.tipoProjeto === "HORA_FECHADA"
  const isAlocacao = projeto.tipoProjeto === "ALOCACAO"
  const horasContratadas = projeto.horasContratadas ?? 0
  const horasConsumidas = totalMinutos / 60
  const percentual = horasContratadas > 0 ? (horasConsumidas / horasContratadas) * 100 : 0
  const excedeu = horasConsumidas > horasContratadas
  const quaseExcedeu = !excedeu && percentual >= 80

  const corBarra = excedeu ? "bg-red-400" : quaseExcedeu ? "bg-yellow-400" : "bg-white/70"
  const corTexto = excedeu ? "text-red-400" : quaseExcedeu ? "text-yellow-400" : "text-white/80"
  const corBadge = excedeu ? "bg-red-400/15" : quaseExcedeu ? "bg-yellow-400/15" : "bg-white/10"
  const Icone = excedeu ? AlertCircle : quaseExcedeu ? AlertTriangle : Clock

  const temHoras = horasCarregadas && totalMinutos > 0
  const semHoras = horasCarregadas && totalMinutos === 0

  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
        <div className="md:col-span-3 rounded-2xl bg-black/20 p-5 md:p-6">
          {sucessoEdicao ? <p className="mb-4 text-sm text-green-300">{sucessoEdicao}</p> : null}

          {podeAdministrarProjeto && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                        statusAtual,
                      )}`}
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${getStatusDot(statusAtual)}`}
                      />
                      {getStatusLabel(statusAtual)}
                    </span>

                    <span className="text-xs text-slate-400">
                      Ações administrativas do projeto
                    </span>
                  </div>

                  {erroStatus ? (
                    <span className="text-sm text-red-300">{erroStatus}</span>
                  ) : null}
                </div>

                <div className="h-px w-full bg-white/10" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {statusAtual === "ATIVO" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setAcaoPendente("CONCLUIR")}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        Concluir projeto
                      </button>

                      <button
                        type="button"
                        onClick={() => setAcaoPendente("INATIVAR")}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
                      >
                        Inativar projeto
                      </button>

                      <button
                        type="button"
                        disabled={!semHoras}
                        onClick={() => semHoras && setAcaoPendente("EXCLUIR")}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Excluir projeto
                      </button>
                    </>
                  )}

                  {statusAtual === "INATIVO" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setAcaoPendente("REATIVAR")}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
                      >
                        Reativar projeto
                      </button>

                      <button
                        type="button"
                        onClick={() => setAcaoPendente("CONCLUIR")}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        Concluir projeto
                      </button>
                    </>
                  )}

                  {statusAtual === "CONCLUIDO" && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 sm:col-span-2 xl:col-span-3">
                      Projeto concluído. Nenhuma alteração de status está disponível.
                    </div>
                  )}
                </div>

                {!semHoras && statusAtual === "ATIVO" ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
                    A exclusão está indisponível porque este projeto possui horas registradas.
                  </div>
                ) : null}

                {acaoPendente ? (
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {getTituloConfirmacao(acaoPendente)}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {getMensagemConfirmacao(acaoPendente, semHoras)}
                        </p>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setAcaoPendente(null)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          disabled={processandoAcao || (acaoPendente === "EXCLUIR" && !semHoras)}
                          onClick={executarAcaoConfirmada}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#6627cc] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processandoAcao ? "Processando..." : "Confirmar ação"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Código
              </span>
              <div className="text-sm font-semibold text-white">{projeto.codigo}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Nome
              </span>
              <div className="text-sm font-semibold text-white">{projeto.nome}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Responsável
              </span>
              <div className="text-sm font-semibold text-white">
                {responsavel?.nome || "Carregando..."}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Data início
              </span>
              <div className="text-sm font-semibold text-white">{projeto.dataInicio}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Data fim
              </span>
              <div className="text-sm font-semibold text-white">{projeto.dataFim}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-white/50">
                Tipo do projeto
              </span>
              <div className="text-sm font-semibold text-white">{projeto.tipoProjeto}</div>
            </div>
          </div>

          {isEditando && formProjeto ? (
            <form
              onSubmit={salvarEdicao}
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
            >
              <h3 className="mb-4 text-lg font-bold text-white">Editar projeto</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Nome
                  </span>
                  <input
                    type="text"
                    value={formProjeto.nome}
                    onChange={(e) =>
                      setFormProjeto((prev) => (prev ? { ...prev, nome: e.target.value } : prev))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Código
                  </span>
                  <input
                    type="text"
                    value={formProjeto.codigo}
                    readOnly
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white opacity-60 outline-none"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Tipo
                  </span>
                  <select
                    value={formProjeto.tipoProjeto}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev
                          ? {
                              ...prev,
                              tipoProjeto: e.target.value as "HORA_FECHADA" | "ALOCACAO",
                            }
                          : prev,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  >
                    <option value="HORA_FECHADA">Hora Fechada</option>
                    <option value="ALOCACAO">Alocação</option>
                  </select>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Data início
                  </span>
                  <input
                    type="date"
                    value={formProjeto.dataInicio}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev ? { ...prev, dataInicio: e.target.value } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Data fim
                  </span>
                  <input
                    type="date"
                    value={formProjeto.dataFim}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev ? { ...prev, dataFim: e.target.value } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Valor hora base
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formProjeto.valorHoraBase}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev ? { ...prev, valorHoraBase: Number(e.target.value) || 0 } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Horas contratadas
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={formProjeto.horasContratadas}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev ? { ...prev, horasContratadas: Number(e.target.value) || 0 } : prev,
                      )
                    }
                    disabled={formProjeto.tipoProjeto !== "HORA_FECHADA"}
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition disabled:opacity-50 focus:border-[#6627cc]/70"
                  />
                </div>

                <div className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                    Responsável
                  </span>
                  <select
                    value={formProjeto.responsavelId}
                    onChange={(e) =>
                      setFormProjeto((prev) =>
                        prev ? { ...prev, responsavelId: Number(e.target.value) || 0 } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#6627cc]/70"
                  >
                    <option value={0}>Selecione</option>
                    {responsaveisDisponiveis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {erroEdicao ? (
                  <p className="md:col-span-2 text-sm text-red-300">{erroEdicao}</p>
                ) : null}

                <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#6627cc] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {salvando ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {!isEditando && !authLoading && podeEditar ? (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => void iniciarEdicao()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Editar projeto
              </button>
            </div>
          ) : null}
        </div>

        {isHoraFechada ? (
          <div className="md:col-span-3 rounded-2xl bg-black/20 px-5 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className={`flex items-center gap-2 text-sm font-medium ${corTexto}`}>
                  <Icone size={15} />
                  <span>Horas consumidas</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xl font-semibold ${corTexto}`}>
                    {horasConsumidas.toFixed(1)}h
                  </span>
                  <span className="text-sm text-white/40">/ {horasContratadas}h</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${corBadge} ${corTexto}`}
                  >
                    {percentual.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${corBarra}`}
                  style={{ width: `${Math.min(percentual, 100)}%` }}
                />
              </div>

              {(excedeu || quaseExcedeu) && (
                <p className={`text-xs ${corTexto} opacity-80`}>
                  {excedeu
                    ? `Limite excedido em ${(horasConsumidas - horasContratadas).toFixed(1)}h`
                    : `Faltam ${(horasContratadas - horasConsumidas).toFixed(1)}h para atingir o limite`}
                </p>
              )}
            </div>
          </div>
        ) : isAlocacao ? (
          <div className="md:col-span-3 rounded-2xl bg-black/20 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Clock size={15} />
                <span>Total de horas apontadas</span>
              </div>
              <span className="text-xl font-semibold text-white/80">
                {horasConsumidas.toFixed(1)}h
              </span>
            </div>
          </div>
        ) : null}

        {temHoras ? (
          <div className="md:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-slate-400">
            Este projeto possui horas registradas.
          </div>
        ) : null}
      </div>
    </>
  )
}

export default InformacoesProjeto