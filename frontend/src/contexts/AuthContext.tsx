import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/usuario";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  user?: User
  loading: boolean
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode}){
  const [ user, setUser ] = useState<User>()
  const [ loading, setLoading ] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const decodedUser = jwtDecode<User>(token)
      setUser(decodedUser)

    } catch (error: any) {
      console.error("Token inválido")

      localStorage.removeItem("token")
      setUser(undefined)
    }

    setLoading(false)
  }, [])

  async function login (email: string, senha: string): Promise<boolean>{
    let decodedUser: User

    try {
      // fazer a requisição passando o email e a senha para pegar o token
      const token = 'abacaxi verde semi descascado'
      
      localStorage.setItem("token", token)
      decodedUser = jwtDecode<User>(token)
      setUser(decodedUser)
      return true

    } catch (error: any) {
      console.log("Erro no login")
      return false
    }
  }

  function logout (){
    localStorage.removeItem("token")
    setUser(undefined)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}