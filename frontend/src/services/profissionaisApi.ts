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

const API_BASE = "/api"; 
type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    let errorMessage = "Erro ao processar requisição.";
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.erro || errorBody.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export function listarProjetos(): Promise<ProjetoDisponivel[]> {
  return request<ProjetoDisponivel[]>("/profissionais/projetos", { method: "GET" });
}

export function listarProfissionais(): Promise<ProfissionalResposta[]> {
  return request<ProfissionalResposta[]>("/profissionais/", { method: "GET" });
}

export function listarProjetosVinculados(profissionalId: number): Promise<ProjetoVinculadoResposta[]> {
  return request<ProjetoVinculadoResposta[]>(`/profissionais/${profissionalId}/projetos`, { method: "GET" });
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
  return request<ProfissionalResposta>("/profissionais/", {
    method: "POST",
    body: payload,
  });
}