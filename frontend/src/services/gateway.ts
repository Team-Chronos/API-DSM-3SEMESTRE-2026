const GATEWAY_URL = "http://localhost:8080" 

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
  ...options,
  headers
})

if (response.status === 401) {
  localStorage.removeItem("token")
  window.location.href = "/login"
  throw new Error("Sessão expirada. Faça login novamente.")
}
  
  if (response.status === 403) {
    throw new Error("Você não tem permissão para acessar este recurso.")
  }
  
  return response
}

export const profissionaisService = {
  listar: () => apiFetch("/profissionais"),
  buscar: (id: number) => apiFetch(`/profissionais/${id}`),
  criar: (data: unknown) => apiFetch("/profissionais", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/profissionais/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deletar: (id: number) => apiFetch(`/profissionais/${id}`, {
    method: "DELETE"
  })
}

export const apontamentoService = {
  listar: () => apiFetch("/apontamento/apontamentos"),
  buscar: (id: number) => apiFetch(`/apontamento/apontamentos/${id}`),
  criar: (data: unknown) => apiFetch("/apontamento/apontamentos", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/apontamento/apontamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deletar: (id: number) => apiFetch(`/apontamento/apontamentos/${id}`, {
    method: "DELETE"
  })
}

export const projetoService = {
  listar: () => apiFetch("/projeto/projetos"),
  buscar: (id: number) => apiFetch(`/projeto/projetos/${id}`),
  criar: (data: unknown) => apiFetch("/projeto/projetos", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/projeto/projetos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deletar: (id: number) => apiFetch(`/projeto/projetos/${id}`, {
    method: "DELETE"
  })
}

export const financeiroService = {
  listar: () => apiFetch("/financeiro/lancamentos"),
  buscar: (id: number) => apiFetch(`/financeiro/lancamentos/${id}`),
  criar: (data: unknown) => apiFetch("/financeiro/lancamentos", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/financeiro/lancamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deletar: (id: number) => apiFetch(`/financeiro/lancamentos/${id}`, {
    method: "DELETE"
  })
}

export const tarefasService = {
  listar: () => apiFetch("/tarefas/tarefas"),
  buscar: (id: number) => apiFetch(`/tarefas/tarefas/${id}`),
  criar: (data: unknown) => apiFetch("/tarefas/tarefas", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  atualizar: (id: number, data: unknown) => apiFetch(`/tarefas/tarefas/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deletar: (id: number) => apiFetch(`/tarefas/tarefas/${id}`, {
    method: "DELETE"
  })
}
