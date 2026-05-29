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

function normalizarTexto(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}


function getAutorPrincipal(auditoria: AuditoriaRegistro): string {
  if (auditoria.autorNome) {
    return auditoria.autorNome;
  }

  if (auditoria.usuarioAutor !== null) {
    return String(auditoria.usuarioAutor);
  }

  return "Não informado";
}

function getAutorSecundario(auditoria: AuditoriaRegistro): string | null {
  if (auditoria.autorEmail) {
    return auditoria.autorEmail;
  }

  if (auditoria.autorNome && auditoria.usuarioAutor !== null) {
    return String(auditoria.usuarioAutor);
  }

  return null;
}

function getModuloLabel(modulo: AuditoriaRegistro["modulo"]): string {
  const labels: Record<AuditoriaRegistro["modulo"], string> = {
    profissionais: "Profissionais",
    projetos: "Projetos",
    tarefas: "Tarefas",
  };

  return labels[modulo];
}

function isRemocao(auditoria: AuditoriaRegistro): boolean {
  const acao = normalizarTexto(auditoria.acao);
  return acao.includes("remocao") || acao.includes("exclusao");
}

function isCriacao(auditoria: AuditoriaRegistro): boolean {
  const acao = normalizarTexto(auditoria.acao);
  return acao.includes("criacao") || acao.includes("cadastro");
}

function getRotuloCampo(auditoria: AuditoriaRegistro): string {
  if (isRemocao(auditoria)) {
    return "Escopo afetado";
  }

  if (isCriacao(auditoria)) {
    return "Campo inicial";
  }

  return "Campo afetado";
}

function getRotuloValorAnterior(auditoria: AuditoriaRegistro): string {
  if (isRemocao(auditoria)) {
    return "Antes / removido";
  }

  if (isCriacao(auditoria)) {
    return "Antes";
  }

  return "Antes";
}

function getRotuloNovoValor(auditoria: AuditoriaRegistro): string {
  if (isRemocao(auditoria)) {
    return "Depois / resultado";
  }

  if (isCriacao(auditoria)) {
    return "Depois / criado";
  }

  return "Depois";
}

function formatarValorDetalhado(valor: string): string {
  const valorTratado = valor.trim();

  if (!valorTratado) {
    return "Não informado";
  }

  const pareceObjeto = valorTratado.startsWith("{") && valorTratado.endsWith("}");

  if (!pareceObjeto) {
    return valorTratado;
  }

  return valorTratado
    .slice(1, -1)
    .split(/,\s*(?=\w+\s*:)/g)
    .map((parte) => parte.trim().replace(/^([\wÀ-ÿ]+)\s*:/, "$1: "))
    .map((parte) => parte.replace(/^([^:]+):\s*'(.*)'$/, "$1: $2"))
    .join("\n");
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

function ValorAuditoriaCard({
  titulo,
  valor,
  variante,
}: {
  titulo: string;
  valor: string;
  variante: "anterior" | "novo";
}) {
  const classes = variante === "anterior"
    ? "border-red-400/15 bg-red-500/10 text-red-200/70"
    : "border-emerald-400/15 bg-emerald-500/10 text-emerald-200/70";

  return (
    <div className={`rounded-[15px] border p-5 ${classes}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">
        {titulo}
      </p>
      <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-base font-semibold leading-7 text-white sm:text-lg">
        {formatarValorDetalhado(valor)}
      </pre>
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
          <DetalheLinha titulo="Autor" valor={getAutorPrincipal(auditoria)} />
          {getAutorSecundario(auditoria) && (
            <DetalheLinha
              titulo={auditoria.autorEmail ? "E-mail" : "usuarioAutor"}
              valor={getAutorSecundario(auditoria) ?? ""}
            />
          )}
          {!getAutorSecundario(auditoria) && (
            <DetalheLinha
              titulo="usuarioAutor"
              valor={auditoria.usuarioAutor === null ? "Não informado" : String(auditoria.usuarioAutor)}
            />
          )}
          <DetalheLinha titulo="Módulo / Local" valor={auditoria.local} />
          <DetalheLinha titulo="Ação realizada" valor={auditoria.acao} />
          <DetalheLinha titulo={getRotuloCampo(auditoria)} valor={auditoria.campo} />
          <DetalheLinha titulo="Data e hora" valor={formatarDataHora(auditoria.dataHora)} />
          <DetalheLinha titulo="Tabela" valor={auditoria.tabela} />
          <DetalheLinha
            titulo="entidadeId"
            valor={auditoria.entidadeId === null ? "Não informado" : String(auditoria.entidadeId)}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <ValorAuditoriaCard
            titulo={getRotuloValorAnterior(auditoria)}
            valor={auditoria.valorAnterior}
            variante="anterior"
          />

          <ValorAuditoriaCard
            titulo={getRotuloNovoValor(auditoria)}
            valor={auditoria.novoValor}
            variante="novo"
          />
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
