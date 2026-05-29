import axios, { type InternalAxiosRequestConfig } from "axios";
import { ApiProfissionais } from "../service/servicoApi";
import type {
  AuditoriaApiRegistro,
  AuditoriaModuloRegistro,
  AuditoriaRegistro,
} from "../types/auditoria";

const API_BASE = "/api/auditoria";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

function aplicarToken(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

function tratarErroAutenticacao(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return Promise.reject(error);
}

api.interceptors.request.use(aplicarToken);
api.interceptors.response.use((response) => response, tratarErroAutenticacao);

type AuditoriaRespostaTodas = Partial<Record<AuditoriaModuloRegistro, unknown>>;

interface ProfissionalAutorApi {
  id?: number | string | null;
  usuarioId?: number | string | null;
  nome?: string | null;
  email?: string | null;
  cargoId?: number | string | null;
}

interface AutorResolvido {
  id: number;
  nome: string | null;
  email: string | null;
  cargoId: number | null;
}

const autoresCache = new Map<number, AutorResolvido | null>();

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

function normalizarModuloPorTabela(
  tabela: string,
  origemFallback: AuditoriaModuloRegistro,
): AuditoriaModuloRegistro {
  const tabelaNormalizada = removerAcentos(tabela.trim().toLowerCase());

  if (tabelaNormalizada.includes("profissional")) {
    return "profissionais";
  }

  if (tabelaNormalizada.includes("projeto")) {
    return "projetos";
  }

  if (tabelaNormalizada.includes("tarefa") || tabelaNormalizada.includes("item")) {
    return "tarefas";
  }

  return origemFallback;
}

function normalizarCampo(campo: string | null | undefined, operacao: string): string {
  const campoTratado = valorOuPadrao(campo, "Registro").trim();

  if (!campoTratado || campoTratado === "*") {
    return operacao === "Atualização" ? "Registro" : "Registro completo";
  }

  return campoTratado;
}

function formatarValorPorOperacao(
  valor: string | null | undefined,
  operacao: string,
  tipo: "anterior" | "novo",
): string {
  const valorTratado = valorOuPadrao(valor, "").trim();

  if (valorTratado) {
    return valorTratado;
  }

  if (operacao === "Criação") {
    return tipo === "anterior" ? "Registro não existia" : "Registro criado";
  }

  if (operacao === "Remoção") {
    return tipo === "anterior" ? "Dados anteriores não informados" : "Registro removido";
  }

  return "Não informado";
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

function extrairListaAuditoria(resposta: unknown): AuditoriaApiRegistro[] {
  if (Array.isArray(resposta)) {
    return resposta as AuditoriaApiRegistro[];
  }

  if (resposta && typeof resposta === "object") {
    const respostaComum = resposta as {
      content?: unknown;
      data?: unknown;
      dados?: unknown;
      registros?: unknown;
    };

    if (Array.isArray(respostaComum.content)) {
      return respostaComum.content as AuditoriaApiRegistro[];
    }

    if (Array.isArray(respostaComum.data)) {
      return respostaComum.data as AuditoriaApiRegistro[];
    }

    if (Array.isArray(respostaComum.dados)) {
      return respostaComum.dados as AuditoriaApiRegistro[];
    }

    if (Array.isArray(respostaComum.registros)) {
      return respostaComum.registros as AuditoriaApiRegistro[];
    }
  }

  return [];
}

function normalizarRegistroAuditoria(
  registro: AuditoriaApiRegistro,
  origemFallback: AuditoriaModuloRegistro,
): AuditoriaRegistro {
  const tabela = valorOuPadrao(registro.nomeTabelaModificada, "Registro");
  const entidadeId = registro.entidadeId ?? null;
  const operacao = normalizarOperacao(registro.tipoOperacao);
  const campo = normalizarCampo(registro.campoAlterado, operacao);
  const modulo = normalizarModuloPorTabela(tabela, origemFallback);
  const registroAfetado = entidadeId ? `Registro #${entidadeId}` : "Registro";

  return {
    id: `${modulo}-${registro.id}-${tabela}-${entidadeId ?? "sem-id"}-${campo}-${registro.dataAlteracao ?? "sem-data"}`,
    codigo: String(registro.id),
    modulo,
    local: `${tabela} / ${registroAfetado}`,
    acao: operacao,
    campo,
    valorAnterior: formatarValorPorOperacao(registro.valorAnterior, operacao, "anterior"),
    novoValor: formatarValorPorOperacao(registro.novoValor, operacao, "novo"),
    dataHora: valorOuPadrao(registro.dataAlteracao, ""),
    usuarioAutor: registro.usuarioAutor ?? null,
    autorNome: null,
    autorEmail: null,
    autorCargoId: null,
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

function removerDuplicados(registros: AuditoriaRegistro[]): AuditoriaRegistro[] {
  const mapa = new Map<string, AuditoriaRegistro>();

  registros.forEach((registro) => {
    const chave = [
      registro.modulo,
      registro.codigo,
      registro.tabela,
      registro.entidadeId ?? "",
      registro.acao,
      registro.campo,
      registro.valorAnterior,
      registro.novoValor,
      registro.dataHora,
    ].join("|");

    if (!mapa.has(chave)) {
      mapa.set(chave, registro);
    }
  });

  return Array.from(mapa.values());
}

function ordenarPorDataMaisRecente(registros: AuditoriaRegistro[]): AuditoriaRegistro[] {
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

function normalizarRespostaTodas(data: unknown): AuditoriaRegistro[] {
  if (Array.isArray(data)) {
    return data.map((registro) => normalizarRegistroAuditoria(registro, "tarefas"));
  }

  const resposta = data as AuditoriaRespostaTodas;
  const grupos: AuditoriaModuloRegistro[] = ["tarefas", "projetos", "profissionais"];

  return grupos.flatMap((origem) =>
    extrairListaAuditoria(resposta?.[origem]).map((registro) =>
      normalizarRegistroAuditoria(registro, origem),
    ),
  );
}

function normalizarCargoId(cargoId: number | string | null | undefined): number | null {
  if (cargoId === null || cargoId === undefined || cargoId === "") {
    return null;
  }

  const numero = Number(cargoId);
  return Number.isNaN(numero) ? null : numero;
}

async function buscarAutorPorId(id: number): Promise<AutorResolvido | null> {
  if (autoresCache.has(id)) {
    return autoresCache.get(id) ?? null;
  }

  try {
    const response = await ApiProfissionais.get<ProfissionalAutorApi>(
      `/profissionais/api/profissionais/${id}`,
    );

    const profissional = response.data;
    const autor: AutorResolvido = {
      id,
      nome: profissional?.nome ? String(profissional.nome) : null,
      email: profissional?.email ? String(profissional.email) : null,
      cargoId: normalizarCargoId(profissional?.cargoId),
    };

    autoresCache.set(id, autor);
    return autor;
  } catch (error) {
    console.warn(`Não foi possível resolver o autor ${id} no serviço de profissionais.`, error);
    autoresCache.set(id, null);
    return null;
  }
}

async function enriquecerAutores(registros: AuditoriaRegistro[]): Promise<AuditoriaRegistro[]> {
  const idsUnicos = Array.from(
    new Set(
      registros
        .map((registro) => registro.usuarioAutor)
        .filter((id): id is number => typeof id === "number"),
    ),
  );

  if (idsUnicos.length === 0) {
    return registros;
  }

  const autores = await Promise.all(
    idsUnicos.map(async (id) => [id, await buscarAutorPorId(id)] as const),
  );

  const autoresPorId = new Map<number, AutorResolvido | null>(autores);

  return registros.map((registro) => {
    if (registro.usuarioAutor === null) {
      return registro;
    }

    const autor = autoresPorId.get(registro.usuarioAutor);

    if (!autor) {
      return registro;
    }

    return {
      ...registro,
      autorNome: autor.nome,
      autorEmail: autor.email,
      autorCargoId: autor.cargoId,
    };
  });
}

async function buscarGrupoDireto(origem: AuditoriaModuloRegistro): Promise<AuditoriaRegistro[]> {
  try {
    const response = await api.get<unknown>(`/${origem}`);
    return extrairListaAuditoria(response.data).map((registro) =>
      normalizarRegistroAuditoria(registro, origem),
    );
  } catch (error) {
    console.warn(`Não foi possível buscar auditoria de ${origem}.`, error);
    return [];
  }
}

async function completarGruposFaltantes(registros: AuditoriaRegistro[]): Promise<AuditoriaRegistro[]> {
  const grupos: AuditoriaModuloRegistro[] = ["tarefas", "projetos", "profissionais"];
  const gruposSemRegistro = grupos.filter(
    (grupo) => !registros.some((registro) => registro.modulo === grupo),
  );

  if (gruposSemRegistro.length === 0) {
    return registros;
  }

  const complementos = await Promise.all(
    gruposSemRegistro.map((grupo) => buscarGrupoDireto(grupo)),
  );

  return [...registros, ...complementos.flat()];
}

export const apiAuditoria = {
  async listarTodas(): Promise<AuditoriaRegistro[]> {
    const response = await api.get<unknown>("/todas");
    const registrosNormalizados = normalizarRespostaTodas(response.data);
    const registrosComComplemento = await completarGruposFaltantes(registrosNormalizados);
    const registros = ordenarPorDataMaisRecente(
      removerDuplicados(registrosComComplemento),
    );

    return enriquecerAutores(registros);
  },
};
