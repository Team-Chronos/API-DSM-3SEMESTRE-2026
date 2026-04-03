import type { DashboardData, ProjetoFinanceiro, ProfissionalGanhos } from "../types/financeiro";

export const dashboardMock: DashboardData = {
  totalHoras: 26.5,
  custoTotal: 3163,
  totalProjetos: 4,
  tarefasConcluidas: 5,
  projetosConcluidos: 2,
  totalDesenvolvedores: 4,
};

export const projetosMock: ProjetoFinanceiro[] = [
  {
    projetoId: 1,
    nomeProjeto: "App Mobile",
    tipoProjeto: "Fechado",
    totalHoras: 4,
    custoTotal: 600,
  },
  {
    projetoId: 2,
    nomeProjeto: "Portal RH",
    tipoProjeto: "Fechado",
    totalHoras: 5.5,
    custoTotal: 523,
  },
  {
    projetoId: 3,
    nomeProjeto: "Sistema Financeiro",
    tipoProjeto: "Alocado",
    totalHoras: 12,
    custoTotal: 1440,
  },
  {
    projetoId: 4,
    nomeProjeto: "Portal Administrativo",
    tipoProjeto: "Fechado",
    totalHoras: 5,
    custoTotal: 600,
  },
  {
    projetoId: 5,
    nomeProjeto: "Teste",
    tipoProjeto: "Fechado",
    totalHoras: 5,
    custoTotal: 600,
  }
];

export const profissionaisMock: ProfissionalGanhos[] = [
  {
    usuarioId: 3,
    usuarioNome: "Enzo Code",
    projetos: [
      {
        projetoId: 1,
        nomeProjeto: "App Mobile",
        horasTrabalhadas: 4,
        valorHoraProjeto: 150,
        valorBaseCalculado: 600,
      },
      {
        projetoId: 5,
        nomeProjeto: "Teste",
        horasTrabalhadas: 6,
        valorHoraProjeto: 150,
        valorBaseCalculado: 600,
      }
    ],
    totalSemBonus: 600,
    bonusAplicado: 0,
    totalComBonus: 600,
  },
  {
    usuarioId: 5,
    usuarioNome: "Joao Moura",
    projetos: [
      {
        projetoId: 4,
        nomeProjeto: "Portal Administrativo",
        horasTrabalhadas: 4,
        valorHoraProjeto: 120,
        valorBaseCalculado: 480,
      },
    ],
    totalSemBonus: 480,
    bonusAplicado: 0,
    totalComBonus: 480,
  },
  {
    usuarioId: 1,
    usuarioNome: "Ana Rubim",
    projetos: [
      {
        projetoId: 3,
        nomeProjeto: "Sistema Financeiro",
        horasTrabalhadas: 8,
        valorHoraProjeto: 120,
        valorBaseCalculado: 960,
      },
    ],
    totalSemBonus: 960,
    bonusAplicado: 0,
    totalComBonus: 960,
  },
  {
    usuarioId: 2,
    usuarioNome: "Rafael Sette",
    projetos: [
      {
        projetoId: 2,
        nomeProjeto: "Portal RH",
        horasTrabalhadas: 10.5,
        valorHoraProjeto: 95,
        valorBaseCalculado: 997.5,
      },
    ],
    totalSemBonus: 997.5,
    bonusAplicado: 0,
    totalComBonus: 997.5,
  },
];