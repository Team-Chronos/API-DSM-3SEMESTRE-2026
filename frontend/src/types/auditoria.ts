export type AuditoriaModulo = "todos" | "profissionais" | "projetos" | "tarefas";
export type AuditoriaModuloRegistro = "profissionais" | "projetos" | "tarefas" | "sistema";
export type AuditoriaTipoEvento = "todos" | "login" | "criacao" | "atualizacao" | "remocao";

export interface AuditoriaResponsavel {
  id: number | null;
  nome: string;
  email: string;
}

export interface AuditoriaRegistro {
  id: string;
  codigo: string;
  modulo: AuditoriaModuloRegistro;
  local: string;
  acao: string;
  campo: string;
  valorAnterior: string;
  novoValor: string;
  dataHora: string;
  responsavel: AuditoriaResponsavel;
  descricao: string;
  entidadeId: number | null;
  tabela: string;
  origem: string;
}

export interface AuditoriaTarefaApiRegistro {
  id: number;
  usuarioAutor: number | null;
  nomeTabelaModificada: string | null;
  entidadeId: number | null;
  campoAlterado: string | null;
  valorAnterior: string | null;
  novoValor: string | null;
  tipoOperacao: string | null;
  dataAlteracao: string | null;
}
