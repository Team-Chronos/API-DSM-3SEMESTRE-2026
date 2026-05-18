import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/usuario";
import { toastError } from "../utils/toastUtils";

type AuthContextType = {
  user?: User;
  loading: boolean;
  cargoId: number | null;
  isDev: boolean;
  isGerenteProjeto: boolean;
  isAdmin: boolean;
  podeEditarProjeto: boolean;
  podeGerenciarProjetos: boolean;
  podeAcessarFinanceiro: boolean;
  hasCargo: (cargo: number) => boolean;
  hasAnyCargo: (allowedCargos: number[]) => boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
};

type LoginResponse = { token: string };

const API_BASE = "/api";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolverCargoId(user?: User): number | null {
  if (!user) return null;

  const dados = user as User & {
    cargoId?: number | string;
    cargo_id?: number | string;
    id_cargo?: number | string;
    ID_Cargo?: number | string;
  };

  const valor = dados.cargo_id ?? dados.cargoId ?? dados.id_cargo ?? dados.ID_Cargo;
  const cargo = Number(valor);

  return Number.isFinite(cargo) && cargo > 0 ? cargo : null;
}

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

      if (exp && Date.now() >= exp * 1000) {
        throw new Error("Token expirado");
      }

      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargoId = useMemo(() => resolverCargoId(user), [user]);

  const hasCargo = (cargo: number) => cargoId === Number(cargo);

  const hasAnyCargo = (allowedCargos: number[]) => {
    if (!allowedCargos.length) return true;
    if (!cargoId) return false;
    return allowedCargos.some((cargo) => Number(cargo) === cargoId);
  };

  const isDev = cargoId === 1;
  const isGerenteProjeto = cargoId === 2;
  const isAdmin = cargoId === 3;

  const podeEditarProjeto = isGerenteProjeto || isAdmin;
  const podeGerenciarProjetos = isGerenteProjeto || isAdmin;
  const podeAcessarFinanceiro = isAdmin;

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

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

      if (!response.ok) return false;

      const data = (await response.json()) as LoginResponse;

      if (!data.token || typeof data.token !== "string") return false;

      localStorage.setItem("token", data.token);

      const decodedUser = jwtDecode<User>(data.token);
      setUser(decodedUser);

      return true;
    } catch (error) {
      toastError(`Erro no login: ${error}`);
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        cargoId,
        isDev,
        isGerenteProjeto,
        isAdmin,
        podeEditarProjeto,
        podeGerenciarProjetos,
        podeAcessarFinanceiro,
        hasCargo,
        hasAnyCargo,
        login,
        logout,
        getToken,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return ctx;
}
