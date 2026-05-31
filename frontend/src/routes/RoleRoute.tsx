import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessLoading from "./AccessLoading";

type RoleRouteProps = {
  allowedCargos: number[];
  children?: ReactNode;
};

export default function RoleRoute({ allowedCargos, children }: RoleRouteProps) {
  const { user, loading, hasAnyCargo } = useAuth();

  if (loading) {
    return <AccessLoading message="Verificando acesso..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyCargo(allowedCargos)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
