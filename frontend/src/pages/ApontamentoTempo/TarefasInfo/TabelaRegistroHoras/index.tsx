import type { RegistroHorasTarefa } from "../../../../types/registroTempo";

interface TabelaRegistroHorasProps {
  registroHorasTarefa?: RegistroHorasTarefa;
}

function TabelaRegistroHoras({ registroHorasTarefa }: TabelaRegistroHorasProps) {
  const formatarData = (data: string | Date | undefined) => {
    if (!data) return undefined;

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
    if (!data) return undefined;

    const date = new Date(data);

    return date.toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarMinutos = (minutos?: number | null) => {
    if (!minutos) return "Pendente";

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (horas === 0) return `${resto}min`;
    if (resto === 0) return `${horas}h`;

    return `${horas}h ${resto}min`;
  };

  if (!registroHorasTarefa?.registros?.length) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center bg-[#1f1f24] p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6627cc]/15 text-violet-300">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-white">
          Sem registros de tempo
        </h3>

        <p className="mt-2 max-w-md text-sm text-slate-400">
          Esta tarefa ainda não tem apontamentos cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#1f1f24]">
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-white/10 bg-[#26262b]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Data início
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Data fim
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Período
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Duração
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {[...registroHorasTarefa.registros]
            .sort(
              (a, b) =>
                new Date(b.data_inicio).getTime() -
                new Date(a.data_inicio).getTime(),
            )
            .map((registro) => (
              <tr
                key={registro.id}
                className="transition hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 text-sm text-slate-300">
                  {formatarData(registro.data_inicio)}
                </td>

                <td className="px-4 py-3 text-sm text-slate-300">
                  {formatarData(registro.data_fim) || (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-200">
                      Pendente
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-slate-300">
                  {formatarHora(registro.data_inicio)} —{" "}
                  {formatarHora(registro.data_fim) || "Pendente"}
                </td>

                <td className="px-4 py-3 text-sm font-bold text-white">
                  {formatarMinutos(registro.tempoMinutos)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaRegistroHoras;