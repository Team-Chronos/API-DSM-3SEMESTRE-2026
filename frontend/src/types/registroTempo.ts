export type RegistroHoras = {
  id: number,
  tarefa_id: number,
  data_inicio: String,
  data_fim?: String,
  tempoMinutos?: number
}

export type RegistroHorasTarefa = {
  registros: RegistroHoras,
  tempoMinutos?: number
}