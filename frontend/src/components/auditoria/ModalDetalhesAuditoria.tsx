import ModalBase from "../modais/ModalBase";
import type { AuditoriaRegistro } from "../../types/auditoria";

interface ModalDetalhesAuditoriaProps {
  aberto: boolean;
  auditoria: AuditoriaRegistro | null;
  onFechar: () => void;
}

function formatarDataHora(dataHora: string): string {
  const data = new Date(dataHora);

  if (!dataHora || Number.isNaN(data.getTime())) {
    return "Não informado";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getModuloLabel(modulo: AuditoriaRegistro["modulo"]): string {
  const labels: Record<AuditoriaRegistro["modulo"], string> = {
    profissionais: "Profissionais",
    projetos: "Projetos",
    tarefas: "Tarefas",
    sistema: "Sistema",
  };

  return labels[modulo];
}

function DetalheLinha({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-[15px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
        {titulo}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-white">{valor}</p>
    </div>
  );
}

export default function ModalDetalhesAuditoria({
  aberto,
  auditoria,
  onFechar,
}: ModalDetalhesAuditoriaProps) {
  if (!auditoria) {
    return null;
  }

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Auditoria #${auditoria.codigo}`}
      subtitulo="Detalhes completos do evento registrado no sistema."
      larguraClasse="max-w-4xl"
    >
      <div className="space-y-5 sm:space-y-6">
        <section className="rounded-[15px] bg-[#2c2c31] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                Ação realizada
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{auditoria.acao}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                {auditoria.descricao}
              </p>
            </div>

            <span className="w-fit rounded-full border border-violet-400/25 bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-100">
              {getModuloLabel(auditoria.modulo)}
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <DetalheLinha titulo="Responsável" valor={auditoria.responsavel.nome} />
          <DetalheLinha titulo="E-mail" valor={auditoria.responsavel.email} />
          <DetalheLinha titulo="Módulo / Local" valor={auditoria.local} />
          <DetalheLinha titulo="Ação realizada" valor={auditoria.acao} />
          <DetalheLinha titulo="Campo afetado" valor={auditoria.campo} />
          <DetalheLinha titulo="Data e hora" valor={formatarDataHora(auditoria.dataHora)} />
          <DetalheLinha titulo="Tabela" valor={auditoria.tabela} />
          <DetalheLinha
            titulo="Registro afetado"
            valor={auditoria.entidadeId ? `#${auditoria.entidadeId}` : "Não informado"}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[15px] border border-red-400/15 bg-red-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200/70">
              Valor anterior
            </p>
            <p className="mt-3 break-words text-base font-semibold text-white sm:text-lg">
              {auditoria.valorAnterior}
            </p>
          </div>

          <div className="rounded-[15px] border border-emerald-400/15 bg-emerald-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/70">
              Novo valor
            </p>
            <p className="mt-3 break-words text-base font-semibold text-white sm:text-lg">
              {auditoria.novoValor}
            </p>
          </div>
        </section>

        <section className="rounded-[15px] border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            Descrição
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">{auditoria.descricao}</p>
        </section>
      </div>
    </ModalBase>
  );
}
