export type AuditoriaModulo = "todos" | "profissionais" | "projetos" | "tarefas";
export type AuditoriaModuloRegistro = "profissionais" | "projetos" | "tarefas";
export type AuditoriaTipoEvento = "todos" | "criacao" | "atualizacao" | "remocao";

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
  usuarioAutor: number | null;
  autorNome?: string | null;
  autorEmail?: string | null;
  autorCargoId?: number | null;
  descricao: string;
  entidadeId: number | null;
  tabela: string;
  origem: AuditoriaModuloRegistro;
}

export interface AuditoriaApiRegistro {
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
