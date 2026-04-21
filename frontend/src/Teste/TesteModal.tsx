import { useState } from "react";
import ModalDetalheProjeto from "../features/projetos/modals/ProjetoDetalheModal";
import type { ProjetoDetalhe } from "../types/financeiro";

const projetoMock: ProjetoDetalhe = {
  projetoId: 3,
  nomeProjeto: "Sistema Financeiro",
  tipoProjeto: "Desenvolvimento",
  totalHoras: 26.5,
  custoTotal: 3163,
  valorHoraProjeto: 120,
  totalProfissionais: 3,
  profissionais: [
    {
      usuarioId: 1,
      usuarioNome: "Ana Souza",
      horasTrabalhadas: 12,
      valorHoraProjeto: 120,
      valorBaseCalculado: 1440,
    },
    {
      usuarioId: 2,
      usuarioNome: "Bruno Lima",
      horasTrabalhadas: 8,
      valorHoraProjeto: 120,
      valorBaseCalculado: 960,
    },
    {
      usuarioId: 3,
      usuarioNome: "Carla Mendes",
      horasTrabalhadas: 6.5,
      valorHoraProjeto: 120,
      valorBaseCalculado: 780,
    },
  ],
};

export default function TesteModalProjeto() {
  const [projetoSelecionado, setProjetoSelecionado] =
    useState<ProjetoDetalhe | null>(null);

  return (
    <main className="min-h-screen bg-[#1b1b1f] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Teste do modal de projeto
        </h1>

        <p className="mt-3 text-white/65">
          Clique no botão abaixo para visualizar o modal com equipe e produtividade.
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => setProjetoSelecionado(projetoMock)}
            className="rounded-2xl bg-violet-600 px-6 py-3 text-base font-medium text-white transition hover:bg-violet-500"
          >
            Abrir modal do projeto
          </button>
        </div>
      </div>

      <ModalDetalheProjeto
        aberto={!!projetoSelecionado}
        onFechar={() => setProjetoSelecionado(null)}
        projeto={projetoSelecionado}
      />
    </main>
  );
}