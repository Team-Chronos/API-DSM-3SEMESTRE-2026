import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessLoading from "./AccessLoading";

type RoleRouteProps = {
  allowedRoles: string[];
  children?: ReactNode;
};

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return <AccessLoading message="Verificando acesso..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
