import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type {
  DashboardData,
  ProfissionalGanhos,
  ProjetoFinanceiro,
} from "../types/financeiro";

export type FormatoExportacao = "csv" | "xlsx" | "pdf";

export interface OpcoesExportacaoFinanceiro {
  formato: FormatoExportacao;
  incluirIndicadores: boolean;
  incluirProjetos: boolean;
  incluirProfissionais: boolean;
  apenasFiltrados: boolean;
  dashboard: DashboardData;
  projetos: ProjetoFinanceiro[];
  profissionais: ProfissionalGanhos[];
}

function formatarDataArquivo(data = new Date()): string {
  const yyyy = data.getFullYear();
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  const hh = String(data.getHours()).padStart(2, "0");
  const mi = String(data.getMinutes()).padStart(2, "0");

  return `${yyyy}${mm}${dd}-${hh}${mi}`;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

function formatarHoras(valor: number): string {
  if (!Number.isFinite(valor) || valor < 0) {
    return "--";
  }

  const horas = Math.floor(valor);
  const minutos = Math.round((valor - horas) * 60);

  if (minutos === 0) {
    return `${horas}h`;
  }

  return `${horas}h${String(minutos).padStart(2, "0")}m`;
}

function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function gerarNomeArquivo(opcoes: OpcoesExportacaoFinanceiro): string {
  const sufixoFiltro = opcoes.apenasFiltrados ? "-filtrado" : "-completo";
  return `relatorio-financeiro${sufixoFiltro}-${formatarDataArquivo()}`;
}

function exportarCsv(opcoes: OpcoesExportacaoFinanceiro) {
  const linhas: string[] = [];

  linhas.push("RELATÓRIO FINANCEIRO");
  linhas.push("");

  if (opcoes.incluirIndicadores) {
    linhas.push("INDICADORES");
    linhas.push("Metrica;Valor");
    linhas.push(
      `Horas Trabalhadas;${formatarNumero(opcoes.dashboard.totalHoras)}`
    );
    linhas.push(`Task Concluidas;${formatarNumero(opcoes.dashboard.tarefasConcluidas)}`);
    linhas.push(`Projetos em Andamento;${formatarNumero(opcoes.dashboard.totalProjetos)}`);
    linhas.push(`Desenvolvedores;${formatarNumero(opcoes.dashboard.totalDesenvolvedores)}`);
    linhas.push(`Custo Total Projetos;${formatarMoeda(opcoes.dashboard.custoTotal)}`);
    linhas.push(`Projetos Concluidos;${formatarNumero(opcoes.dashboard.projetosConcluidos)}`);
    linhas.push("");
  }

  if (opcoes.incluirProjetos) {
    linhas.push("PROJETOS");
    linhas.push("ID;Nome;Tipo;Horas Totais;Custo Total");
    opcoes.projetos.forEach((projeto) => {
      linhas.push(
        [
          projeto.projetoId,
          projeto.nomeProjeto,
          projeto.tipoProjeto,
          formatarHoras(projeto.totalHoras),
          formatarMoeda(projeto.custoTotal),
        ].join(";")
      );
    });
    linhas.push("");
  }

  if (opcoes.incluirProfissionais) {
    linhas.push("PROFISSIONAIS");
    linhas.push("ID;Nome;Projetos;Total sem Bonus;Bonus Aplicado;Total com Bonus");
    opcoes.profissionais.forEach((profissional) => {
      linhas.push(
        [
          profissional.usuarioId,
          profissional.usuarioNome,
          profissional.projetos.length,
          formatarMoeda(profissional.totalSemBonus),
          formatarMoeda(profissional.bonusAplicado),
          formatarMoeda(profissional.totalComBonus),
        ].join(";")
      );
    });
  }

  const csv = `\uFEFF${linhas.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  baixarBlob(blob, `${gerarNomeArquivo(opcoes)}.csv`);
}

function exportarXlsx(opcoes: OpcoesExportacaoFinanceiro) {
  const workbook = XLSX.utils.book_new();

  if (opcoes.incluirIndicadores) {
    const indicadores = [
      { metrica: "Horas Trabalhadas", valor: opcoes.dashboard.totalHoras },
      { metrica: "Task Concluidas", valor: opcoes.dashboard.tarefasConcluidas },
      { metrica: "Projetos em Andamento", valor: opcoes.dashboard.totalProjetos },
      { metrica: "Desenvolvedores", valor: opcoes.dashboard.totalDesenvolvedores },
      { metrica: "Custo Total Projetos", valor: opcoes.dashboard.custoTotal },
      { metrica: "Projetos Concluidos", valor: opcoes.dashboard.projetosConcluidos },
    ];

    const wsIndicadores = XLSX.utils.json_to_sheet(indicadores);
    XLSX.utils.book_append_sheet(workbook, wsIndicadores, "Indicadores");
  }

  if (opcoes.incluirProjetos) {
    const projetos = opcoes.projetos.map((projeto) => ({
      id: projeto.projetoId,
      nome: projeto.nomeProjeto,
      tipo: projeto.tipoProjeto,
      horasTotais: projeto.totalHoras,
      custoTotal: projeto.custoTotal,
    }));

    const wsProjetos = XLSX.utils.json_to_sheet(projetos);
    XLSX.utils.book_append_sheet(workbook, wsProjetos, "Projetos");
  }

  if (opcoes.incluirProfissionais) {
    const profissionais = opcoes.profissionais.map((profissional) => ({
      id: profissional.usuarioId,
      nome: profissional.usuarioNome,
      quantidadeProjetos: profissional.projetos.length,
      totalSemBonus: profissional.totalSemBonus,
      bonusAplicado: profissional.bonusAplicado,
      totalComBonus: profissional.totalComBonus,
    }));

    const wsProfissionais = XLSX.utils.json_to_sheet(profissionais);
    XLSX.utils.book_append_sheet(workbook, wsProfissionais, "Profissionais");
  }

  XLSX.writeFile(workbook, `${gerarNomeArquivo(opcoes)}.xlsx`);
}

function exportarPdf(opcoes: OpcoesExportacaoFinanceiro) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFontSize(18);
  doc.text("Relatório Financeiro", 40, 40);

  doc.setFontSize(10);
  doc.text(
    `Gerado em ${new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date())}`,
    40,
    58
  );

  let cursorY = 80;

  if (opcoes.incluirIndicadores) {
    doc.setFontSize(13);
    doc.text("Indicadores", 40, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      head: [["Metrica", "Valor"]],
      body: [
        ["Horas Trabalhadas", formatarNumero(opcoes.dashboard.totalHoras)],
        ["Task Concluidas", formatarNumero(opcoes.dashboard.tarefasConcluidas)],
        ["Projetos em Andamento", formatarNumero(opcoes.dashboard.totalProjetos)],
        ["Desenvolvedores", formatarNumero(opcoes.dashboard.totalDesenvolvedores)],
        ["Custo Total Projetos", formatarMoeda(opcoes.dashboard.custoTotal)],
        ["Projetos Concluidos", formatarNumero(opcoes.dashboard.projetosConcluidos)],
      ],
      theme: "striped",
      headStyles: { fillColor: [102, 39, 204] },
      margin: { left: 40, right: 40 },
    });

    cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
    cursorY += 26;
  }

  if (opcoes.incluirProjetos) {
    doc.setFontSize(13);
    doc.text("Projetos", 40, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      head: [["ID", "Nome", "Tipo", "Horas", "Custo Total"]],
      body: opcoes.projetos.map((projeto) => [
        String(projeto.projetoId),
        projeto.nomeProjeto,
        projeto.tipoProjeto,
        formatarHoras(projeto.totalHoras),
        formatarMoeda(projeto.custoTotal),
      ]),
      theme: "striped",
      headStyles: { fillColor: [102, 39, 204] },
      margin: { left: 40, right: 40 },
    });

    cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
    cursorY += 26;
  }

  if (opcoes.incluirProfissionais) {
    doc.setFontSize(13);
    doc.text("Profissionais", 40, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      head: [["ID", "Nome", "Projetos", "Sem Bonus", "Bonus", "Total"]],
      body: opcoes.profissionais.map((profissional) => [
        String(profissional.usuarioId),
        profissional.usuarioNome,
        String(profissional.projetos.length),
        formatarMoeda(profissional.totalSemBonus),
        formatarMoeda(profissional.bonusAplicado),
        formatarMoeda(profissional.totalComBonus),
      ]),
      theme: "striped",
      headStyles: { fillColor: [102, 39, 204] },
      margin: { left: 40, right: 40 },
    });
  }

  doc.save(`${gerarNomeArquivo(opcoes)}.pdf`);
}

export function exportarRelatorioFinanceiro(opcoes: OpcoesExportacaoFinanceiro) {
  if (
    !opcoes.incluirIndicadores &&
    !opcoes.incluirProjetos &&
    !opcoes.incluirProfissionais
  ) {
    throw new Error("Selecione ao menos um bloco para exportar.");
  }

  switch (opcoes.formato) {
    case "csv":
      exportarCsv(opcoes);
      return;
    case "xlsx":
      exportarXlsx(opcoes);
      return;
    case "pdf":
      exportarPdf(opcoes);
      return;
    default:
      throw new Error("Formato de exportacao invalido.");
  }
}
