import { useEffect, useMemo, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";
import { useNavigate } from "react-router-dom";
import { projetoService, profissionaisService } from "../../services/gateway";
import profissionalService from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";
import { toastError } from "../../utils/toastUtils";
import jsPDF from "jspdf";

interface Projeto {
  id: number;
  nome: string;
  codigo: string;
  tipoProjeto: string;
  valorHoraBase: number;
  horasContratadas: number | null;
  dataInicio: string;
  dataFim: string;
  responsavelId: number;
}

interface Profissional {
  id: number;
  nome: string;
}

type TipoFiltro = "TODOS" | "HORA_FECHADA" | "ALOCACAO";

type Ordenacao =
  | "NOME_ASC"
  | "NOME_DESC"
  | "CODIGO_ASC"
  | "CODIGO_DESC"
  | "RESPONSAVEL_ASC"
  | "TIPO_ASC"
  | "VALOR_DESC"
  | "HORAS_DESC"
  | "DATA_INICIO_DESC";

const ITEMS_PER_PAGE = 12;

function buildPageItems(pagina: number, totalPaginas: number): (number | "...")[] {
  const delta = 2;
  const pages: (number | "...")[] = [];
  const left = pagina - delta;
  const right = pagina + delta;

  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= left && i <= right)) {
      pages.push(i);
    } else if (i === left - 1 || i === right + 1) {
      pages.push("...");
    }
  }

  return pages;
}

function Projetos() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const podeGerenciarProjetos =
    roles.includes("ROLE_FINANCE") ||
    roles.includes("ROLE_GERENTE_PROJETO") ||
    roles.includes("ROLE_ADMIN");

  const navigate = useNavigate();

  const [modalAberto, setModalAberto] = useState(false);
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [profissionais, setProfissionais] = useState<Map<number, string>>(new Map());
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("TODOS");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("NOME_ASC");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const [resProjetos, resProfissionais] = await Promise.all([
        projetoService.listar(),
        profissionaisService.listar(),
      ]);

      if (!resProjetos.ok) throw new Error(`Erro ao carregar projetos: ${resProjetos.status}`);
      if (!resProfissionais.ok) throw new Error(`Erro ao carregar profissionais: ${resProfissionais.status}`);

      const dadosProjetos = await resProjetos.json();
      const dadosProfissionais = await resProfissionais.json();

      let projetosPermitidos = Array.isArray(dadosProjetos) ? dadosProjetos : [];

      if (!podeGerenciarProjetos && user?.id) {
        const vinculos = await profissionalService.listarProjetosVinculados(user.id);
        const idsProjetos = new Set(
          vinculos
            .map((v: any) => Number(v.projetoId ?? v.id))
            .filter((id: number) => !Number.isNaN(id))
        );
        projetosPermitidos = projetosPermitidos.filter((projeto: Projeto) =>
          idsProjetos.has(Number(projeto.id))
        );
      }

      setProjetos(projetosPermitidos);
      setProfissionais(
        new Map<number, string>(
          Array.isArray(dadosProfissionais)
            ? dadosProfissionais.map((p: Profissional) => [p.id, p.nome])
            : []
        )
      );
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      const mensagem = err instanceof Error ? err.message : "Falha ao carregar dados";
      setErro(mensagem);
      toastError("Erro ao carregar projetos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) carregarDados();
  }, [user?.id, podeGerenciarProjetos]);

  const formatarMoeda = (valor?: number | null) =>
    Number(valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (data?: string | null) => {
    if (!data) return "Sem data";
    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) return "Sem data";
    return dataObj.toLocaleDateString("pt-BR");
  };

  const getNomeResponsavel = (id: number) => profissionais.get(id) ?? "Não informado";

  const getTipoLabel = (tipo: string) => {
    if (tipo === "HORA_FECHADA") return "Hora fechada";
    if (tipo === "ALOCACAO") return "Alocação";
    return tipo || "Não informado";
  };

  const getTipoStyle = (tipo: string) => {
    if (tipo === "HORA_FECHADA") return "border-violet-500/30 bg-violet-500/10 text-violet-300";
    if (tipo === "ALOCACAO") return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    return "border-white/10 bg-white/5 text-slate-300";
  };

  const filtrosAtivos = useMemo(() => {
    let total = 0;
    if (busca.trim()) total += 1;
    if (tipoFiltro !== "TODOS") total += 1;
    if (ordenacao !== "NOME_ASC") total += 1;
    return total;
  }, [busca, tipoFiltro, ordenacao]);

  const projetosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const filtrados = projetos.filter((projeto) => {
      const nomeResponsavel = getNomeResponsavel(projeto.responsavelId);
      const bateTexto =
        !termo ||
        projeto.nome?.toLowerCase().includes(termo) ||
        projeto.codigo?.toLowerCase().includes(termo) ||
        nomeResponsavel.toLowerCase().includes(termo);
      const bateTipo = tipoFiltro === "TODOS" || projeto.tipoProjeto === tipoFiltro;
      return bateTexto && bateTipo;
    });

    return [...filtrados].sort((a, b) => {
      const nomeA = a.nome ?? "";
      const nomeB = b.nome ?? "";
      const codigoA = a.codigo ?? "";
      const codigoB = b.codigo ?? "";
      const responsavelA = getNomeResponsavel(a.responsavelId);
      const responsavelB = getNomeResponsavel(b.responsavelId);

      switch (ordenacao) {
        case "NOME_DESC": return nomeB.localeCompare(nomeA);
        case "CODIGO_ASC": return codigoA.localeCompare(codigoB);
        case "CODIGO_DESC": return codigoB.localeCompare(codigoA);
        case "RESPONSAVEL_ASC": return responsavelA.localeCompare(responsavelB);
        case "TIPO_ASC": return getTipoLabel(a.tipoProjeto).localeCompare(getTipoLabel(b.tipoProjeto));
        case "VALOR_DESC": return Number(b.valorHoraBase ?? 0) - Number(a.valorHoraBase ?? 0);
        case "HORAS_DESC": return Number(b.horasContratadas ?? 0) - Number(a.horasContratadas ?? 0);
        case "DATA_INICIO_DESC":
          return new Date(b.dataInicio ?? "").getTime() - new Date(a.dataInicio ?? "").getTime();
        case "NOME_ASC":
        default: return nomeA.localeCompare(nomeB);
      }
    });
  }, [projetos, profissionais, busca, tipoFiltro, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(projetosFiltrados.length / ITEMS_PER_PAGE));

  const projetosPagina = useMemo(() => {
    const inicio = (pagina - 1) * ITEMS_PER_PAGE;
    return projetosFiltrados.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [projetosFiltrados, pagina]);

  useEffect(() => {
    setPagina(1);
  }, [busca, tipoFiltro, ordenacao]);

  const pageItems = buildPageItems(pagina, totalPaginas);

  const estatisticas = useMemo(() => ({
    totalProjetos: projetosFiltrados.length,
    totalHoraFechada: projetosFiltrados.filter((p) => p.tipoProjeto === "HORA_FECHADA").length,
    totalAlocacao: projetosFiltrados.filter((p) => p.tipoProjeto === "ALOCACAO").length,
    totalHoras: projetosFiltrados.reduce((t, p) => t + Number(p.horasContratadas ?? 0), 0),
  }), [projetosFiltrados]);

  const limparFiltros = () => {
    setBusca("");
    setTipoFiltro("TODOS");
    setOrdenacao("NOME_ASC");
  };

  const gerarRelatorioPdf = () => {
    const projetosRelatorio = projetosFiltrados.length > 0 ? projetosFiltrados : projetos;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const padding = 40;
    let y = 48;

    doc.setFillColor("#1f1f1f");
    doc.rect(0, 0, 595, 110, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(20);
    doc.text("Relatório de Projetos", padding, y);
    doc.setFontSize(10);
    doc.setTextColor("#d8d8d8");
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      padding, y + 20
    );

    y = 145;
    doc.setFillColor("#f3efff");
    doc.roundedRect(padding, y - 28, 515, 72, 10, 10, "F");
    doc.setTextColor("#6627cc");
    doc.setFontSize(10);
    doc.text("Projetos", padding + 20, y);
    doc.text("Hora fechada", padding + 145, y);
    doc.text("Alocação", padding + 290, y);
    doc.text("Horas contratadas", padding + 400, y);
    doc.setFontSize(18);
    doc.text(String(projetosRelatorio.length), padding + 20, y + 24);
    doc.text(String(projetosRelatorio.filter((p) => p.tipoProjeto === "HORA_FECHADA").length), padding + 145, y + 24);
    doc.text(String(projetosRelatorio.filter((p) => p.tipoProjeto === "ALOCACAO").length), padding + 290, y + 24);
    doc.text(
      `${projetosRelatorio.reduce((t, p) => t + Number(p.horasContratadas ?? 0), 0)}h`,
      padding + 400, y + 24
    );

    y += 80;
    doc.setTextColor("#1f1f1f");
    doc.setFontSize(14);
    doc.text("Projetos", padding, y);
    y += 24;
    doc.setFillColor("#6627cc");
    doc.rect(padding, y - 14, 515, 22, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(9);
    doc.text("Projeto", padding + 8, y);
    doc.text("Tipo", padding + 215, y);
    doc.text("Responsável", padding + 315, y);
    doc.text("Horas", padding + 455, y);
    y += 24;

    projetosRelatorio.forEach((projeto) => {
      if (y > 760) { doc.addPage(); y = 50; }
      doc.setTextColor("#111111");
      doc.setFontSize(9);
      doc.text(String(projeto.nome ?? "N/D").slice(0, 34), padding + 8, y);
      doc.text(getTipoLabel(projeto.tipoProjeto), padding + 215, y);
      doc.text(getNomeResponsavel(projeto.responsavelId).slice(0, 22), padding + 315, y);
      doc.text(`${projeto.horasContratadas ?? 0}h`, padding + 455, y);
      y += 18;
      doc.setDrawColor("#e8ddff");
      doc.line(padding, y, 555, y);
      y += 10;
    });

    doc.save("relatorio-projetos.pdf");
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-6 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#3b137b] px-6 py-7 sm:px-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-24 h-40 w-40 rounded-full bg-purple-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {podeGerenciarProjetos ? "Gestão" : "Meus vínculos"}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {podeGerenciarProjetos ? "Projetos" : "Meus projetos"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                  Acompanhe os projetos cadastrados, responsáveis, tipos de contrato e horas contratadas em uma visão rápida e organizada.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[620px]">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Projetos</p>
                  <p className="mt-1 text-2xl font-bold">{estatisticas.totalProjetos}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Hora fechada</p>
                  <p className="mt-1 text-2xl font-bold">{estatisticas.totalHoraFechada}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Alocação</p>
                  <p className="mt-1 text-2xl font-bold">{estatisticas.totalAlocacao}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs text-white/60">Horas</p>
                  <p className="mt-1 text-2xl font-bold">{estatisticas.totalHoras}h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Listagem</p>
              <p className="mt-1 text-sm text-slate-400">
                {projetosFiltrados.length} de {projetos.length} projeto(s) exibido(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setPainelFiltrosAberto((prev) => !prev)}
                className="relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-[#6627cc]/60 hover:bg-[#6627cc]/15"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filtros
                {filtrosAtivos > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6627cc] px-1.5 text-[11px] font-bold text-white">
                    {filtrosAtivos}
                  </span>
                )}
                <svg className={`transition ${painelFiltrosAberto ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {podeGerenciarProjetos && (
                <button
                  onClick={gerarRelatorioPdf}
                  disabled={loading || projetos.length === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-[#6627cc]/60 hover:bg-[#6627cc]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                  Gerar PDF
                </button>
              )}

              {podeGerenciarProjetos && (
                <button
                  onClick={() => setModalAberto(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6627cc] px-5 text-sm font-bold text-white shadow-lg shadow-purple-950/40 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="text-lg leading-none">+</span>
                  Novo projeto
                </button>
              )}
            </div>
          </div>
        </div>

        {painelFiltrosAberto && (
          <section className="rounded-[22px] border border-[#6627cc]/25 bg-[#232329] p-5 shadow-lg shadow-purple-950/10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300/80">Filtros</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Refinar projetos</h2>
              </div>
              {filtrosAtivos > 0 && (
                <button
                  onClick={limparFiltros}
                  className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-[#6627cc]/40 hover:bg-[#6627cc]/10"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px_260px]">
              <div className="relative">
                <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-300/70" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Pesquisar por projeto, código ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#1a1a20] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
                />
              </div>

              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoFiltro)}
                className="h-12 rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="HORA_FECHADA">Hora fechada</option>
                <option value="ALOCACAO">Alocação</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="h-12 rounded-2xl border border-white/10 bg-[#1a1a20] px-4 text-sm text-white outline-none transition focus:border-[#6627cc]/70 focus:ring-2 focus:ring-[#6627cc]/25"
              >
                <option value="NOME_ASC">Nome A-Z</option>
                <option value="NOME_DESC">Nome Z-A</option>
                <option value="CODIGO_ASC">Código crescente</option>
                <option value="CODIGO_DESC">Código decrescente</option>
                <option value="RESPONSAVEL_ASC">Responsável A-Z</option>
                <option value="TIPO_ASC">Tipo</option>
                <option value="VALOR_DESC">Maior valor/hora</option>
                <option value="HORAS_DESC">Mais horas contratadas</option>
                <option value="DATA_INICIO_DESC">Mais recentes</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Busca: {busca.trim() ? busca : "sem termo"}
              </span>
              <span className="rounded-full border border-[#6627cc]/20 bg-[#6627cc]/10 px-3 py-1 text-violet-200">
                Tipo: {tipoFiltro === "TODOS" ? "todos" : getTipoLabel(tipoFiltro)}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Exibindo {projetosFiltrados.length} de {projetos.length}
              </span>
            </div>
          </section>
        )}

        {erro && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="flex items-center justify-between gap-4">
              <span>{erro}</span>
              <button
                onClick={carregarDados}
                className="rounded-xl bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/30"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-[22px] border border-white/10 bg-[#26262b]" />
            ))}
          </div>
        ) : projetosFiltrados.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] border border-white/10 bg-[#232329] p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6627cc]/15 text-[#a78bfa]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Nenhum projeto encontrado</h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Ajuste os filtros ou pesquise por outro nome, código ou responsável.
            </p>
            {filtrosAtivos > 0 && (
              <button
                onClick={limparFiltros}
                className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {projetosPagina.map((projeto) => (
                <button
                  key={projeto.id}
                  onClick={() => navigate(`/projetos/${projeto.id}`)}
                  className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#26262b] p-5 text-left shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-[#6627cc]/60 hover:bg-[#2b2b31] hover:shadow-2xl hover:shadow-purple-950/20"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#6627cc]/20 blur-3xl transition group-hover:bg-[#7c3aed]/30" />

                  <div className="relative flex min-h-44 flex-col justify-between gap-5">
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-lg font-bold leading-tight text-white">{projeto.nome}</h2>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            {projeto.codigo || "Sem código"}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getTipoStyle(projeto.tipoProjeto)}`}>
                          {getTipoLabel(projeto.tipoProjeto)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">Responsável</p>
                            <p className="truncate font-semibold text-white">{getNomeResponsavel(projeto.responsavelId)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-3">
                            <p className="text-[11px] text-slate-500">Valor/hora</p>
                            <p className="mt-1 truncate text-sm font-bold text-white">{formatarMoeda(projeto.valorHoraBase)}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-[#1f1f24] p-3">
                            <p className="text-[11px] text-slate-500">Horas</p>
                            <p className="mt-1 text-sm font-bold text-white">
                              {projeto.tipoProjeto === "HORA_FECHADA" ? `${projeto.horasContratadas ?? 0}h` : "Livre"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="text-xs text-slate-500">
                        <span>{formatarData(projeto.dataInicio)}</span>
                        <span className="mx-1">—</span>
                        <span>{formatarData(projeto.dataFim)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-[#a78bfa] transition group-hover:text-white">
                        Abrir
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[#232329] px-6 py-4 sm:flex-row sm:px-8">
                <span className="text-xs text-slate-500">
                  Mostrando{" "}
                  {Math.min((pagina - 1) * ITEMS_PER_PAGE + 1, projetosFiltrados.length)}
                  –{Math.min(pagina * ITEMS_PER_PAGE, projetosFiltrados.length)} de{" "}
                  {projetosFiltrados.length} projetos
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1a20] text-slate-400 transition hover:border-[#6627cc]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {pageItems.map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-slate-500 text-sm select-none">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPagina(item)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
                          item === pagina
                            ? "bg-[#6627cc] text-white shadow shadow-purple-900/40"
                            : "border border-white/10 bg-[#1a1a20] text-slate-400 hover:border-[#6627cc]/50 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1a20] text-slate-400 transition hover:border-[#6627cc]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <ModalCadastro
          aberto={modalAberto}
          onFechar={() => setModalAberto(false)}
          onProjetoCadastrado={() => {
            setModalAberto(false);
            carregarDados();
          }}
        />
      </div>
    </div>
  );
}

export default Projetos;
