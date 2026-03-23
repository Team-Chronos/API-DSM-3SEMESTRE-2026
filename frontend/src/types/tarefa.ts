export type Tarefa = {
  id: number,
  titulo: String,
  descricao?: String,
  tempoMaximoMinutos: number,
  status: String
  
  responsavel_id?: number,
  item_id?: number
}