import ModalBase from "./ModalBase";
import type { FormatoExportacao } from "../../lib/financeiroExport";

interface ModalExportarRelatorioProps {
    aberto: boolean;
    onFechar: () => void;
    formato: FormatoExportacao;
    onFormatoChange: (formato: FormatoExportacao) => void;
    incluirIndicadores: boolean;
    onIncluirIndicadoresChange: (valor: boolean) => void;
    incluirProjetos: boolean;
    onIncluirProjetosChange: (valor: boolean) => void;
    incluirProfissionais: boolean;
    onIncluirProfissionaisChange: (valor: boolean) => void;
    apenasFiltrados: boolean;
    onApenasFiltradosChange: (valor: boolean) => void;
    carregando: boolean;
    erro: string | null;
    onConfirmar: () => Promise<void>;
}

interface OpcaoFormato {
    id: FormatoExportacao;
    titulo: string;
    descricao: string;
}

const OPCOES_FORMATO: OpcaoFormato[] = [
    {
        id: "csv",
        titulo: "CSV",
        descricao: "Rapido e compativel com Excel.",
    },
    {
        id: "xlsx",
        titulo: "Excel (.xlsx)",
        descricao: "Planilha com abas separadas por secao.",
    },
    {
        id: "pdf",
        titulo: "PDF",
        descricao: "Relatório visual para compartilhamento.",
    },
];

function CheckboxLinha({
    titulo,
    descricao,
    checked,
    onChange,
}: {
    titulo: string;
    descricao: string;
    checked: boolean;
    onChange: (valor: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-violet-400/45">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-1 h-4 w-4 accent-violet-500"
            />
            <div>
                <p className="text-sm font-medium text-white">{titulo}</p>
                <p className="mt-1 text-xs text-white/60">{descricao}</p>
            </div>
        </label>
    );
}

export default function ModalExportarRelatorio({
    aberto,
    onFechar,
    formato,
    onFormatoChange,
    incluirIndicadores,
    onIncluirIndicadoresChange,
    incluirProjetos,
    onIncluirProjetosChange,
    incluirProfissionais,
    onIncluirProfissionaisChange,
    apenasFiltrados,
    onApenasFiltradosChange,
    carregando,
    erro,
    onConfirmar,
}: ModalExportarRelatorioProps) {
    return (
        <ModalBase
            aberto={aberto}
            onFechar={onFechar}
            titulo="Exportar relatório"
            subtitulo="Baixe os dados do dashboard financeiro no formato desejado."
            larguraClasse="max-w-3xl"
        >
            <div className="space-y-6">
                <section className="rounded-[15px] bg-[#2c2c31] p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                        Formato
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {OPCOES_FORMATO.map((opcao) => {
                            const selecionado = formato === opcao.id;

                            return (
                                <button
                                    key={opcao.id}
                                    type="button"
                                    onClick={() => onFormatoChange(opcao.id)}
                                    className={`rounded-xl border px-4 py-4 text-left transition ${selecionado
                                        ? "border-violet-400/60 bg-violet-500/20"
                                        : "border-white/10 bg-black/20 hover:border-violet-400/45"
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-white">{opcao.titulo}</p>
                                    <p className="mt-1 text-xs text-white/60">{opcao.descricao}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-[15px] bg-[#2c2c31] p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                        Conteudo
                    </p>

                    <div className="mt-4 space-y-3">
                        <CheckboxLinha
                            titulo="Indicadores do dashboard"
                            descricao="Horas, tarefas concluidas, custo total e projetos."
                            checked={incluirIndicadores}
                            onChange={onIncluirIndicadoresChange}
                        />

                        <CheckboxLinha
                            titulo="Lista de projetos"
                            descricao="Nome, tipo, horas totais e custo por projeto."
                            checked={incluirProjetos}
                            onChange={onIncluirProjetosChange}
                        />

                        <CheckboxLinha
                            titulo="Lista de profissionais"
                            descricao="Totais com e sem bonus por profissional."
                            checked={incluirProfissionais}
                            onChange={onIncluirProfissionaisChange}
                        />

                        <CheckboxLinha
                            titulo="Somente dados filtrados"
                            descricao="Exporta apenas o que estiver visivel pelos filtros atuais de busca."
                            checked={apenasFiltrados}
                            onChange={onApenasFiltradosChange}
                        />
                    </div>
                </section>

                {erro && (
                    <div className="rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {erro}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onFechar}
                        disabled={carregando}
                        className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={() => void onConfirmar()}
                        disabled={carregando}
                        className="rounded-xl bg-gradient-to-b from-[#6627cc] to-[#4a1898] px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Exportando..." : "Exportar relatório"}
                    </button>
                </div>
            </div>
        </ModalBase>
    );
}
