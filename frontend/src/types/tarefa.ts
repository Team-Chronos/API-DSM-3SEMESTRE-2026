export type Tarefa = {
  id: number,
  titulo: String,
  descricao?: String,
  tempoMaximoMinutos: number,
  status: String
  
  responsavelId?: number,
  itemId?: number
  projetoId: number
  tipoTarefaId: number
}