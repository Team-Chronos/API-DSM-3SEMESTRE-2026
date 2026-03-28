import type {
    DashboardData,
    ProfissionalGanhos,
    ProjetoDetalhe,
    ProjetoFinanceiro,
} from "../types/financeiro";

const BASE_URL =
    import.meta.env.VITE_API_FINANCEIRO_URL ??
    "http://localhost:8085/financeiro";

async function request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar ${path}`);
    }

    return response.json() as Promise<T>;
}

export const apiFinanceiro = {
    buscarDashboard(): Promise<DashboardData> {
        return request<DashboardData>("/dashboard");
    },

    buscarProjetos(): Promise<ProjetoFinanceiro[]> {
        return request<ProjetoFinanceiro[]>("/projetos");
    },

    buscarProfissionais(): Promise<ProfissionalGanhos[]> {
        return request<ProfissionalGanhos[]>("/profissionais");
    },

    buscarProfissionalPorId(
        usuarioId: number,
        bonus = 0
    ): Promise<ProfissionalGanhos> {
        return request<ProfissionalGanhos>(
            `/profissionais/${usuarioId}?bonus=${bonus}`
        );
    },

    buscarProjetoDetalhe(projetoId: number): Promise<ProjetoDetalhe> {
        return request<ProjetoDetalhe>(`/projetos/${projetoId}/detalhes`);
    },
};