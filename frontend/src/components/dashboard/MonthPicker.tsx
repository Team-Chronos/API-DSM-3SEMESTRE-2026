import { useEffect, useRef, useState } from "react";
import {
  ABREV_MESES,
  NOMES_MESES,
  type CompetenciaFinanceira,
} from "../../lib/competenciaFinanceira";

interface MonthPickerProps {
  competencia: CompetenciaFinanceira;
  competenciaAtual: CompetenciaFinanceira;
  onSelecionar: (ano: number, mes: number) => void;
}

export default function MonthPicker({
  competencia,
  competenciaAtual,
  onSelecionar,
}: MonthPickerProps) {
  const [aberto, setAberto] = useState(false);
  const [anoVisivel, setAnoVisivel] = useState(competencia.ano);
  const containerRef = useRef<HTMLDivElement>(null);

  function alternarCalendario() {
    if (!aberto) {
      setAnoVisivel(competencia.ano);
    }

    setAberto((valor) => !valor);
  }

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", fecharAoClicarFora);
    }

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
    };
  }, [aberto]);

  function selecionarMes(mes: number) {
    onSelecionar(anoVisivel, mes);
    setAberto(false);
  }

  function isFutura(mes: number): boolean {
    return (
      anoVisivel > competenciaAtual.ano ||
      (anoVisivel === competenciaAtual.ano && mes > competenciaAtual.mes)
    );
  }

  function isSelecionada(mes: number): boolean {
    return anoVisivel === competencia.ano && mes === competencia.mes;
  }

  function isAtual(mes: number): boolean {
    return anoVisivel === competenciaAtual.ano && mes === competenciaAtual.mes;
  }

  const podeAvancarAno = anoVisivel < competenciaAtual.ano;

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={alternarCalendario}
        className="group flex h-10 w-full min-w-[10.5rem] max-w-[10.5rem] items-center justify-center gap-2.5 rounded-xl px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/35 hover:bg-white/20 sm:w-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <span className="capitalize">{NOMES_MESES[competencia.mes - 1]}</span>

        <span className="text-white/60">{competencia.ano}</span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-0.5 opacity-60 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[min(18rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#1e1c2e] shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <button
              type="button"
              onClick={() => setAnoVisivel((ano) => ano - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span className="text-sm font-bold tracking-wide text-white">
              {anoVisivel}
            </span>

            <button
              type="button"
              onClick={() => setAnoVisivel((ano) => ano + 1)}
              disabled={!podeAvancarAno}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-3">
            {ABREV_MESES.map((abrev, index) => {
              const mes = index + 1;
              const futuro = isFutura(mes);
              const selecionado = isSelecionada(mes);
              const atual = isAtual(mes);

              return (
                <button
                  key={mes}
                  type="button"
                  disabled={futuro}
                  onClick={() => selecionarMes(mes)}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150",
                    selecionado
                      ? "bg-[#6627cc] text-white shadow-[0_4px_16px_rgba(102,39,204,0.45)]"
                      : futuro
                        ? "cursor-not-allowed text-white/20"
                        : atual
                          ? "border border-[#6627cc]/50 text-white hover:bg-white/10"
                          : "text-white/60 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {abrev}
                  {atual && !selecionado && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#6627cc]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/10 px-3 pb-3">
            <button
              type="button"
              onClick={() => {
                onSelecionar(competenciaAtual.ano, competenciaAtual.mes);
                setAberto(false);
              }}
              disabled={
                competencia.ano === competenciaAtual.ano &&
                competencia.mes === competenciaAtual.mes
              }
              className="w-full rounded-xl py-2 text-xs font-semibold text-white/50 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Ir para o mês atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
