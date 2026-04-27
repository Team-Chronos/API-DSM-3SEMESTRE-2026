import { Navigate, Outlet } from "react-router-dom"
import { useProjetoContext } from "../../contexts/ProjetoContext"

function ProjetoLoader() {
  const { projeto, isLoading } = useProjetoContext()

  if (isLoading) {
    return <div className="text-white/95">Carregando projeto...</div>
  }

  if (!projeto) {
    return <Navigate to="/projetos" replace />
  }

  return <Outlet />
}

export default ProjetoLoader