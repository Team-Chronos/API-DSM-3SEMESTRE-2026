import { request } from "../api/api";

export type ProjetoDisponivel = {
  id: number;
  nome: string;
  codigo: string;
  valorHoraBase: number;
};

export type ProjetoVinculoPayload = {
  projetoId: number;
  valorHora: number;
};

export type ProfissionalPayload = {
  nome: string;
  email: string;
  senhaHash: string;
  ativo: boolean;
  cargoId: number;
  projetos: ProjetoVinculoPayload[];
};

export type ProfissionalResposta = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  cargoId: number;
  projetos: Array<{
    projetoId: number;
    nomeProjeto: string;
    codigoProjeto: string;
    valorHora: number;
  }>;
};

export type ProjetoVinculadoResposta = {
  projetoId: number;
  nomeProjeto: string;
  codigoProjeto: string;
  valorHora: number;
};

export function listarProjetos(): Promise<ProjetoDisponivel[]> {
  return request<ProjetoDisponivel[]>("/profissionais/projetos", { method: "GET" });
}

export function listarProfissionais(): Promise<ProfissionalResposta[]> {
  return request<ProfissionalResposta[]>("/profissionais", { method: "GET" });
}

export function listarProjetosVinculados(profissionalId: number): Promise<ProjetoVinculadoResposta[]> {
  return request<ProjetoVinculadoResposta[]>(`/profissionais/${profissionalId}/projetos`, {
    method: "GET",
  });
}

export function vincularProjetoAoProfissional(
  profissionalId: number,
  projetoId: number,
  valorHora: number
): Promise<void> {
  return request<void>(`/profissionais/${profissionalId}/projetos/${projetoId}`, {
    method: "POST",
    body: { valorHora },
  });
}

export function cadastrarProfissional(payload: ProfissionalPayload): Promise<ProfissionalResposta> {
  return request<ProfissionalResposta>("/profissionais", {
    method: "POST",
    body: payload,
  });
}
