
// para rodar no localhost
const API_BASE_URL =
  import.meta.env.VITE_API_PROFISSIONAIS_URL?.replace(/\/$/, "") ||
  "http://localhost:8081/api";

// para rodar no codespace trocar a URL e abrir portas
// const API_BASE_URL =
//   import.meta.env.VITE_API_PROFISSIONAIS_URL?.replace(/\/$/, "") ||
//   "https://stunning-space-engine-6947g6p67rjwhxvjj-8081.app.github.dev/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const hasBody = body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...headers,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = "Erro ao processar requisicao.";

    try {
      const errorBody = (await response.json()) as { erro?: string };
      if (errorBody?.erro) {
        errorMessage = errorBody.erro;
      }
    } catch {

    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (response.status === 205 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export { request };
