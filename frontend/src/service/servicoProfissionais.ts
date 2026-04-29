import type { Profissional } from "../types/profissionalService";
import type { ProfissionaisAssociados } from "../types/projeto";
import { ApiProfissionais, ApiProjeto } from "./servicoApi";

export async function carregarProfissionalPorId(id: number | string): Promise<Profissional | null> {
  try {
    const res = await ApiProfissionais.get(`/profissionais/api/profissionais/${id}`);
    return res.data as Profissional;
  } catch (error) {
    console.error("Erro ao carregar profissional de id", id, error);
    return null;
  }
}

export async function carregarProfissionaisPorProjeto(projetoId: number | string): Promise<Profissional[]> {
  try {
    const res = await ApiProjeto.get(`/projeto/projetos/${projetoId}/usuarios`);
    const data = res.data as ProfissionaisAssociados[];

    if (!Array.isArray(data)) {
      console.warn("Resposta de profissionais não é array:", data);
      return [];
    }

    const profissionais = await Promise.all(
      data.map(async (profissional) => {
        try {
          return await carregarProfissionalPorId(profissional.usuarioId);
        } catch {
          return null;
        }
      })
    );

    return profissionais.filter((p): p is Profissional => p !== null);
  } catch (error) {
    console.error("Erro ao buscar profissionais do projeto", projetoId, error);
    return [];
  }
}