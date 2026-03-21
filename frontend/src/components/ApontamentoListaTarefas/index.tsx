import type { Tarefa } from "../../types/tarefa"
import type { Item } from "../../types/item"

interface ApontamentoListaTarefasProps {
  tarefas?: Tarefa[],
  itens?: Item[],
}

function ApontamentoListaTarefas({ tarefas, itens }: ApontamentoListaTarefasProps){

  return(
    <>
      <div className={`flex flex-col p-4 gap-y-6`}>
        <div className={`flex items-center gap-4`}>
          <img src="" alt="" className={`bg-mist-100 w-10 h-10 rounded-full`} />
          <div>
            <h3>nome profissional</h3>
          </div>
        </div>
        <ul className={`flex flex-col gap-4`}>
          {itens?.map((item) => (
            <li key={item.id} className={`flex flex-col gap-y-2`}>
              <h4 className={`font-medium`}>{item.nome}</h4>
              <ul className={`flex flex-col gap-y-2 pl-3`}>
              {tarefas
                ?.filter((tarefa) => tarefa.item_id === item.id)
                .map((tarefa) => (
                  <li key={tarefa.id}>
                    <h5 className={`text-sm`}>{tarefa.titulo}</h5>
                  </li>
              ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default ApontamentoListaTarefas