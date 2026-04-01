import { useEffect, type ReactNode } from "react";

interface ModalBaseProps {
  aberto: boolean;
  onFechar: () => void;
  titulo?: string;
  subtitulo?: string;
  children: ReactNode;
  larguraClasse?: string;
}

export default function ModalBase({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  children,
  larguraClasse = "max-w-5xl",
}: ModalBaseProps) {
  useEffect(() => {
    if (!aberto) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onFechar();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 bg-black/65 backdrop-blur-[4px]"
        onClick={onFechar}
      />

      <div
        className={`relative z-10 w-full ${larguraClasse} animate-[modalFadeIn_0.22s_ease-out]`}
      >
        <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="relative border-b border-white/8 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#4a1898] px-6 py-6 sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/15" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                {titulo && (
                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {titulo}
                  </h2>
                )}

                {subtitulo && (
                  <p className="mt-2 text-sm text-white/75 sm:text-base">
                    {subtitulo}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onFechar}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85 transition hover:bg-white/15 hover:text-white"
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="max-h-[78vh] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}