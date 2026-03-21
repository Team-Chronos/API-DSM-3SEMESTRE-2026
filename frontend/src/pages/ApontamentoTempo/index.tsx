import { useState } from "react"
import LinhaTempo from "../../components/LinhaTempo"
import ApontamentoListaTarefas from "../../components/ApontamentoListaTarefas"
import type { Tarefa } from "../../types/tarefa"
import type { Item } from "../../types/item"

function ApontamentoTempo(){
  const [ tarefas, setTarefas ] = useState<Tarefa[]>([
  {
    id: 1,
    titulo: "Implementar login",
    descricao: "Criar autenticação com JWT",
    prazo: "2026-03-25",
    status: "pendente",
    responsavel_id: 1,
    item_id: 0
  },
  {
    id: 2,
    titulo: "Criar tela de dashboard",
    descricao: "Layout inicial com gráficos",
    prazo: "2026-03-28",
    status: "em andamento",
    responsavel_id: 2,
    item_id: 1
  },
  {
    id: 3,
    titulo: "Configurar banco de dados",
    prazo: "2026-03-22",
    status: "concluido",
    responsavel_id: 1,
    item_id: 2
  },
  {
    id: 4,
    titulo: "Implementar API de tarefas",
    descricao: "CRUD completo de tarefas",
    prazo: "2026-03-30",
    status: "pendente",
    responsavel_id: 3,
    item_id: 0
  },
  {
    id: 5,
    titulo: "Adicionar validações",
    descricao: "Validar inputs no frontend",
    prazo: "2026-03-27",
    status: "em andamento",
    responsavel_id: 2,
    item_id: 1
  },
  {
    id: 6,
    titulo: "Deploy da aplicação",
    prazo: "2026-04-01",
    status: "pendente",
    responsavel_id: 3,
    item_id: 2
  }
])
  const [ itens, setItens ] = useState<Item[]>([
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
])
  
  return(
    <>
      <div className={`w-full p-4`}>
        <div className={`w-full h-full flex flex-row bg-mist-900 rounded-lg p-4`}>
          <div className={`grow max-w-4/12 xl:max-w-3/12 min-w-max bg-mist-800 rounded-bl-md rounded-tl-md border-r-2 border-r-mist-700`}>
            <ApontamentoListaTarefas tarefas={tarefas} itens={itens} />
          </div>
          <div className={`grow bg-mist-800 rounded-br-md rounded-tr-md`}>
          </div>
        </div>
      </div>
    </>
  )
}

export default ApontamentoTempo