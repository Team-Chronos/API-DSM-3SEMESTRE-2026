export type RegistroHoras = {
  id: number,
  tarefa_id: number,
  data_inicio: string,
  data_fim?: string,
  tempoMinutos?: number
}

export type RegistroHorasTarefa = {
  registros: RegistroHoras[],
  tempoMinutos?: number
}