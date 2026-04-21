import { useEffect, useState } from "react"
import { useProjetoContext } from "../../contexts/ProjetoContext"
import { carregarPorfissionalPorId } from "../../service/servicoProfissionais"
import type { Profissional } from "../../types/profissionalService"

function InformacoesProjeto() {
  const { projeto } = useProjetoContext()

  const [responsavel, setResponsavel] = useState<Profissional>()

  useEffect(() => {
    async function load() {
      setResponsavel(await carregarPorfissionalPorId(projeto!.responsavelId))
    }
    load()
  }, [projeto!.id])

  // projeto sempre vai existir quando chegar nessa merda, isso é só pro ts saber
  if (!projeto) return

  return (
    <>
      {/* 
        pega a visão

        info   info   coisa1
        info   info   coisa2
        coisa4 coisa5 coisa6
      */}
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
        <div>coisa3</div>
        <div>coisa4</div>
        <div>coisa5</div>
      </div>
    </>
  )
}

export default InformacoesProjeto
