// src/pages/ApontamentoTempo/TarefasInfo/TabelaRegistroHoras.tsx
import type { RegistroHorasTarefa } from "../../../../types/registroTempo";

interface TabelaRegistroHorasProps {
  registroHorasTarefa?: RegistroHorasTarefa;
}

function TabelaRegistroHoras({ registroHorasTarefa }: TabelaRegistroHorasProps) {
  const formatarData = (data: string | Date | undefined) => {
    if (!data) return;
    const date = new Date(data);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarHora = (data: string | Date | undefined) => {
    if (!data) return;
    const date = new Date(data);
    return date.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!registroHorasTarefa?.registros?.length) {
    return <div>Esta tarefa ainda não tem um registro de tempo</div>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Data início</th>
          <th>Data fim</th>
          <th>Tempo</th>
          <th>Duração (min)</th>
        </tr>
      </thead>
      <tbody>
        {registroHorasTarefa.registros
          .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())
          .map((registro) => (
            <tr key={registro.id} className="text-center">
              <td className="px-3 py-1 text-sm">{formatarData(registro.data_inicio)}</td>
              <td className="px-3 py-1 text-sm">{formatarData(registro.data_fim) || "Pendente"}</td>
              <td className="px-3 py-1 text-nowrap">
                {formatarHora(registro.data_inicio)} - {formatarHora(registro.data_fim)}
              </td>
              <td className="px-3 py-1">{registro.tempoMinutos || "Pendente"}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export default TabelaRegistroHoras;