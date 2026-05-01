import { useEffect, useState } from "react";
import ModalCadastro from "../../components/projetos/modalCadastro";
import { useNavigate } from "react-router-dom";
import { projetoService, profissionaisService } from "../../services/gateway";
import profissionalService from "../../types/profissionalService";
import { useAuth } from "../../contexts/AuthContext";
import { toastError } from "../../utils/toastUtils";
import jsPDF from 'jspdf';

interface Projeto {
  id: number;
  nome: string;
  codigo: string;
  tipoProjeto: string;
  valorHoraBase: number;
  horasContratadas: number;
  dataInicio: string;
  dataFim: string;
  responsavelId: number;
}

interface Profissional {
  id: number;
  nome: string;
}

function Projetos() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const podeGerenciarProjetos =
    roles.includes("ROLE_FINANCE") || roles.includes("ROLE_GERENTE_PROJETO");

  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [profissionais, setProfissionais] = useState<Map<number, string>>(
    new Map(),
  );
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const [resProjetos, resProfissionais] = await Promise.all([
        projetoService.listar(),
        profissionaisService.listar(),
      ]);

      if (!resProjetos.ok) {
        throw new Error(`Erro ao carregar projetos: ${resProjetos.status}`);
      }

      if (!resProfissionais.ok) {
        throw new Error(
          `Erro ao carregar profissionais: ${resProfissionais.status}`,
        );
      }

      const dadosProjetos = await resProjetos.json();
      const dadosProfissionais = await resProfissionais.json();

      let projetosPermitidos = dadosProjetos;

      if (!podeGerenciarProjetos && user?.id) {
        const vinculos = await profissionalService.listarProjetosVinculados(
          user.id,
        );

        const idsProjetos = new Set(
          vinculos
            .map((v: any) => Number(v.projetoId ?? v.id))
            .filter((id: number) => !Number.isNaN(id)),
        );

        projetosPermitidos = dadosProjetos.filter((projeto: Projeto) =>
          idsProjetos.has(Number(projeto.id)),
        );
      }

      setProjetos(projetosPermitidos);
      setProfissionais(
        new Map(dadosProfissionais.map((p: Profissional) => [p.id, p.nome])),
      );
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setErro(err instanceof Error ? err.message : "Falha ao carregar dados");
      toastError("Erro ao carregar projetos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      carregarDados();
    }
  }, [user?.id, podeGerenciarProjetos]);

  const gerarRelatorioPdf = () => {
    const projetosRelatorio = projetosFiltrados.length > 0 ? projetosFiltrados : projetos;
    const totalHoras = projetosRelatorio.reduce(
      (sum, projeto) => sum + (projeto.horasContratadas ?? 0),
      0,
    );
    const totalDesenvolvedores = profissionais.size;
    const totalProjetos = projetosRelatorio.length;

    const profissionaisResumo = Array.from(profissionais.entries()).map(([id, nome]) => {
      const projetosDoProfissional = projetosRelatorio.filter(
        (projeto) => projeto.responsavelId === id,
      );
      return {
        nome,
        horasTotais: projetosDoProfissional.reduce(
          (sum, projeto) => sum + (projeto.horasContratadas ?? 0),
          0,
        ),
        projetosCount: projetosDoProfissional.length,
      };
    });

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const padding = 40;
    let y = 50;

    doc.setFillColor('#1b1b1f');
    doc.rect(0, 0, 595, 100, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(20);
    doc.text('Relatório de Horas', padding, y);
    doc.setFontSize(11);
    doc.text('Período: 01/04/2026 - 30/04/2026', padding, y + 22);
    y += 50;

    doc.setFillColor('#f4efff');
    doc.roundedRect(padding - 10, y - 14, 520, 88, 8, 8, 'F');
    doc.setTextColor('#6627cc');
    doc.setFontSize(12);
    doc.text('Horas Totais', padding, y);
    doc.text('Desenvolvedores', padding + 170, y);
    doc.text('Projetos', padding + 330, y);
    y += 20;
    doc.setFontSize(18);
    doc.text(`${totalHoras}h`, padding, y);
    doc.text(`${totalDesenvolvedores}`, padding + 170, y);
    doc.text(`${totalProjetos}`, padding + 330, y);
    y += 36;

    doc.setDrawColor('#d6cdf7');
    doc.line(padding - 10, y, 555, y);
    y += 24;

    doc.setFillColor('#6627cc');
    doc.rect(padding - 10, y - 18, 520, 22, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.text('Resumo Geral', padding, y);
    y += 24;

    doc.setFillColor('#6627cc');
    doc.rect(padding - 10, y - 12, 520, 18, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.text('Projeto', padding, y);
    doc.text('Horas Totais', padding + 220, y);
    doc.text('Responsável', padding + 360, y);
    y += 18;
    doc.setDrawColor('#d6cdf7');
    doc.line(padding - 10, y, 555, y);
    y += 14;

    projetosRelatorio.forEach((projeto) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      doc.setTextColor('#000000');
      doc.setFontSize(10);
      doc.text(projeto.nome || 'N/D', padding, y);
      doc.text(`${projeto.horasContratadas ?? 0}h`, padding + 220, y);
      doc.text(profissionais.get(projeto.responsavelId) ?? 'N/D', padding + 360, y);
      y += 18;
      doc.setDrawColor('#e4d9ff');
      doc.line(padding - 10, y, 555, y);
      y += 8;
    });

    y += 14;
    if (y > 760) {
      doc.addPage();
      y = 50;
    }

    doc.setFillColor('#6627cc');
    doc.rect(padding - 10, y - 18, 520, 22, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.text('Detalhamento por Projeto', padding, y);
    y += 26;

    projetosRelatorio.forEach((projeto) => {
      if (y > 730) {
        doc.addPage();
        y = 50;
      }
      doc.setTextColor('#6627cc');
      doc.setFontSize(12);
      doc.text(projeto.nome || 'Projeto sem nome', padding, y);
      y += 16;
      doc.setTextColor('#000000');
      doc.setFontSize(10);
      doc.text(`Responsável: ${profissionais.get(projeto.responsavelId) ?? 'N/D'}`, padding, y);
      doc.text(`Horas Contratadas: ${projeto.horasContratadas ?? 0}h`, padding + 260, y);
      y += 16;
      doc.text(`Valor Hora Base: R$ ${projeto.valorHoraBase?.toFixed(2) ?? '0.00'}`, padding, y);
      y += 18;
      doc.setDrawColor('#e4d9ff');
      doc.line(padding - 10, y, 555, y);
      y += 18;
    });

    if (y > 760) {
      doc.addPage();
      y = 50;
    }

    doc.setFillColor('#6627cc');
    doc.rect(padding - 10, y - 18, 520, 22, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.text('Resumo por Desenvolvedor', padding, y);
    y += 26;
    doc.setFillColor('#6627cc');
    doc.rect(padding - 10, y - 12, 520, 18, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.text('Desenvolvedor', padding, y);
    doc.text('Horas Totais', padding + 260, y);
    doc.text('Projetos', padding + 380, y);
    y += 18;
    doc.setDrawColor('#d6cdf7');
    doc.line(padding - 10, y, 555, y);
    y += 14;

    profissionaisResumo.forEach((profissional) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      doc.setTextColor('#000000');
      doc.setFontSize(10);
      doc.text(profissional.nome, padding, y);
      doc.text(`${profissional.horasTotais}h`, padding + 260, y);
      doc.text(String(profissional.projetosCount), padding + 380, y);
      y += 18;
      doc.setDrawColor('#e4d9ff');
      doc.line(padding - 10, y, 555, y);
      y += 8;
    });

    doc.save(`relatorio-projetos-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const projetosFiltrados = projetos.filter((projeto) => {
    const termo = busca.toLowerCase();
    const nomeResp = profissionais.get(projeto.responsavelId) ?? "";

    return (
      projeto.nome?.toLowerCase().includes(termo) ||
      projeto.codigo?.toLowerCase().includes(termo) ||
      nomeResp.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold text-white">Projetos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar projeto..."
            className="w-64 rounded-lg bg-[#2a2a2c] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {podeGerenciarProjetos && (
            <button
              onClick={gerarRelatorioPdf}
              className="rounded-lg bg-[#4a1898] px-4 py-2 text-white hover:bg-[#5f24c9]"
            >
              Gerar relatório PDF
            </button>
          )}
          <button
            onClick={() => setModalAberto(true)}
            className="cursor-pointer rounded-lg bg-gradient-to-b from-[#6627cc] to-[#4a1898] px-4 py-2 font-medium text-white shadow-lg transition hover:scale-[1.03] hover:brightness-110"
          >
            + Novo
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-950 text-red-200 rounded">{erro}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading &&
          Array(8)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-[#2a2a2c] p-4 rounded-2xl animate-pulse h-32"
              />
            ))}

        {!loading && projetosFiltrados.length === 0 && (
          <div className="col-span-full text-center text-slate-400">
            Nenhum projeto
          </div>
        )}

        {!loading &&
          projetosFiltrados.map((projeto) => (
            <div
              key={projeto.id}
              onClick={() => navigate(`/projetos/${projeto.id}`)}
              className="cursor-pointer rounded-2xl bg-[#2a2a2c] p-4 text-white transition hover:scale-[1.02] hover:border-purple-500"
            >
              <h2 className="text-lg font-semibold">{projeto.nome}</h2>
              <p>Código: {projeto.codigo}</p>
              <p>Tipo: {projeto.tipoProjeto}</p>
              <p>
                Responsável: {profissionais.get(projeto.responsavelId) ?? "N/D"}
              </p>
            </div>
          ))}
      </div>

      <ModalCadastro
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onProjetoCadastrado={() => {
          setModalAberto(false);
          carregarDados();
        }}
      />
    </div>
  );
}

export default Projetos;
