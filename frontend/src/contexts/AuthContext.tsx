import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/usuario";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  user?: User;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
};

type LoginResponse = {
  token: string;
};

const API_BASE = "/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<User>(token);
      const exp = (decoded as any).exp;
      if (exp && Date.now() >= exp * 1000) throw new Error("expirado");
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (response.status === 401) {
      localStorage.removeItem("token");
      setUser(undefined);
      window.location.href = "/login";
      throw new Error("Sessão expirada");
    }
    return response;
  };

  async function login(email: string, senha: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, senha }),
      });

      if (!response.ok) {
        alert(" Resposta não OK");
        return false;
      }

      const text = await response.text();

      if (!text) {
        alert(" Resposta vazia");
        return false;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert(" Erro ao fazer parse do JSON:");
        return false;
      }

      alert(" Dados parseados:");
      alert(" Token extraído:");

      if (!data.token) {
        alert(" Token não encontrado na resposta!");
        return false;
      }

      localStorage.setItem("token", data.token);
      alert(" Token salvo no localStorage. Verificando:");

      const decodedUser = jwtDecode<User>(data.token);
      setUser(decodedUser);
      alert(" Usuário decodificado:");

      return true;
    } catch (error) {
      alert(" Erro no login:");
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(undefined);
    window.location.href = "/login";
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}