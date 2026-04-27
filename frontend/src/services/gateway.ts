// src/services/gateway.ts
const API_BASE = '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (response.status === 403) {
    throw new Error('Você não tem permissão para acessar este recurso.');
  }
  return response;
}

export const profissionaisService = {
  // 🔥 CORRIGIDO: endpoint correto para listar profissionais (após StripPrefix=1)
  listar: () => apiFetch('/profissionais/api/profissionais'),
  buscar: (id: number) => apiFetch(`/profissionais/api/profissionais/${id}`),
  criar: (data: unknown) => apiFetch('/profissionais/api/profissionais', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/profissionais/api/profissionais/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletar: (id: number) => apiFetch(`/profissionais/api/profissionais/${id}`, {
    method: 'DELETE',
  }),
  listarProjetosDisponiveis: () => apiFetch('/profissionais/api/profissionais/projetos'),
  vincularProjeto: (id: number, projetoId: number, valorHora: number) =>
    apiFetch(`/profissionais/api/profissionais/${id}/projetos/${projetoId}`, {
      method: 'POST',
      body: JSON.stringify({ valorHora }),
    }),
  listarProjetosVinculados: (id: number) =>
    apiFetch(`/profissionais/api/profissionais/${id}/projetos`),
  desvincularProjeto: (id: number, projetoId: number) =>
    apiFetch(`/profissionais/api/profissionais/${id}/projetos/${projetoId}`, {
      method: 'DELETE',
    }),
};

export const apontamentoService = {
  listar: () => apiFetch('/apontamento/apontamentos'),
  buscar: (id: number) => apiFetch(`/apontamento/apontamentos/${id}`),
  criar: (data: unknown) => apiFetch('/apontamento/apontamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/apontamento/apontamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletar: (id: number) => apiFetch(`/apontamento/apontamentos/${id}`, {
    method: 'DELETE',
  }),
};

// 🔥 CORRIGIDO: rota de projetos agora usa /projeto/projetos
export const projetoService = {
  listar: () => apiFetch('/projeto/projetos'),
  buscarPorId: (id: number) => apiFetch(`/projeto/projetos/${id}`),
  criar: (data: unknown) => apiFetch('/projeto/projetos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/projeto/projetos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletar: (id: number) => apiFetch(`/projeto/projetos/${id}`, {
    method: 'DELETE',
  }),
};

export const financeiroService = {
  listar: () => apiFetch('/financeiro/lancamentos'),
  buscar: (id: number) => apiFetch(`/financeiro/lancamentos/${id}`),
  criar: (data: unknown) => apiFetch('/financeiro/lancamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/financeiro/lancamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletar: (id: number) => apiFetch(`/financeiro/lancamentos/${id}`, {
    method: 'DELETE',
  }),
};

export const tarefasService = {
  listar: () => apiFetch('/tarefas/tarefas'),
  buscar: (id: number) => apiFetch(`/tarefas/tarefas/${id}`),
  criar: (data: unknown) => apiFetch('/tarefas/tarefas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/tarefas/tarefas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletar: (id: number) => apiFetch(`/tarefas/tarefas/${id}`, {
    method: 'DELETE',
  }),
};