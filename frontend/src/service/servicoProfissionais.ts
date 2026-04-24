import type { Profissional } from "../types/profissionalService";
import type { ProfissionaisAssociados } from "../types/projeto";
import { ApiProfissionais, ApiProjeto } from "./servicoApi";

export async function carregarPorfissionalPorId(id: number | string): Promise<Profissional> {
  try {
    const res = await ApiProfissionais.get(`/api/profissionais/${id}`)
    return res.data
  } catch (error: any) {
    console.log("Erro ao carregar profissional de id ", id)
    return error
  }
}

export async function carregarProfissionaisPorProjeto(projetoId: number | string): Promise<Profissional[]> {
  try {
    const { data } = await ApiProjeto.get<ProfissionaisAssociados[]>(`/projetos/${projetoId}/usuarios`)
    const profissionais = await Promise.all(
      data.map(async (profissional) => {
        try {
          return await carregarPorfissionalPorId(profissional.usuarioId)
        } catch {
          return null
        }
      })
    )

    return profissionais.filter((profissional) => {
      return profissional !== null
    })
  } catch (error: any) {
    console.error("Erro ao buscar profissionais do projeto ", projetoId)    
    return error
  }
}