import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export interface Projeto {
  projetoId: number;
  nomeProjeto: string;
  codigoProjeto: string;
  valorHora: number;
}

export interface Profissional {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  cargoId: number;
  projetos: Projeto[];
}
// estilização de acordo com id do cargo
const CARGO_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Dev", color: "bg-[#2d1f6e] text-[#a78bfa] border border-[#6627cc]/40" },
  2: { label: "Gerente", color: "bg-[#1a2e1a] text-[#4ade80] border border-[#22c55e]/30" },
  3: { label: "Financeiro", color: "bg-[#1e2a1e] text-[#86efac] border border-[#16a34a]/30" },
};

// função para Selecionar as inicias do avatar de cada profissional
export function getInitials(nome: string): string {
  const parts = nome.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "from-[#6627cc] to-[#4a1898]",
  "from-[#7c3aed] to-[#5b21b6]",
  "from-[#4f46e5] to-[#3730a3]",
  "from-[#7e22ce] to-[#581c87]",
  "from-[#6d28d9] to-[#4c1d95]",
];


//seleção da cor de acordo com o id
function getAvatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

const ITEMS_PER_PAGE = 8;

function TelaListaProfissionais() {

  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/profissionais")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar profissionais");
        return res.json();
      })
      .then((data: Profissional[]) => {
        setProfissionais(data);
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, []);

  // logica de filtro do pesquisar
  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return profissionais;
    return profissionais.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo)
    );
  }, [profissionais, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));

  const paginaAtual = useMemo(() => {
    const inicio = (pagina - 1) * ITEMS_PER_PAGE;
    return filtrados.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [filtrados, pagina]);

  // resetar paginação ao buscar
  useEffect(() => {
    setPagina(1);
  }, [busca]);

  function getCargo(cargoId: number) {
    return CARGO_MAP[cargoId] ?? { label: `Cargo ${cargoId}`, color: "bg-[#232329] text-slate-300 border border-white/10" };
  }

  return (
    <div className="p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-5">

        {/* CABEÇALHO */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Profissionais
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Visualize e gerencie os profissionais cadastrados
            </p>
          </div>

          {/* Resumo */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#232329] px-4 py-3 shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6627cc] to-[#4a1898] shadow-lg shadow-purple-900/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resumo</p>
              <p className="text-sm font-semibold text-white">
                {loading ? "..." : `${profissionais.length} profissional(is) cadastrado(s)`}
              </p>
            </div>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

          {/* Card Título */}
          <div className="relative border-b border-white/8 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#4a1898] px-6 py-6 sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/15" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Lista de profissionais
                </h2>
                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  Veja todos os profissionais cadastrados e gerencie suas informações.
                </p>
              </div>
              <button
                onClick={() => navigate("/cadastro-profissionais")}
                className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-[#6d28d9] active:scale-95 whitespace-nowrap"
              >
                <span className="text-lg leading-none">+</span> Novo profissional
              </button>
            </div>
          </div>

          {/* Busca e contagem */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="relative w-full max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar profissional..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1a1a20] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6627cc]/60 focus:ring-1 focus:ring-[#6627cc]/40 transition"
              />
            </div>
            <span className="rounded-xl border border-white/10 bg-[#1a1a20] px-4 py-2 text-sm text-slate-300 whitespace-nowrap">
              {loading ? "..." : `${filtrados.length} profissional(is)`}
            </span>
          </div>

          {/* Tabela */}
          <div className="px-2 pb-2 sm:px-4">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_2fr_auto] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <span>Nome</span>
              <span>Cargo</span>
              <span>Email</span>
              <span></span>
            </div>

            {/* Linhas */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Carregando...</div>
            ) : erro ? (
              <div className="py-16 text-center text-red-400 text-sm">{erro}</div>
            ) : paginaAtual.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">Nenhum profissional encontrado.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {paginaAtual.map((prof) => {
                  const cargo = getCargo(prof.cargoId);
                  return (
                    <div
                      key={prof.id}
                      className="grid grid-cols-[2fr_1fr_2fr_auto] items-center gap-4 rounded-xl px-4 py-3.5 transition hover:bg-white/5"
                    >
                      {/* Nome */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(prof.id)} text-xs font-bold text-white shadow`}>
                          {getInitials(prof.nome)}
                        </div>
                        <span className="truncate font-medium text-white text-sm">{prof.nome}</span>
                      </div>

                      {/* Cargo */}
                      <div>
                        <span className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${cargo.color}`}>
                          {cargo.label}
                        </span>
                      </div>

                      {/* Email */}
                      <span className="truncate text-sm text-slate-400">{prof.email}</span>

                      {/* Aguardando decisão */}
                      {}
                      <button
                        onClick={() => navigate(`/profissionais/${prof.id}`)}
                        className="flex items-center gap-1 text-sm font-medium text-[#9d71f5] transition hover:text-white whitespace-nowrap"
                      >
                        Ver detalhes
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                      {}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer / Paginação */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/8 px-6 py-4 sm:flex-row sm:px-8">
            <span className="text-xs text-slate-500">
              Mostrando {Math.min((pagina - 1) * ITEMS_PER_PAGE + 1, filtrados.length)}–{Math.min(pagina * ITEMS_PER_PAGE, filtrados.length)} de {filtrados.length} profissionais
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1a20] text-slate-400 transition hover:border-[#6627cc]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPagina(num)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition ${
                    num === pagina
                      ? "bg-[#6627cc] text-white shadow shadow-purple-900/40"
                      : "border border-white/10 bg-[#1a1a20] text-slate-400 hover:border-[#6627cc]/50 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1a20] text-slate-400 transition hover:border-[#6627cc]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TelaListaProfissionais;
