import { useNavigate } from "react-router-dom";

export default function SemAcesso() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1b1b1f] p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#232329] p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Acesso negado</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Você não tem permissão para acessar esta página.
        </p>

        <button
          type="button"
          onClick={() => navigate("/projetos", { replace: true })}
          className="mt-6 w-full rounded-2xl bg-[#6627cc] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#7634dd]"
        >
          Voltar para projetos
        </button>
      </div>
    </div>
  );
}
