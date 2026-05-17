import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import CadastroProfissional from "../pages/cadastroProfissionail";
import AssociacaoProfissionalProjeto from "../pages/associacaoProfissionalProjeto";
import GestaoProfissionais from "../pages/gestaoDeProfissionais";
import ApontamentoTempo from "../pages/ApontamentoTempo";
import TarefasPorProjeto from "../pages/GerenciarTarefas/TarefasPorProjeto";
import TelaProjetos from "../pages/GerenciarTarefas/Projetos";
import Projetos from "../pages/Projetos";
import Login from "../pages/login";
import DetalhesProjeto from "../pages/DetalhesProjeto";
import { ProjetoProvider } from "../contexts/ProjetoContext";
import ProjetoLoader from "../components/ProjetosLoader";
import TelaListaProfissionais from "../pages/listaProfissionais";
import TelaDetalhesProfissional from "../pages/detalhesProfissionais";
import PrivateRoute from "./PrivateRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleRoute from "./RoleRoute";
import ProjectRoute from "./ProjectRoute";
import SemAcesso from "../pages/SemAcesso";

const Layout = lazy(() => import("../components/Layout"));
const DashboardPage = lazy(() => import("../pages/Financeiro/FinanceiroPage"));

const adminRoles = ["ROLE_ADMIN"];
const adminGerenteRoles = ["ROLE_ADMIN", "ROLE_GERENTE_PROJETO"];

const loading = <div className="flex min-h-screen items-center justify-center bg-[#1b1b1f] text-white">Loading...</div>;

const AppRoutes = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/sem-acesso",
    element: <SemAcesso />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Suspense fallback={loading}>
          <Layout />
        </Suspense>
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projetos" replace />,
      },
      {
        path: "projetos",
        element: <Projetos />,
      },
      {
        path: "projetos/:projetoId/",
        element: (
          <ProjectRoute>
            <ProjetoProvider>
              <ProjetoLoader />
            </ProjetoProvider>
          </ProjectRoute>
        ),
        children: [
          {
            index: true,
            element: <DetalhesProjeto />,
          },
          {
            path: "apontamento",
            element: (
              <Suspense fallback={loading}>
                <ApontamentoTempo />
              </Suspense>
            ),
          },
          {
            path: "tarefas",
            element: (
              <RoleRoute allowedRoles={adminGerenteRoles}>
                <Suspense fallback={loading}>
                  <TarefasPorProjeto />
                </Suspense>
              </RoleRoute>
            ),
          },
        ],
      },
      {
        path: "financeiro",
        element: (
          <RoleRoute allowedRoles={adminRoles}>
            <Suspense fallback={loading}>
              <DashboardPage />
            </Suspense>
          </RoleRoute>
        ),
      },
      {
        path: "profissionais",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <TelaListaProfissionais />
          </RoleRoute>
        ),
      },
      {
        path: "profissionais/:id",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <TelaDetalhesProfissional />
          </RoleRoute>
        ),
      },
      {
        path: "cadastro-profissionais",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <CadastroProfissional />
          </RoleRoute>
        ),
      },
      {
        path: "associacoes",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <AssociacaoProfissionalProjeto />
          </RoleRoute>
        ),
      },
      {
        path: "gestao-profissionais",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <GestaoProfissionais />
          </RoleRoute>
        ),
      },
      {
        path: "tarefas",
        element: (
          <RoleRoute allowedRoles={adminGerenteRoles}>
            <TelaProjetos />
          </RoleRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/projetos" replace />,
      },
    ],
  },
]);

export default AppRoutes;
