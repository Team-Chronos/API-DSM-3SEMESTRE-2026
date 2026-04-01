import { useEffect, useState } from "react"
import ApontamentoListaTarefas from "./ListaTarefas"
import type { Tarefa } from "../../types/tarefa"
import type { Item } from "../../types/item"
import TarefasInfo from "./TarefasInfo"
import { toast } from "react-toastify"
import axios from "axios"
import { useParams } from "react-router-dom"

function ApontamentoTempo(){
  const { projetoId } = useParams();

  const [ tarefas, setTarefas ] = useState<Tarefa[]>()
  const [ itens, setItens ] = useState<Item[]>()
  const [ tarefaSelecionada, setTarefaSelecionada ] = useState<Tarefa>()

  async function buscarTarefas() {
    try {
      const response = await axios.get<Tarefa[]>(`http://192.168.137.104:8089/tarefas/projeto/${projetoId}/responsavel/${2}`)
      setTarefas(response.data)
    } catch (error: any) {
      toast.error("Erro ao buscar tarefas", {autoClose: 2000})
      console.error("Erro ao buscar tarefas", error)
    }
  }

  async function buscarItens() {
    if (!tarefas)
      return

    try {
      const response = await axios.get<Item[]>(`http://192.168.137.104:8089/itens/projeto/${projetoId}/responsavel/${2}`)
      setItens(response.data)
    } catch (error: any) {
      toast.error("Erro ao buscar itens", {autoClose: 2000})
      console.error("Erro ao buscar itens", error)
    }
  }

  useEffect(() => {
    buscarTarefas()
  }, [])

  useEffect(() => {
    buscarItens()
  }, [tarefas])
  
  return(
    <>
      <div className={`w-full p-4 text-gray-50`}>
        <div className={`w-full h-full flex flex-row bg-mist-900 rounded-lg p-4`}>
          <div className={`grow max-w-4/12 xl:max-w-3/12 min-w-max bg-mist-800 rounded-bl-md rounded-tl-md border-r-2 border-r-mist-700`}>
            <ApontamentoListaTarefas tarefas={tarefas} itens={itens} setTarefa={setTarefaSelecionada} />
          </div>
          <div className={`grow bg-mist-800 rounded-br-md rounded-tr-md`}>
            {tarefaSelecionada && (
              <TarefasInfo reloadTarefas={buscarTarefas} tarefa={tarefaSelecionada} item={itens?.find((item) => item.idItem == tarefaSelecionada.itemId)} setTarefa={setTarefaSelecionada} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ApontamentoTempo