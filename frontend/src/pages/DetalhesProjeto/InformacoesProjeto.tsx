import { useEffect, useState } from "react"
import { useProjetoContext } from "../../contexts/ProjetoContext"
import { carregarPorfissionalPorId } from "../../service/servicoProfissionais"
import { carregarTarefasPorProjeto } from "../../service/servicoTarefas"
import type { Profissional } from "../../types/profissionalService"
import apiApontamento from "../../services/apiApontamento"
import { Clock, AlertTriangle, AlertCircle } from "lucide-react"
import profissionalService from "../../types/profissionalService"
import { ApiProjeto } from "../../service/servicoApi"

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

function InformacoesProjeto() {
  const { projeto, refetch } = useProjetoContext()

  const [responsavel, setResponsavel] = useState<Profissional>()
  const [totalMinutos, setTotalMinutos] = useState<number>(0)
  const [isEditando, setIsEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroEdicao, setErroEdicao] = useState<string | null>(null)
  const [sucessoEdicao, setSucessoEdicao] = useState<string | null>(null)
  const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<Profissional[]>([])
  const [formProjeto, setFormProjeto] = useState<FormProjeto | null>(null)

  const [erros, setErros] = useState({
    nome: "",
    codigo: "",
    tipoProjeto: "",
    valorHoraBase: "",
    horasContratadas: "",
    dataInicio: "",
    dataFim: "",
    responsavelId: "",

  })

  const validarFormulario = () => {
    if (!formProjeto) return false

    const novosErros = {
      nome: "",
      codigo: "",
      tipoProjeto: "",
      valorHoraBase: "",
      horasContratadas: "",
      dataInicio: "",
      dataFim: "",
      responsavelId: "",
    }

    if (!formProjeto.nome.trim()) {
      novosErros.nome = "Nome do projeto é obrigatório"
    } else if (formProjeto.nome.trim().length < 3) {
      novosErros.nome = "Nome deve ter no mínimo 3 caracteres"
    }

    if (!formProjeto.tipoProjeto) {
      novosErros.tipoProjeto = "Selecione o tipo do projeto"
    }

    if (formProjeto.valorHoraBase <= 0) {
      novosErros.valorHoraBase = "Valor hora deve ser maior que zero"
    }

    if (
      formProjeto.tipoProjeto === "HORA_FECHADA" &&
      formProjeto.horasContratadas <= 0
    ) {
      novosErros.horasContratadas =
        "Horas contratadas deve ser maior que zero"
    }

    if (!formProjeto.dataInicio) {
      novosErros.dataInicio = "Data de início é obrigatória"
    }

    if (!formProjeto.dataFim) {
      novosErros.dataFim = "Data final é obrigatória"
    } else if (
      formProjeto.dataInicio &&
      formProjeto.dataFim < formProjeto.dataInicio
    ) {
      novosErros.dataFim =
        "Data final deve ser maior que a data inicial"
    }

    if (formProjeto.responsavelId <= 0) {
      novosErros.responsavelId =
        "Selecione um responsável válido"
    }

    setErros(novosErros)

    return !Object.values(novosErros).some(Boolean)
  }

  useEffect(() => {
    async function load() {
      setResponsavel(await carregarPorfissionalPorId(projeto!.responsavelId))
    }
    load()
  }, [projeto!.id])

  useEffect(() => {
    async function loadHoras() {
      try {
        const tarefas = await carregarTarefasPorProjeto(projeto!.id)
        const resultados = await Promise.all(
          tarefas.map((t) => apiApontamento.get(`/registros/tarefa/${t.id}`))
        )
        const soma = resultados.reduce(
          (acc, res) => acc + (res.data.tempoMinutos ?? 0),
          0
        )
        setTotalMinutos(soma)
      } catch {
        setTotalMinutos(0)
      }
    }
    loadHoras()
  }, [projeto?.id])

  if (!projeto) return null

  const iniciarEdicao = async () => {
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
    if (!formProjeto) return

    if (!validarFormulario()) {
      return
    }

    try {
      setSalvando(true)
      setErroEdicao(null)

      await ApiProjeto.put(`/projetos/${projeto.id}`, {
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
      setErroEdicao("Não foi possível atualizar o projeto. Verifique a rota PUT no backend.")
    } finally {
      setSalvando(false)
    }
  }

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

  return (
    <>
      <div className="grid grid-cols-3 grid-rows-3 gap-y-4 *:not-first:px-4">
        <div className="col-span-2 row-span-2 rounded-xl bg-black/21 p-4">
          <div className="mb-3 flex justify-end">
            {!isEditando ? (
              <button
                type="button"
                onClick={() => void iniciarEdicao()}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
              >
                Editar projeto
              </button>
            ) : null}
          </div>

          {isEditando && formProjeto ? (
            <form onSubmit={salvarEdicao} className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-white/8 p-3">
              <div className="col-span-2">
                <span className="mb-1 block text-xs text-white/60">Nome</span>
                <input
                  type="text"
                  value={formProjeto.nome}
                  onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, nome: e.target.value } : prev))}
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                />

                {erros.nome && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.nome}
                  </p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-xs text-white/60">Código</span>
                <input
                  type="text"
                  value={formProjeto.codigo}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-md bg-black/25 px-3 py-2 opacity-60 outline-none"
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
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                >
                  <option value="HORA_FECHADA">Hora Fechada</option>
                  <option value="ALOCACAO">Alocação</option>
                </select>

                {erros.tipoProjeto && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.tipoProjeto}
                  </p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-xs text-white/60">Data Início</span>
                <input
                  type="date"
                  value={formProjeto.dataInicio}
                  onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, dataInicio: e.target.value } : prev))}
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                />
                {erros.dataInicio && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.dataInicio}
                  </p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-xs text-white/60">Data Fim</span>
                <input
                  type="date"
                  value={formProjeto.dataFim}
                  onChange={(e) => setFormProjeto((prev) => (prev ? { ...prev, dataFim: e.target.value } : prev))}
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                />
                {erros.dataFim && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.dataFim}
                  </p>
                )}
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
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                />
                {erros.valorHoraBase && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.valorHoraBase}
                  </p>
                )}
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
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none disabled:opacity-50"
                />

                {erros.horasContratadas && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.horasContratadas}
                  </p>
                )}

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
                  className="w-full rounded-md bg-black/25 px-3 py-2 outline-none"
                >
                  <option value={0}>Selecione</option>
                  {responsaveisDisponiveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>

                {erros.responsavelId && (
                  <p className="mt-1 text-sm text-red-400">
                    {erros.responsavelId}
                  </p>
                )}

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
            </form>
          ) : null}

          {sucessoEdicao ? <p className="mb-3 text-sm text-green-300">{sucessoEdicao}</p> : null}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-white/60">Código</span>
              <div>{projeto.codigo}</div>
            </div>
            <div>
              <span className="text-xs text-white/60">Nome</span>
              <div>{projeto.nome}</div>
            </div>
            <div>
              <span className="text-xs text-white/60">Responsável</span>
              <div>{responsavel?.nome || "carregando..."}</div>
            </div>
            <div>
              <span className="text-xs text-white/60">Data Início</span>
              <div>{projeto.dataInicio}</div>
            </div>
            <div>
              <span className="text-xs text-white/60">Data Fim</span>
              <div>{projeto.dataFim}</div>
            </div>
            <div>
              <span className="text-xs text-white/60">Tipo do projeto</span>
              <div>{projeto.tipoProjeto}</div>
            </div>
          </div>
        </div>
        {/* <div>coisa1</div>
        <div>coisa2</div> */}

        {isHoraFechada ? (
          <div className="col-span-3 rounded-xl bg-black/21 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-sm font-medium ${corTexto}`}>
                <Icone size={15} />
                <span>Horas consumidas</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-semibold ${corTexto}`}>
                  {horasConsumidas.toFixed(1)}h
                </span>
                <span className="text-sm text-white/40">/ {horasContratadas}h</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${corBadge} ${corTexto}`}>
                  {percentual.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
        ) : isAlocacao ? (
          <div className="col-span-3 rounded-xl bg-black/21 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Clock size={15} />
              <span>Total de horas apontadas</span>
            </div>
            <span className="text-xl font-semibold text-white/80">
              {horasConsumidas.toFixed(1)}h
            </span>
          </div>
        ) : (
          <>
            <div></div>
            <div></div>
            <div></div>
          </>
        )}
      </div>
    </>
  )
}

export default InformacoesProjeto