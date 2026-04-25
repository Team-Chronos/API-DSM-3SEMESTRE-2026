import { useEffect, useState } from "react"
import { useProjetoContext } from "../../contexts/ProjetoContext"
import { carregarPorfissionalPorId } from "../../service/servicoProfissionais"
import { carregarTarefasPorProjeto } from "../../service/servicoTarefas"
import type { Profissional } from "../../types/profissionalService"
import apiApontamento from "../../services/apiApontamento"
import { Clock, AlertTriangle, AlertCircle } from "lucide-react"

function InformacoesProjeto() {
  const { projeto } = useProjetoContext()

  const [responsavel, setResponsavel] = useState<Profissional>()
  const [totalMinutos, setTotalMinutos] = useState<number>(0)

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
  }, [projeto!.id])

  if (!projeto) return

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
        <div>coisa1</div>
        <div>coisa2</div>

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