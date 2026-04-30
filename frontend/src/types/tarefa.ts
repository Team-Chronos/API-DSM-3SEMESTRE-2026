export type Tarefa = {
  id: number,
  titulo: string,
  descricao?: string,
  tempoMaximoMinutos: number,
  status: string
  
  responsavelId?: number,
  itemId?: number
  projetoId: number
  tipoTarefaId: number
}