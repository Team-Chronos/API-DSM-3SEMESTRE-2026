import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { carregarProfissionaisPorProjeto } from "../service/servicoProfissionais";
import AccessLoading from "./AccessLoading";

type ProjectRouteProps = {
  children?: ReactNode;
};

export default function ProjectRoute({ children }: ProjectRouteProps) {
  const { projetoId } = useParams();
  const { user, loading, podeGerenciarProjetos } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarAcesso() {
      if (!user || !projetoId) {
        if (ativo) {
          setPermitido(false);
          setVerificando(false);
        }
        return;
      }

      if (podeGerenciarProjetos) {
        if (ativo) {
          setPermitido(true);
          setVerificando(false);
        }
        return;
      }

      try {
        const profissionais = await carregarProfissionaisPorProjeto(projetoId);
        const estaVinculado = profissionais.some(
          (profissional) => Number(profissional.id) === Number(user.id),
        );

        if (ativo) {
          setPermitido(estaVinculado);
        }
      } catch {
        if (ativo) {
          setPermitido(false);
        }
      } finally {
        if (ativo) {
          setVerificando(false);
        }
      }
    }

    setVerificando(true);
    verificarAcesso();

    return () => {
      ativo = false;
    };
  }, [user, projetoId, podeGerenciarProjetos]);

  if (loading || verificando) {
    return <AccessLoading message="Verificando acesso ao projeto..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!permitido) {
    return <Navigate to="/sem-acesso" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
