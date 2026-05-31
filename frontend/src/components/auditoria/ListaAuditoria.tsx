import { useIsMobile } from "../../hooks/useIsMobile";
import type { AuditoriaRegistro } from "../../types/auditoria";

interface ListaAuditoriaProps {
  registros: AuditoriaRegistro[];
  onSelecionar: (auditoria: AuditoriaRegistro) => void;
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

function getModuloLabel(modulo: AuditoriaRegistro["modulo"]): string {
  const labels: Record<AuditoriaRegistro["modulo"], string> = {
    profissionais: "Profissionais",
    projetos: "Projetos",
    tarefas: "Tarefas",
  };

  return labels[modulo];
}

function getAcaoClasses(acao: string): string {
  const acaoNormalizada = normalizarTexto(acao);

  if (acaoNormalizada.includes("criacao") || acaoNormalizada.includes("cadastro")) {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  }

  if (acaoNormalizada.includes("remocao") || acaoNormalizada.includes("exclusao")) {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }

  return "border-violet-400/20 bg-violet-500/10 text-violet-200";
}

function isRemocao(registro: AuditoriaRegistro): boolean {
  const acao = normalizarTexto(registro.acao);
  return acao.includes("remocao") || acao.includes("exclusao");
}

function isCriacao(registro: AuditoriaRegistro): boolean {
  const acao = normalizarTexto(registro.acao);
  return acao.includes("criacao") || acao.includes("cadastro");
}

function getRotuloValorAnterior(registro: AuditoriaRegistro): string {
  if (isRemocao(registro)) {
    return "Antes / removido";
  }

  if (isCriacao(registro)) {
    return "Antes";
  }

  return "Antes";
}

function getRotuloNovoValor(registro: AuditoriaRegistro): string {
  if (isRemocao(registro)) {
    return "Depois / resultado";
  }

  if (isCriacao(registro)) {
    return "Depois / criado";
  }

  return "Depois";
}

function resumirValor(valor: string): string {
  if (!valor || valor === "Não informado") {
    return "Não informado";
  }

  return valor;
}

function TextoLimitado({ children, destaque = false }: { children: string; destaque?: boolean }) {
  return (
    <p
      title={children}
      className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm ${
        destaque ? "font-semibold text-white" : "text-white/70"
      }`}
    >
      {children}
    </p>
  );
}

function getAutorPrincipal(registro: AuditoriaRegistro): string {
  if (registro.autorNome) {
    return registro.autorNome;
  }

  if (registro.usuarioAutor !== null) {
    return String(registro.usuarioAutor);
  }

  return "Não informado";
}

function getAutorSecundario(registro: AuditoriaRegistro): string {
  if (registro.autorEmail) {
    return registro.autorEmail;
  }

  if (registro.autorNome && registro.usuarioAutor !== null) {
    return `ID: ${registro.usuarioAutor}`;
  }

  return "usuarioAutor";
}

function AutorResumo({ registro }: { registro: AuditoriaRegistro }) {
  return (
    <div className="min-w-0">
      <TextoLimitado destaque>{getAutorPrincipal(registro)}</TextoLimitado>
      <p className="mt-1 truncate text-xs text-white/45">{getAutorSecundario(registro)}</p>
    </div>
  );
}

function CardMobile({
  registro,
  onSelecionar,
}: {
  registro: AuditoriaRegistro;
  onSelecionar: (auditoria: AuditoriaRegistro) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelecionar(registro)}
      className="block w-full p-5 text-left transition hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">#{registro.codigo}</p>
          <p className="mt-1 truncate text-base font-semibold text-white">
            {getAutorPrincipal(registro)}
          </p>
          <p className="mt-1 truncate text-xs text-white/45">{getAutorSecundario(registro)}</p>
        </div>

        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getAcaoClasses(registro.acao)}`}>
          {registro.acao}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
          {getModuloLabel(registro.modulo)}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
          {registro.tabela}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/65">{registro.local}</p>

      <div className="mt-4 grid gap-3">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs text-white/40">{getRotuloValorAnterior(registro)}</p>
          <p className="mt-1 break-words text-sm text-white/75">{resumirValor(registro.valorAnterior)}</p>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs text-white/40">{getRotuloNovoValor(registro)}</p>
          <p className="mt-1 break-words text-sm font-medium text-white">{resumirValor(registro.novoValor)}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/45">{formatarDataHora(registro.dataHora)}</p>
    </button>
  );
}

function CardCompacto({
  registro,
  onSelecionar,
}: {
  registro: AuditoriaRegistro;
  onSelecionar: (auditoria: AuditoriaRegistro) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelecionar(registro)}
      className="block w-full p-4 text-left transition hover:bg-white/[0.04]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">#{registro.codigo}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getAcaoClasses(registro.acao)}`}>
              {registro.acao}
            </span>
            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
              {getModuloLabel(registro.modulo)}
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-white">
            {getAutorPrincipal(registro)}
          </p>
          <p className="mt-1 truncate text-xs text-white/45">{getAutorSecundario(registro)}</p>
        </div>

        <p className="shrink-0 text-xs text-white/45">{formatarDataHora(registro.dataHora)}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:hidden">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">
            Módulo / Local
          </p>
          <p className="mt-1 text-sm text-white/75">{registro.local}</p>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">
            Tabela
          </p>
          <p className="mt-1 text-sm text-white/75">{registro.tabela}</p>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">
            {getRotuloValorAnterior(registro)}
          </p>
          <p className="mt-1 break-words text-sm text-white/75">{resumirValor(registro.valorAnterior)}</p>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">
            {getRotuloNovoValor(registro)}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-white">{resumirValor(registro.novoValor)}</p>
        </div>
      </div>
    </button>
  );
}

export default function ListaAuditoria({ registros, onSelecionar }: ListaAuditoriaProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329]">
        <div className="divide-y divide-white/8">
          {registros.map((registro) => (
            <CardMobile
              key={registro.id}
              registro={registro}
              onSelecionar={onSelecionar}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329]">
      <div className="divide-y divide-white/8 xl:hidden">
        {registros.map((registro) => (
          <CardCompacto
            key={registro.id}
            registro={registro}
            onSelecionar={onSelecionar}
          />
        ))}
      </div>

      <div className="hidden xl:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.14em] text-white/45">
            <tr>
              <th className="w-[10%] px-4 py-4 font-semibold">Código / ID</th>
              <th className="w-[10%] px-4 py-4 font-semibold">Evento</th>
              <th className="w-[15%] px-4 py-4 font-semibold">Autor</th>
              <th className="w-[20%] px-4 py-4 font-semibold">Módulo / Local</th>
              <th className="w-[14%] px-4 py-4 font-semibold">Antes</th>
              <th className="w-[16%] px-4 py-4 font-semibold">Depois / Resultado</th>
              <th className="w-[15%] px-4 py-4 font-semibold">Data e Hora</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/8">
            {registros.map((registro) => (
              <tr
                key={registro.id}
                className="cursor-pointer transition hover:bg-white/[0.04]"
                onClick={() => onSelecionar(registro)}
              >
                <td className="px-4 py-4 align-top">
                  <TextoLimitado destaque>{`#${registro.codigo}`}</TextoLimitado>
                  <p className="mt-1 text-xs text-white/45">{registro.tabela}</p>
                </td>

                <td className="px-4 py-4 align-top">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getAcaoClasses(registro.acao)}`}>
                    {registro.acao}
                  </span>
                </td>

                <td className="px-4 py-4 align-top">
                  <AutorResumo registro={registro} />
                </td>

                <td className="px-4 py-4 align-top">
                  <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                    {getModuloLabel(registro.modulo)}
                  </span>
                  <div className="mt-2">
                    <TextoLimitado>{registro.local}</TextoLimitado>
                  </div>
                </td>

                <td className="px-4 py-4 align-top">
                  <TextoLimitado>{resumirValor(registro.valorAnterior)}</TextoLimitado>
                </td>

                <td className="px-4 py-4 align-top">
                  <TextoLimitado destaque>{resumirValor(registro.novoValor)}</TextoLimitado>
                </td>

                <td className="px-4 py-4 align-top">
                  <p className="whitespace-nowrap text-sm text-white/70">
                    {formatarDataHora(registro.dataHora)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
