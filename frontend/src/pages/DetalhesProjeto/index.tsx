import { useEffect, useState } from "react"
import Search from "../../components/ui/Search"
import { useProjetoContext } from "../../contexts/ProjetoContext"
import type { Tarefa } from "../../types/tarefa"
import type { Profissional } from "../../types/profissionalService"
import { carregarTarefasPorProjeto } from "../../service/servicoTarefas"
import { carregarProfissionaisPorProjeto } from "../../service/servicoProfissionais"
import { normalizarTexto } from "../../utils"
import InformacoesProjeto from "./InformacoesProjeto"

function DetalhesProjeto() {
  const { projeto } = useProjetoContext()

  const [pesquisaTarefa, setPesquisaTarefa] = useState<string>("")
  const [pesquisaProfissional, setPesquisaProfissional] = useState<string>("")

  const [tarefas, setTarefas] = useState<Tarefa[]>()
  const [profissionais, setProfissionais] = useState<Profissional[]>()

  useEffect(() => {
    async function load() {
      setTarefas(await carregarTarefasPorProjeto(projeto!.id))
      setProfissionais(await carregarProfissionaisPorProjeto(projeto!.id))
    }
    load()
  }, [projeto!.id])

  return (
    <div className="flex h-screen gap-8 p-4 text-white/95">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <div className="rounded-xl bg-white/7 p-4">
          <h3 className="mb-4 text-center text-lg">Projeto</h3>
          <InformacoesProjeto />
        </div>
        <hr className="my-2 opacity-30" />
        <div className={`mb-1 flex flex-row gap-4 rounded-xl bg-white/7 p-4`}>
          <div className={`h-9 flex-2`}>
            <Search
              placeholder="Pesquisar tarefa..."
              value={pesquisaTarefa}
              onChange={setPesquisaTarefa}
              className="h-full"
            />
          </div>
          <div className="flex flex-3 gap-2 *:flex-1 *:rounded-lg *:bg-black/21 *:p-1 *:px-2">
            <button>Tipo de Tarefa</button>
            <button>Item</button>
            <button>Profissional</button>
          </div>
        </div>
        <div className="flex flex-col gap-4 *:rounded-xl *:bg-white/7 *:px-4 *:py-8">
          {/* separa em um componente depois se quiser */}
          {tarefas && tarefas.length > 0 ? (
            tarefas
              .filter((tarefa) => {
                return normalizarTexto(tarefa.titulo).includes(normalizarTexto(pesquisaTarefa))
              })
              .map((tarefa) => (
                <div key={tarefa.id + tarefa.projetoId} className="">
                  {tarefa.titulo}
                </div>
              ))
          ) : (
            <div>Sem tarefas cadastradas</div>
          )}
        </div>
      </div>

      <div className="flex w-3/12 max-w-sm resize-x flex-col gap-4 overflow-y-auto rounded-xl bg-white/7 p-4 text-sm">
        <h3 className="text-center text-lg">Profissionais</h3>
        <hr className="opacity-30" />
        <Search
          placeholder="Pesquisar profissional..."
          value={pesquisaProfissional}
          onChange={setPesquisaProfissional}
        />
        <div className="flex flex-col gap-2">
          {/* separa em um componente depois se quiser */}
          {profissionais && profissionais.length > 0 ? (
            profissionais
              .filter((profissional) => {
                if (pesquisaProfissional === "") return true
                return normalizarTexto(profissional.nome).includes(
                  normalizarTexto(pesquisaProfissional),
                )
              })
              .map((profissional) => (
                <div
                  key={profissional.id + profissional.nome}
                  className="rounded-xl bg-black/21 px-3 py-3"
                >
                  {profissional.nome}
                </div>
              ))
          ) : (
            <div className="text-center">Sem profissionais associados</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalhesProjeto
