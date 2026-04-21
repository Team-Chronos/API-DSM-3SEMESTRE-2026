import type { TipoTarefa } from "../../../../types/tipoTarefa";

export function getNomeTipoTarefa(
  tipoTarefaId: number,
  tiposTarefa?: TipoTarefa[]
): string {
  if (!tiposTarefa) return "Não definido";

  const tipo = tiposTarefa.find(t => t.id === tipoTarefaId);
  return tipo?.nome || "Desconhecido";
}