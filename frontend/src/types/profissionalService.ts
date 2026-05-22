import { ApiProfissionais } from "../service/servicoApi"

export const CARGOS = [
  { id: 1, nome: "Desenvolvedor" },
  { id: 2, nome: "Gerente" },
  { id: 3, nome: "Administrador" },
] as const

export type CargoId = (typeof CARGOS)[number]["id"]

export interface Profissional {
  id: number
  nome: string
  email?: string
  ativo?: boolean
  cargoId?: CargoId
}

export interface ProjetoVinculado {
  id?: number
  projetoId?: number
  nome?: string
  codigo?: string
  responsavelId?: number
}

class ProfissionalService {
  async listarTodos(): Promise<Profissional[]> {
    try {
      const response = await ApiProfissionais.get(
        "/profissionais/api/profissionais",
      )
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Erro ao buscar profissionais:", error)
      return []
    }
  }

  async listarResponsaveis(): Promise<Profissional[]> {
    const todos = await this.listarTodos()
    return todos.filter((p) => p.cargoId === 2 || p.cargoId === 3)
  }

  async listarProjetosVinculados(
    usuarioId: number,
  ): Promise<ProjetoVinculado[]> {
    try {
      const response = await ApiProfissionais.get(
        `/profissionais/api/profissionais/${usuarioId}/projetos`,
      )
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error("Erro ao buscar projetos vinculados:", error)
      return []
    }
  }
}

export default new ProfissionalService()