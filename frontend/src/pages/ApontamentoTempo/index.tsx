import { useEffect, useState } from "react"
import ApontamentoListaTarefas from "./ListaTarefas"
import type { Tarefa } from "../../types/tarefa"
import type { Item } from "../../types/item"
import TarefasInfo from "./TarefasInfo"

function ApontamentoTempo(){
  const [ tarefas, setTarefas ] = useState<Tarefa[]>()
  const [ itens, setItens ] = useState<Item[]>()
  const [ tarefaSelecionada, setTarefaSelecionada ] = useState<Tarefa>()

  async function buscarTarefas() {
    try {
      setTarefas([
        {
          id: 1,
          titulo: "Implementar login",
          descricao: "Criar autenticação com JWT",
          tempoMaximoMinutos: 250,
          status: "pendente",
          responsavel_id: 1,
          item_id: 0
        },
        {
          id: 2,
          titulo: "Criar tela de dashboard",
          descricao: "Layout inicial com gráficos",
          tempoMaximoMinutos: 140,
          status: "em andamento",
          responsavel_id: 2,
          item_id: 1
        },
        {
          id: 3,
          titulo: "Configurar banco de dados",
          tempoMaximoMinutos: 110,
          status: "concluido",
          responsavel_id: 1,
          item_id: 2
        },
        {
          id: 4,
          titulo: "Implementar API de tarefas",
          descricao: "CRUD completo de tarefas",
          tempoMaximoMinutos: 150,
          status: "pendente",
          responsavel_id: 3,
          item_id: 0
        },
        {
          id: 5,
          titulo: "Adicionar validações",
          descricao: "Validar inputs no frontend",
          tempoMaximoMinutos: 270,
          status: "em andamento",
          responsavel_id: 2,
          item_id: 1
        },
        {
          id: 6,
          titulo: "Deploy da aplicação",
          tempoMaximoMinutos: 37,
          status: "pendente",
          responsavel_id: 3,
          item_id: 2
        }
      ])
    } catch (error: any) {
      console.error("Erro ao buscar tarefas")
    }
  }

  async function buscarItens() {
    if (!tarefas)
      return

    try {
      const itens: Item[] = [
        {
          id: 0,
          nome: "Sem item",
          descricao: "Tarefas não relacionadas a um item"
        },
        {
          id: 1,
          nome: "Frontend",
          descricao: "Tarefas relacionadas à interface do usuário e experiência"
        },
        {
          id: 2,
          nome: "DevOps",
          descricao: "Tarefas de deploy, infraestrutura e integração contínua"
        }
      ]
      setItens(itens.filter(item =>
        tarefas.some(tarefa => tarefa.item_id == item.id)
      ))
    } catch (error: any) {
      console.error("Erro ao buscar itens")
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
              <TarefasInfo reloadTarefas={buscarTarefas} tarefa={tarefaSelecionada} item={itens?.find((item) => item.id == tarefaSelecionada.item_id)} setTarefa={setTarefaSelecionada} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ApontamentoTempo