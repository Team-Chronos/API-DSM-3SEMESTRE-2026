import ModalBase from "./ModalBase";
import type { ProjetoDetalhe, ProjetoProfissionais } from "../../types/financeiro";

interface ModalDetalheProjetoProps {
  aberto: boolean;
  onFechar: () => void;
  projeto: ProjetoDetalhe | null;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
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

function calcularPercentualHoras(
  horasProfissional: number,
  horasTotais: number
): number {
  if (horasTotais <= 0) {
    return 0;
  }

  return (horasProfissional / horasTotais) * 100;
}

function calcularMediaHorasPorProfissional(
  profissionais: ProjetoProfissionais[]
): number {
  if (!profissionais || profissionais.length === 0) {
    return 0;
  }

  const soma = profissionais.reduce(
    (acumulador, profissional) => acumulador + profissional.horasTrabalhadas,
    0
  );

  return soma / profissionais.length;
}

function obterProfissionalPrincipal(
  profissionais: ProjetoProfissionais[]
): ProjetoProfissionais | null {
  if (!profissionais || profissionais.length === 0) {
    return null;
  }

  return profissionais.reduce((maior, atual) =>
    atual.horasTrabalhadas > maior.horasTrabalhadas ? atual : maior
  );
}

function CardMetrica({
  titulo,
  valor,
  destaque = false,
  valorClasse = "text-3xl",
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
  valorClasse?: string;
}) {
  return (
    <div
      className={
        destaque
          ? "rounded-[15px] bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#4a1898] p-5 ring-1 ring-violet-400/20"
          : "rounded-[15px] bg-[#4a4a4f] p-5"
      }
    >
      <p className="text-sm text-white/65">{titulo}</p>
      <p
        className={`mt-4 break-words font-semibold leading-tight text-white ${valorClasse}`}
      >
        {valor}
      </p>
    </div>
  );
}

export default function ModalDetalheProjeto({
  aberto,
  onFechar,
  projeto,
}: ModalDetalheProjetoProps) {
  if (!projeto) {
    return null;
  }

  const profissionais = projeto.profissionais ?? [];

  const mediaHorasPorProfissional =
    calcularMediaHorasPorProfissional(profissionais);

  const profissionalPrincipal = obterProfissionalPrincipal(profissionais);

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      titulo={projeto.nomeProjeto}
      subtitulo={`Projeto #${projeto.projetoId}`}
      larguraClasse="max-w-6xl"
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <CardMetrica
            titulo="Horas"
            valor={formatarHoras(projeto.totalHoras)}
          />

          <CardMetrica
            titulo="Custo/hora"
            valor={formatarMoeda(projeto.valorHoraProjeto)}
          />

          <CardMetrica
            titulo="Profissionais"
            valor={String(projeto.totalProfissionais)}
          />

          <CardMetrica
            titulo="Custo total"
            valor={formatarMoeda(projeto.custoTotal)}
            destaque
          />
          <div className="rounded-[15px] bg-[#4a4a4f] p-5">
            <p className="text-sm text-white/65">Profissional destaque</p>
            <p className="mt-4 break-words text-2xl font-semibold leading-tight text-white">
              {profissionalPrincipal ? profissionalPrincipal.usuarioNome : "--"}
            </p>
            {profissionalPrincipal && (
              <p className="mt-3 text-sm text-white/60">
                {formatarHoras(profissionalPrincipal.horasTrabalhadas)} •{" "}
                {formatarMoeda(profissionalPrincipal.valorBaseCalculado)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[15px] bg-[#2c2c31] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                  Resumo do projeto
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Visão consolidada
                </h3>
              </div>

              <span className="rounded-full bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 ring-1 ring-violet-400/20">
                {projeto.totalProfissionais} profissionais
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CardMetrica
                titulo="Tipo"
                valor={projeto.tipoProjeto}
                valorClasse="text-2xl"
              />

              <CardMetrica
                titulo="Horas totais"
                valor={formatarHoras(projeto.totalHoras)}
              />

              <CardMetrica
                titulo="Custo/hora"
                valor={formatarMoeda(projeto.valorHoraProjeto)}
              />

              <CardMetrica
                titulo="Média horas/profissional"
                valor={formatarHoras(mediaHorasPorProfissional)}
                valorClasse="text-2xl"
              />
            </div>
          </section>

          <section className="rounded-[15px] bg-[#2c2c31] p-5">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                Produtividade
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Participação por profissional
              </h3>
            </div>

            <div className="space-y-5">
              {profissionais.map((profissional) => {
                const percentual = calcularPercentualHoras(
                  profissional.horasTrabalhadas,
                  projeto.totalHoras
                );

                return (
                  <div
                    key={profissional.usuarioId}
                    className="rounded-[15px] bg-[#54545a] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {profissional.usuarioNome}
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          {formatarHoras(profissional.horasTrabalhadas)} •{" "}
                          {formatarMoeda(profissional.valorHoraProjeto)} / h
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/85">
                        {percentual.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-500"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                      <span className="text-white/60">Custo gerado</span>
                      <span className="font-semibold text-white">
                        {formatarMoeda(profissional.valorBaseCalculado)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[15px] bg-[#3f3f44] p-5">
          <h3 className="text-2xl font-semibold text-white">Equipe</h3>

          <div className="mt-5 max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {profissionais.map((profissional) => (
              <div
                key={profissional.usuarioId}
                className="rounded-[15px] bg-[#54545a] p-4"
              >
                <p className="text-lg font-semibold text-white">
                  {profissional.usuarioNome}
                </p>

                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Horas</span>
                    <span className="font-medium text-white">
                      {formatarHoras(profissional.horasTrabalhadas)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Valor/hora</span>
                    <span className="font-medium text-white">
                      {formatarMoeda(profissional.valorHoraProjeto)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Custo individual</span>
                    <span className="font-semibold text-white">
                      {formatarMoeda(profissional.valorBaseCalculado)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ModalBase>
  );
}