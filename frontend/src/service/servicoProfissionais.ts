import type { Profissional } from "../types/profissionalService";
import type { ProfissionaisAssociados } from "../types/projeto";
import { ApiProfissionais, ApiProjeto } from "./servicoApi";

/**
 * @param id 
 * @returns 
 */
export async function carregarProfissionalPorId(id: number | string): Promise<Profissional | null> {
  try {
    const res = await ApiProfissionais.get(`/profissionais/api/profissionais/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Erro ao carregar profissional de id", id, error);
    return null;
  }
}

/**
 * @param projetoId ID do projeto
 * @returns 
 */
export async function carregarProfissionaisPorProjeto(projetoId: number | string): Promise<Profissional[]> {
  try {
    const { data } = await ApiProjeto.get<ProfissionaisAssociados[]>(`/projeto/projetos/${projetoId}/usuarios`);
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
  } catch (error: any) {
    console.error("Erro ao buscar profissionais do projeto", projetoId, error);
    return [];
  }
}