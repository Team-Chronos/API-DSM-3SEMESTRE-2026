import { useEffect, useState } from "react"
import { projetoService } from "../../services/gateway"
import { useAuth } from "../../contexts/AuthContext"

type TipoProjeto = "HORA_FECHADA" | "ALOCACAO"

type Props = {
  aberto: boolean
  onFechar: () => void
  onProjetoCadastrado: () => void
}

type FormProjeto = {
  nome: string
  codigo: string
  tipoProjeto: TipoProjeto
  valorHoraBase: number
  horasContratadas: number
  dataInicio: string
  dataFim: string
  responsavelId: number
}

type ProjetoExistente = {
  id?: number
  codigo?: string
}

function extrairNumeroCodigo(codigo?: string) {
  if (!codigo) return null
  const match = codigo.match(/^PRJ(\d{4})$/)
  if (!match) return null
  return Number(match[1])
}

function formatarCodigoProjeto(numero: number) {
  return `PRJ${String(numero).padStart(4, "0")}`
}

function gerarProximoCodigo(projetos: ProjetoExistente[]) {
  const numeros = projetos
    .map((projeto) => extrairNumeroCodigo(projeto.codigo))
    .filter((numero): numero is number => numero !== null)

  let proximo = numeros.length > 0 ? Math.max(...numeros) + 1 : 1
  let codigo = formatarCodigoProjeto(proximo)
  const codigosExistentes = new Set(
    projetos.map((projeto) => projeto.codigo).filter((codigo): codigo is string => Boolean(codigo)),
  )

  while (codigosExistentes.has(codigo)) {
    proximo += 1
    codigo = formatarCodigoProjeto(proximo)
  }

  return codigo
}

function extrairMensagemErro(body: unknown) {
  if (!body || typeof body !== "object") return null

  const data = body as {
    message?: string
    mensagem?: string
    erro?: string
    errors?: Record<string, string>
    erros?: Record<string, string>
  }

  return (
    data.message ||
    data.mensagem ||
    data.erro ||
    data.errors?.codigo ||
    data.erros?.codigo ||
    null
  )
}

function ehErroCodigoDuplicado(status: number, mensagem: string | null) {
  if (status === 409) return true
  if (status === 400 && mensagem) {
    const texto = mensagem.toLowerCase()
    return texto.includes("código já existe") || texto.includes("codigo já existe")
  }
  return false
}

export default function ModalCadastro({
  aberto,
  onFechar,
  onProjetoCadastrado,
}: Props) {
  const { user } = useAuth()

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [gerandoCodigo, setGerandoCodigo] = useState(false)

  const [form, setForm] = useState<FormProjeto>({
    nome: "",
    codigo: "",
    tipoProjeto: "ALOCACAO",
    valorHoraBase: 0,
    horasContratadas: 0,
    dataInicio: "",
    dataFim: "",
    responsavelId: 0,
  })

  async function buscarProximoCodigoDisponivel() {
    const response = await projetoService.listar()
    if (!response.ok) {
      throw new Error("Não foi possível consultar os projetos para gerar o código.")
    }

    const projetos = (await response.json()) as ProjetoExistente[]
    return gerarProximoCodigo(Array.isArray(projetos) ? projetos : [])
  }

  useEffect(() => {
    async function inicializarModal() {
      if (!aberto) return

      setErro(null)
      setGerandoCodigo(true)

      try {
        const codigoGerado = await buscarProximoCodigoDisponivel()

        setForm({
          nome: "",
          codigo: codigoGerado,
          tipoProjeto: "ALOCACAO",
          valorHoraBase: 0,
          horasContratadas: 0,
          dataInicio: "",
          dataFim: "",
          responsavelId: Number(user?.id ?? 0),
        })
      } catch {
        setForm({
          nome: "",
          codigo: "PRJ0001",
          tipoProjeto: "ALOCACAO",
          valorHoraBase: 0,
          horasContratadas: 0,
          dataInicio: "",
          dataFim: "",
          responsavelId: Number(user?.id ?? 0),
        })
      } finally {
        setGerandoCodigo(false)
      }
    }

    void inicializarModal()
  }, [aberto, user?.id])

  if (!aberto) return null

  function atualizarCampo<K extends keyof FormProjeto>(campo: K, valor: FormProjeto[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function validar() {
    if (!form.nome.trim()) return "Informe o nome do projeto."
    if (!form.codigo.trim()) return "Informe o código do projeto."
    if (!/^PRJ\d{4}$/.test(form.codigo.trim())) return "O código deve estar no padrão PRJ0001."
    if (!form.dataInicio) return "Informe a data de início."
    if (!form.dataFim) return "Informe a data de fim."
    if (!form.responsavelId) return "Não foi possível identificar o responsável."
    if (form.valorHoraBase <= 0) return "Informe um valor hora base maior que zero."

    if (form.tipoProjeto === "HORA_FECHADA" && form.horasContratadas <= 0) {
      return "Para projeto de hora fechada, informe horas contratadas maiores que zero."
    }

    if (form.dataFim < form.dataInicio) {
      return "A data fim não pode ser menor que a data de início."
    }

    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const mensagemErro = validar()
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    try {
      setSalvando(true)
      setErro(null)

      let codigoAtual = form.codigo.trim()
      const tentativasMaximas = 5

      for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa += 1) {
        if (!codigoAtual) {
          codigoAtual = await buscarProximoCodigoDisponivel()
        }

        const payload = {
          nome: form.nome.trim(),
          codigo: codigoAtual,
          tipoProjeto: form.tipoProjeto,
          valorHoraBase: Number(form.valorHoraBase),
          horasContratadas:
            form.tipoProjeto === "HORA_FECHADA" ? Number(form.horasContratadas) : null,
          dataInicio: form.dataInicio,
          dataFim: form.dataFim,
          responsavelId: Number(form.responsavelId),
        }

        console.log(payload)

        const res = await projetoService.criar(payload)

        if (res.ok) {
          onProjetoCadastrado()
          onFechar()
          return
        }

        const body = await res.json().catch(() => null)
        const mensagem = extrairMensagemErro(body)

        if (ehErroCodigoDuplicado(res.status, mensagem)) {
          codigoAtual = await buscarProximoCodigoDisponivel()
          setForm((prev) => ({ ...prev, codigo: codigoAtual }))
          continue
        }

        throw new Error(mensagem ?? "Não foi possível cadastrar o projeto.")
      }

      throw new Error("Não foi possível gerar um código de projeto disponível. Tente novamente.")
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível cadastrar o projeto.",
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#232329] text-white shadow-2xl overflow-y-auto max-h-full">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300/80">
              Projetos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Novo projeto</h2>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
              placeholder="Digite o nome do projeto"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Código</label>
            <input
              type="text"
              value={gerandoCodigo ? "Gerando..." : form.codigo}
              readOnly
              disabled
              className="h-12 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-slate-300 opacity-70 outline-none"
              placeholder="PRJ0001"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Tipo</label>
            <select
              value={form.tipoProjeto}
              onChange={(e) => atualizarCampo("tipoProjeto", e.target.value as TipoProjeto)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
            >
              <option value="ALOCACAO">Alocação</option>
              <option value="HORA_FECHADA">Hora fechada</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Data início</label>
            <input
              type="date"
              value={form.dataInicio}
              onChange={(e) => atualizarCampo("dataInicio", e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Data fim</label>
            <input
              type="date"
              value={form.dataFim}
              onChange={(e) => atualizarCampo("dataFim", e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Valor hora base</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.valorHoraBase}
              onChange={(e) => atualizarCampo("valorHoraBase", Number(e.target.value || 0))}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Horas contratadas</label>
            <input
              type="number"
              min={0}
              value={form.horasContratadas}
              onChange={(e) => atualizarCampo("horasContratadas", Number(e.target.value || 0))}
              disabled={form.tipoProjeto !== "HORA_FECHADA"}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition disabled:opacity-50 focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
              placeholder={form.tipoProjeto === "HORA_FECHADA" ? "Informe as horas" : "Não se aplica"}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Responsável</label>
            <input
              type="text"
              value={user?.nome ?? "Usuário logado"}
              disabled
              className="h-12 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-slate-300 opacity-70 outline-none"
            />
            <p className="mt-2 text-xs text-slate-400">
              O responsável inicial do projeto é quem está criando o cadastro.
            </p>
          </div>

          {erro && (
            <div className="md:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando || gerandoCodigo}
              className="h-11 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6627cc] px-5 text-sm font-bold text-white shadow-lg shadow-purple-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}