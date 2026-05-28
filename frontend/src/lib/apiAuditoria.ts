import axios from "axios";
import type {
  AuditoriaModuloRegistro,
  AuditoriaRegistro,
  AuditoriaTarefaApiRegistro,
} from "../types/auditoria";

const API_BASE = "/api/auditoria";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

function valorOuPadrao(valor: unknown, padrao = "Não informado"): string {
  if (valor === null || valor === undefined || valor === "") {
    return padrao;
  }

  return String(valor);
}

function removerAcentos(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarOperacao(operacao: string | null | undefined): string {
  const operacaoNormalizada = removerAcentos(valorOuPadrao(operacao).trim().toUpperCase());

  if (["LOGIN", "SIGN_IN", "SIGNIN", "AUTH", "AUTENTICACAO"].includes(operacaoNormalizada)) {
    return "Login";
  }

  if (["CREATE", "INSERT", "POST", "CRIACAO", "CADASTRO"].includes(operacaoNormalizada)) {
    return "Criação";
  }

  if (["UPDATE", "PUT", "PATCH", "ALTERACAO", "ATUALIZACAO", "EDICAO"].includes(operacaoNormalizada)) {
    return "Atualização";
  }

  if (["DELETE", "REMOVE", "EXCLUSAO", "REMOCAO"].includes(operacaoNormalizada)) {
    return "Remoção";
  }

  return valorOuPadrao(operacao);
}

function inferirModuloPorTabela(tabela: string): AuditoriaModuloRegistro {
  const tabelaNormalizada = removerAcentos(tabela.trim().toLowerCase());

  if (
    tabelaNormalizada.includes("auth") ||
    tabelaNormalizada.includes("login") ||
    tabelaNormalizada.includes("sessao") ||
    tabelaNormalizada.includes("session")
  ) {
    return "sistema";
  }

  if (tabelaNormalizada.includes("profissional")) {
    return "profissionais";
  }

  if (tabelaNormalizada.includes("projeto")) {
    return "projetos";
  }

  return "tarefas";
}

function criarDescricaoAuditoria({
  operacao,
  tabela,
  entidadeId,
  campo,
}: {
  operacao: string;
  tabela: string;
  entidadeId: number | null;
  campo: string;
}): string {
  const registro = entidadeId ? ` #${entidadeId}` : "";

  if (operacao === "Login") {
    return "Usuário realizou login no sistema.";
  }

  if (operacao === "Criação") {
    return `Registro criado em ${tabela}${registro}.`;
  }

  if (operacao === "Atualização") {
    return `Campo "${campo}" alterado em ${tabela}${registro}.`;
  }

  if (operacao === "Remoção") {
    return `Registro removido de ${tabela}${registro}.`;
  }

  return `Evento registrado em ${tabela}${registro}.`;
}

function normalizarRegistroTarefa(
  registro: AuditoriaTarefaApiRegistro,
): AuditoriaRegistro {
  const tabela = valorOuPadrao(registro.nomeTabelaModificada, "Tarefa");
  const entidadeId = registro.entidadeId ?? null;
  const usuarioAutor = registro.usuarioAutor ?? null;
  const campo = valorOuPadrao(registro.campoAlterado);
  const operacao = normalizarOperacao(registro.tipoOperacao);
  const modulo = inferirModuloPorTabela(tabela);

  return {
    id: `${modulo}-${registro.id}`,
    codigo: String(registro.id),
    modulo,
    local: entidadeId ? `${tabela} / Registro #${entidadeId}` : `${tabela} / Registro`,
    acao: operacao,
    campo,
    valorAnterior: valorOuPadrao(registro.valorAnterior),
    novoValor: valorOuPadrao(registro.novoValor),
    dataHora: valorOuPadrao(registro.dataAlteracao, ""),
    responsavel: {
      id: usuarioAutor,
      nome: usuarioAutor ? `Usuário #${usuarioAutor}` : "Sistema",
      email: "E-mail não informado",
    },
    descricao: criarDescricaoAuditoria({
      operacao,
      tabela,
      entidadeId,
      campo,
    }),
    entidadeId,
    tabela,
    origem: modulo,
  };
}

function ordenarPorDataMaisRecente(
  registros: AuditoriaRegistro[],
): AuditoriaRegistro[] {
  return [...registros].sort((a, b) => {
    const dataA = new Date(a.dataHora).getTime();
    const dataB = new Date(b.dataHora).getTime();

    if (Number.isNaN(dataA) && Number.isNaN(dataB)) {
      return Number(b.codigo) - Number(a.codigo);
    }

    if (Number.isNaN(dataA)) {
      return 1;
    }

    if (Number.isNaN(dataB)) {
      return -1;
    }

    return dataB - dataA;
  });
}

export const apiAuditoria = {
  async listarTarefas(): Promise<AuditoriaRegistro[]> {
    const response = await api.get<AuditoriaTarefaApiRegistro[]>("/auditoria");

    return ordenarPorDataMaisRecente(
      response.data.map(normalizarRegistroTarefa),
    );
  },
};
