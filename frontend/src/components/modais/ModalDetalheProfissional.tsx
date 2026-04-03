import ModalBase from "./ModalBase";
import type { ProfissionalGanhos, ProjetoProfissional } from "../../types/financeiro";

interface ModalDetalheProfissionalProps {
  aberto: boolean;
  onFechar: () => void;
  profissional: ProfissionalGanhos | null;
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
function calcularMediaValorHora(projetos: ProjetoProfissional[]): number {
  if (projetos.length === 0) {
    return 0;
  }

  const soma = projetos.reduce(
    (acumulador, projeto) => acumulador + projeto.valorHoraProjeto,
    0
  );

  return soma / projetos.length;
}

function calcularMediaHoras(projetos: ProjetoProfissional[]): number {
  if (projetos.length === 0) {
    return 0;
  }

  const soma = projetos.reduce(
    (acumulador, projeto) => acumulador + projeto.horasTrabalhadas,
    0
  );

  return soma / projetos.length;
}

function obterProjetoMaiorCusto(
  projetos: ProjetoProfissional[]
): ProjetoProfissional | null {
  if (projetos.length === 0) {
    return null;
  }

  return projetos.reduce((maior, atual) =>
    atual.valorBaseCalculado > maior.valorBaseCalculado ? atual : maior
  );
}

function calcularPercentualHoras(
  horasProjeto: number,
  horasTotais: number
): number {
  if (horasTotais <= 0) {
    return 0;
  }

  return (horasProjeto / horasTotais) * 100;
}

function CardMetrica({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
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
      <p className="mt-4 text-3xl font-semibold text-white">{valor}</p>
    </div>
  );
}

export default function ModalDetalheProfissional({
  aberto,
  onFechar,
  profissional,
}: ModalDetalheProfissionalProps) {
  if (!profissional) {
    return null;
  }

  const quantidadeProjetos = profissional.projetos.length;
  const mediaValorHora = calcularMediaValorHora(profissional.projetos);
  const mediaHoras = calcularMediaHoras(profissional.projetos);
  const projetoMaiorCusto = obterProjetoMaiorCusto(profissional.projetos);

  const horasTotais = profissional.projetos.reduce(
    (acumulador, projeto) => acumulador + projeto.horasTrabalhadas,
    0
  );

  return (
    <ModalBase
      aberto={aberto}
      onFechar={onFechar}
      titulo={profissional.usuarioNome}
      subtitulo={`Resumo financeiro do usuário #${profissional.usuarioId}`}
      larguraClasse="max-w-6xl"
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <CardMetrica
            titulo="Projetos"
            valor={String(quantidadeProjetos)}
          />
          <CardMetrica
            titulo="Sem bônus"
            valor={formatarMoeda(profissional.totalSemBonus)}
          />
          <CardMetrica
            titulo="Bônus"
            valor={formatarMoeda(profissional.bonusAplicado)}
          />
          <CardMetrica
            titulo="Total"
            valor={formatarMoeda(profissional.totalComBonus)}
            destaque
          />
        </div>

        <div className="space-y-5">
          <section className="rounded-[15px] bg-[#2c2c31] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                  Resumo financeiro
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  Visão consolidada
                </h3>
              </div>

              <span className="rounded-full bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 ring-1 ring-violet-400/20">
                {quantidadeProjetos} projeto{quantidadeProjetos !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CardMetrica
                titulo="Valor/hora médio"
                valor={formatarMoeda(mediaValorHora)}
              />
              <CardMetrica
                titulo="Média de horas"
                valor={formatarHoras(mediaHoras)}
              />
              <CardMetrica
                titulo="Horas totais"
                valor={formatarHoras(horasTotais)}
              />
              <CardMetrica
                titulo="Maior custo"
                valor={
                  projetoMaiorCusto
                    ? formatarMoeda(projetoMaiorCusto.valorBaseCalculado)
                    : "--"
                }
              />
            </div>
          </section>

          <section className="rounded-[15px] bg-[#2c2c31] p-5">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/85">
                Distribuição por projeto
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Participação em horas
              </h3>
            </div>

            <div className="space-y-5">
              {profissional.projetos.map((projeto) => {
                const percentual = calcularPercentualHoras(
                  projeto.horasTrabalhadas,
                  horasTotais
                );

                return (
                  <div
                    key={projeto.projetoId}
                    className="rounded-[15px] bg-[#54545a] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {projeto.nomeProjeto}
                        </p>
                        <p className="mt-1 text-sm text-white/65">
                          {formatarHoras(projeto.horasTrabalhadas)} •{" "}
                          {formatarMoeda(projeto.valorHoraProjeto)} / h
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
                      <span className="text-white/60">Valor base</span>
                      <span className="font-semibold text-white">
                        {formatarMoeda(projeto.valorBaseCalculado)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[15px] bg-[#3f3f44] p-5">
          <h3 className="text-2xl font-semibold text-white">Projetos</h3>

          <div className="mt-5 max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {profissional.projetos.map((projeto) => (
              <div
                key={`${profissional.usuarioId}-${projeto.projetoId}`}
                className="rounded-[15px] bg-[#54545a] p-4"
              >
                <p className="text-lg font-semibold text-white">
                  {projeto.nomeProjeto}
                </p>

                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Horas</span>
                    <span className="font-medium text-white">
                      {formatarHoras(projeto.horasTrabalhadas)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Valor/hora</span>
                    <span className="font-medium text-white">
                      {formatarMoeda(projeto.valorHoraProjeto)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/60">Valor base</span>
                    <span className="font-semibold text-white">
                      {formatarMoeda(projeto.valorBaseCalculado)}
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