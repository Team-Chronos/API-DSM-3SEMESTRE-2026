import type { ProfissionalGanhos, ProjetoFinanceiro } from "../types/financeiro";

export function filtrarProjetos(
  projetos: ProjetoFinanceiro[],
  busca: string,
): ProjetoFinanceiro[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) {
    return projetos;
  }

  return projetos.filter((projeto) => {
    return (
      projeto.nomeProjeto.toLowerCase().includes(termo) ||
      projeto.tipoProjeto.toLowerCase().includes(termo) ||
      String(projeto.projetoId).includes(termo)
    );
  });
}

export function filtrarProfissionais(
  profissionais: ProfissionalGanhos[],
  busca: string,
): ProfissionalGanhos[] {
  const termo = busca.trim().toLowerCase();

  if (!termo) {
    return profissionais;
  }

  return profissionais.filter((profissional) => {
    return (
      profissional.usuarioNome.toLowerCase().includes(termo) ||
      String(profissional.usuarioId).includes(termo)
    );
  });
}
