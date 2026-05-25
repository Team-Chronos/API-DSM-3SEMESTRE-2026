export type TipoProjeto = "HORA_FECHADA" | "ALOCACAO";
export type StatusProjeto = "ATIVO" | "INATIVO" | "CONCLUIDO";

export type Projeto = {
  id: number;
  nome: string;
  codigo: string;
  tipoProjeto: TipoProjeto;
  valorHoraBase: number;
  horasContratadas?: number | null;
  valorTotal?: number;
  dataInicio: string;
  dataFim: string;
  responsavelId: number;
  status: StatusProjeto;
};

export type ProfissionaisAssociados = {
  projetoId: number;
  usuarioId: number;
  valorHora: number;
};