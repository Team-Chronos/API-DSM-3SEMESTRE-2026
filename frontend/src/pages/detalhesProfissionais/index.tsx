import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModalConfirmarExclusao from "../../components/detalhesProfissionais/modalExcluir";
import { type Profissional, getInitials } from "../listaProfissionais";

const CARGOS = [
  {
    id: 1,
    label: "Dev",
    color: "bg-[#2d1f6e] text-[#a78bfa] border border-[#6627cc]/40",
  },
  {
    id: 2,
    label: "Gerente",
    color: "bg-[#1a2e1a] text-[#4ade80] border border-[#22c55e]/30",
  },
  {
    id: 3,
    label: "Financeiro",
    color: "bg-[#1e2a1e] text-[#86efac] border border-[#16a34a]/30",
  },
];

function TelaDetalhesProfissional() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargoId: 1,
    ativo: true,
  });

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setErro(null);

    fetch(`/api/profissionais/api/profissionais/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profissional não encontrado");
        return res.json();
      })
      .then((data: Profissional) => {
        setProfissional(data);
        setForm({
          nome: data.nome,
          email: data.email,
          cargoId: data.cargoId,
          ativo: data.ativo,
        });
        setLoading(false);
      })
      .catch((err) => {
        setErro(err.message);
        setLoading(false);
      });
  }, [id]);

  function handleCancelarEdicao() {
    if (!profissional) return;

    setForm({
      nome: profissional.nome,
      email: profissional.email,
      cargoId: profissional.cargoId,
      ativo: profissional.ativo,
    });
    setEditando(false);
    setFeedback(null);
  }

  async function handleSalvar() {
    if (!profissional || !id) return;

    setSalvando(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/profissionais/api/profissionais/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profissional, ...form }),
      });

      if (!res.ok) throw new Error("Erro ao salvar alterações");

      const atualizado: Profissional = await res.json();

      setProfissional(atualizado);
      setForm({
        nome: atualizado.nome,
        email: atualizado.email,
        cargoId: atualizado.cargoId,
        ativo: atualizado.ativo,
      });
      setEditando(false);
      setFeedback({
        tipo: "sucesso",
        mensagem: "Profissional atualizado com sucesso!",
      });
    } catch (err: any) {
      setFeedback({ tipo: "erro", mensagem: err.message });
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!profissional || !id) return;

    setExcluindo(true);

    try {
      const res = await fetch(`/api/profissionais/api/profissionais/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir profissional");

      navigate("/profissionais");
    } catch (err: any) {
      setFeedback({ tipo: "erro", mensagem: err.message });
      setModalExcluir(false);
    } finally {
      setExcluindo(false);
    }
  }

  const cargoAtual = CARGOS.find(
    (c) => c.id === (editando ? form.cargoId : profissional?.cargoId),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6627cc] border-t-transparent" />
      </div>
    );
  }

  if (erro || !profissional) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-slate-400">
        <p>{erro ?? "Profissional não encontrado"}</p>
        <button
          onClick={() => navigate("/profissionais")}
          className="text-sm text-[#9d71f5] hover:text-white transition"
        >
          ← Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <>
      {modalExcluir && (
        <ModalConfirmarExclusao
          nome={profissional.nome}
          onConfirm={handleExcluir}
          onCancel={() => setModalExcluir(false)}
          loading={excluindo}
        />
      )}

      <div className="p-6 text-white">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profissionais")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#232329] text-slate-400 transition hover:border-[#6627cc]/50 hover:text-white"
            >
              <svg
                width="16"
                height="16"
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

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Detalhes do profissional
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Visualize e gerencie as informações do profissional
              </p>
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                feedback.tipo === "sucesso"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {feedback.tipo === "sucesso" ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {feedback.mensagem}
            </div>
          )}

          <div className="overflow-hidden rounded-[15px] border border-white/10 bg-[#232329] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="relative border-b border-white/8 bg-gradient-to-r from-[#6627cc] via-[#5b21b6] to-[#4a1898] px-6 py-6 sm:px-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-white/15" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white shadow-lg backdrop-blur-sm border border-white/20">
                    {getInitials(profissional.nome)}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {profissional.nome}
                    </h2>

                    <div className="mt-1 flex items-center gap-2">
                      {cargoAtual && (
                        <span
                          className={`inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold ${cargoAtual.color}`}
                        >
                          {cargoAtual.label}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                          profissional.ativo
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profissional.ativo ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {profissional.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!editando ? (
                    <>
                      <button
                        onClick={() => {
                          setEditando(true);
                          setFeedback(null);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 border border-white/20"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>

                      <button
                        onClick={() => setModalExcluir(true)}
                        className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 backdrop-blur-sm transition hover:bg-red-500/35 border border-red-500/20"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Excluir
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelarEdicao}
                        disabled={salvando}
                        className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 border border-white/15 disabled:opacity-50"
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={handleSalvar}
                        disabled={salvando}
                        className="flex items-center gap-2 rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:opacity-50 shadow-lg shadow-purple-900/30"
                      >
                        {salvando ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Salvar
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Nome completo
                  </label>

                  {editando ? (
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nome: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#1a1a20] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6627cc]/60 focus:ring-1 focus:ring-[#6627cc]/40 transition"
                    />
                  ) : (
                    <p className="rounded-xl border border-white/5 bg-[#1a1a20] px-4 py-2.5 text-sm text-white">
                      {profissional.nome}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    E-mail
                  </label>

                  {editando ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#1a1a20] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6627cc]/60 focus:ring-1 focus:ring-[#6627cc]/40 transition"
                    />
                  ) : (
                    <p className="rounded-xl border border-white/5 bg-[#1a1a20] px-4 py-2.5 text-sm text-slate-300">
                      {profissional.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Cargo
                  </label>

                  {editando ? (
                    <select
                      value={form.cargoId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cargoId: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#1a1a20] px-4 py-2.5 text-sm text-white outline-none focus:border-[#6627cc]/60 focus:ring-1 focus:ring-[#6627cc]/40 transition appearance-none cursor-pointer"
                    >
                      {CARGOS.map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          className="bg-[#1a1a20]"
                        >
                          {c.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-[#1a1a20] px-4 py-2.5">
                      {cargoAtual && (
                        <span
                          className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${cargoAtual.color}`}
                        >
                          {cargoAtual.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Status
                  </label>

                  {editando ? (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1a1a20] px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, ativo: !f.ativo }))
                        }
                        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                          form.ativo ? "bg-[#6627cc]" : "bg-slate-600"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            form.ativo ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-slate-300">
                        {form.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-[#1a1a20] px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${
                          profissional.ativo
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profissional.ativo ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        {profissional.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profissional.projetos && profissional.projetos.length > 0 && (
              <div className="border-t border-white/8 px-6 pb-6 pt-5 sm:px-8">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Projetos vinculados ({profissional.projetos.length})
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {profissional.projetos.map((proj) => (
                    <div
                      key={proj.projetoId}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-[#1a1a20] px-4 py-3 transition hover:border-[#6627cc]/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {proj.nomeProjeto}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {proj.codigoProjeto}
                        </p>
                      </div>

                      <span className="ml-3 shrink-0 rounded-lg bg-[#2d1f6e]/60 px-2.5 py-1 text-xs font-semibold text-[#a78bfa] border border-[#6627cc]/20">
                        R$ {proj.valorHora.toFixed(2)}/h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TelaDetalhesProfissional;