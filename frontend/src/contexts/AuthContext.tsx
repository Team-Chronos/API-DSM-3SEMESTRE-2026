import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/usuario";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  user?: User
  loading: boolean
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
}

type LoginResponse = {
  token: string
}

function getDefaultApiUrl(): string {

  const host = window.location.hostname

  if (host.endsWith(".app.github.dev")) {
    return `${window.location.protocol}//${host.replace(/-\d+\.app\.github\.dev$/, "-8083.app.github.dev")}`
  }

  return "http://localhost:8083"
}

const RAW_API_URL = import.meta.env.VITE_LOGIN_API_URL ?? getDefaultApiUrl()
const API_URL = RAW_API_URL.trim().replace(/\/+$/, "")

function getLoginUrl(apiUrl: string): string {
  return `${apiUrl}/login`
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const decodedUser = jwtDecode<User>(token)
      setUser(decodedUser)
    } catch (error: any) {
      console.error("Token invalido")
      localStorage.removeItem("token")
      setUser(undefined)
    }

    setLoading(false)
  }, [])

  async function login(email: string, senha: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase()

      const response = await fetch(getLoginUrl(API_URL), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail, senha })
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json() as LoginResponse
      localStorage.setItem("token", data.token)

      const decodedUser = jwtDecode<User>(data.token)
      setUser(decodedUser)
      return true
    } catch (error: any) {
      console.log("Erro no login", error)
      return false
    }
  }

  function logout() {
    localStorage.removeItem("token")
    setUser(undefined)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  return context
}