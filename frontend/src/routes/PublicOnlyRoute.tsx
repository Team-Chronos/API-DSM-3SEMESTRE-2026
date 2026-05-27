import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessLoading from "./AccessLoading";

type PublicOnlyRouteProps = {
  children?: ReactNode;
};

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AccessLoading message="Carregando..." />;
  }

  if (user) {
    return <Navigate to="/projetos" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
