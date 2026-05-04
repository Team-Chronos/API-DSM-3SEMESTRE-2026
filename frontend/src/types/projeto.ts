
export type TipoProjeto = "HORA_FECHADA" | "ALOCACAO"

export type Projeto = {
  id: number
  nome: string
  codigo: string
  tipoProjeto: TipoProjeto
  valorHoraBase: number
  horasContratadas?: number
  valorTotal?: number
  dataInicio: string
  dataFim: string
  responsavelId: number
}

export type ProfissionaisAssociados = {
  projetoId: number
  usuarioId: number
  valorHora: number
}