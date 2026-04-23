import { createContext, useContext, type ReactNode } from "react"
import type { Projeto } from "../types/projeto"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ApiProjeto } from "../service/servicoApi"

type ProjetoContextType = {
  projeto?: Projeto
  isLoading: boolean
  refetch: () => void
}

// por enquanto ta usando refetch mas é melhor fazer as alterações usando mutation, como acredito que n vão nem pensar nisso ent tem o refetch pq funciona tbm

async function carregarProjeto(projetoId: string): Promise<Projeto>{
  const response = await ApiProjeto.get(`projetos/${projetoId}`)
  return response.data
}

const ProjetoContext = createContext<ProjetoContextType | undefined>(undefined)

export function ProjetoProvider({ children }: { children: ReactNode }) {
  const { projetoId } = useParams()

  if (!projetoId) {
    throw new Error("projetoId não encontrado")
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projeto", projetoId],
    queryFn: () => carregarProjeto(projetoId),
  })

  return (
    <ProjetoContext.Provider
      value={{
        projeto: data,
        isLoading,
        refetch
      }}
    >
      {children}
    </ProjetoContext.Provider>
  )
}

export function useProjetoContext() {
  const ctx = useContext(ProjetoContext)

  if (!ctx) {
    throw new Error("useProjetoContext fora do provider")
  }

  return ctx
}