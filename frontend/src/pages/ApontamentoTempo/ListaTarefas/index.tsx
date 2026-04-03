import type { Tarefa } from "../../../types/tarefa"
import type { Item } from "../../../types/item"
import { useEffect, useState } from "react"

interface ApontamentoListaTarefasProps {
  tarefas?: Tarefa[],
  itens?: Item[],
  setTarefa: (tarefa: Tarefa) => void
}

function ApontamentoListaTarefas({ tarefas, itens, setTarefa }: ApontamentoListaTarefasProps){
  const [aberto, setAberto] = useState<number | null>(null)
  const [ tarefasSemItem, setTarefasSemItem ] = useState<Tarefa[]>()
  
  function toggleItem(id: number | string) {
    const numId = Number(id)
    setAberto(prev => prev === numId ? null : numId)
  }
  
  useEffect(() => {
    setTarefasSemItem(tarefas?.filter((tarefa) => tarefa.itemId == null))
  }, [tarefas, itens])

  return(
    <>
      <div className={`flex flex-col p-4 gap-y-6`}>
        <div className={`flex items-center gap-4`}>
          <img src="" alt="" className={`bg-mist-100 w-10 h-10 rounded-full`} />
          <div>
            <h2>nome profissional</h2>
          </div>
        </div>
        <ul className={`flex flex-col gap-4 max-h-96 overflow-y-auto p-0.5`}>
          {itens?.map((item) => (
            <li key={item.idItem} className={`flex flex-col gap-y-2`}>
              <button
                onClick={() => {
                  toggleItem(item.idItem)
                }}                
              >
                <h3 className="font-medium text-left hover:text-white cursor-pointer">{item.nome}</h3>
              </button>
              {(aberto === Number(item.idItem)) && (
                <ul key={item.idItem*-1} className={`flex flex-col gap-y-1 pl-3`}>
                {tarefas
                  ?.filter((tarefa) => tarefa.itemId === item.idItem)
                  .map((tarefa) => (
                    <li key={tarefa.id}>
                      <button className={`cursor-pointer hover:text-white`} onClick={() => setTarefa(tarefa)}>
                        <h4 className={`text-sm`}>{tarefa.titulo}</h4>
                      </button>
                    </li>
                ))}
                </ul>
              )}
            </li>
          ))}
          {tarefasSemItem && (
            <li className={`flex flex-col gap-y-2`}>
              <h3 className="font-medium text-left">Sem item</h3>
              <ul className={`flex flex-col gap-y-1 pl-3`}>
                {tarefasSemItem
                  ?.map((tarefa) => (
                    <li key={tarefa.id}>
                      <button className={`cursor-pointer hover:text-white`} onClick={() => setTarefa(tarefa)}>
                        <h4 className={`text-sm`}>{tarefa.titulo}</h4>
                      </button>
                    </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>
    </>
  )
}

export default ApontamentoListaTarefas