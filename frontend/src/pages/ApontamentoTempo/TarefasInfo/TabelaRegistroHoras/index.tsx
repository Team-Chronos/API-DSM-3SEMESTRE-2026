import type { RegistroHorasTarefa } from "../../../../types/registroTempo"

interface TabelaRegistroHorasProps {
  registroHorasTarefa?: RegistroHorasTarefa
}

function TabelaRegistroHoras({ registroHorasTarefa }: TabelaRegistroHorasProps){

  function formatarData(data: string | Date | undefined){
    if (!data) return

    const date = new Date(data)
    return date.toLocaleString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return(
    <>
      {registroHorasTarefa?.registros?.length !== 0 ? (
        <table className={`w-full`}>
          <thead>
            <tr>
              <th>Data início</th>
              <th>Data fim</th>
              <th>Tempo (min)</th>
            </tr>
          </thead>
          <tbody>
            {registroHorasTarefa?.registros
              .slice().sort((a, b) => 
                new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
              )
              .map(registro => (
                <tr key={registro.id}
                  className={`text-center`}
                >
                  <td className={`px-3 py-1`}>{formatarData(registro.data_inicio)}</td>
                  <td className={`px-3 py-1`}>{formatarData(registro.data_fim) || "Pendente"}</td>
                  <td className={`px-3 py-1`}>{registro.tempoMinutos || "Pendente"}</td>
                </tr>
              ))
            }
            
          </tbody>
        </table>
      )
      : (
        <div>Esta tarefa ainda não tem um registro de tempo</div>
      )}
    </>
  )
}

export default TabelaRegistroHoras