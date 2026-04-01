export interface DashboardData {
  totalHoras: number;
  custoTotal: number;
  totalProjetos: number;
  tarefasConcluidas: number;
  projetosConcluidos: number;
  totalDesenvolvedores: number;
}

export interface ProjetoFinanceiro {
  projetoId: number;
  nomeProjeto: string;
  tipoProjeto: string;
  totalHoras: number;
  custoTotal: number;
}

export interface ProjetoProfissional {
  projetoId: number;
  nomeProjeto: string;
  horasTrabalhadas: number;
  valorHoraProjeto: number;
  valorBaseCalculado: number;
}

export interface ProfissionalGanhos {
  usuarioId: number;
  usuarioNome: string;
  projetos: ProjetoProfissional[];
  totalSemBonus: number;
  bonusAplicado: number;
  totalComBonus: number;
}

export interface ProjetoProfissionais {
  usuarioId: number;
  usuarioNome: string;
  horasTrabalhadas: number;
  valorHoraProjeto: number;
  valorBaseCalculado: number;
}

export interface ProjetoDetalhe {
  projetoId: number;
  nomeProjeto: string;
  tipoProjeto: string;
  totalHoras: number;
  custoTotal: number;
  valorHoraProjeto: number;
  totalProfissionais: number;
  profissionais: ProjetoProfissionais[];
}