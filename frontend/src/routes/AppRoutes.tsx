import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import CadastroProfissional from "../features/pages/cadastroProfissionail";
import AssociacaoProfissionalProjeto from "../features/pages/associacaoProfissionalProjeto";
import GestaoProfissionais from "../features/pages/gestaoDeProfissionais";
import ApontamentoTempo from "../features/pages/apontamentoTempo";
import TarefasPorProjeto from "../features/pages/GerenciarTarefas/TarefasPorProjeto";
import TelaProjetos from "../features/pages/GerenciarTarefas/Projetos";
import Projetos from "../features/pages/Projetos/index";
import Login from "../features/pages/login/index";

const Layout = lazy(() => import("../components/Layout"));
const DashboardPage = lazy(() => import("../features/pages/Financeiro/FinanceiroPage"));

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projetos" replace />
      },
      {
        path: "profissionais",
        element: <CadastroProfissional />
      },
      {
        path: "associacoes",
        element: <AssociacaoProfissionalProjeto />
      },
      {
        path: "gestao-profissionais",
        element: <GestaoProfissionais />
      },
      {
        path: "financeiro",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardPage />
          </Suspense>
        )
      },
      {
        path: "projetos",
        element: <Projetos />
      },
      {
        path: "tarefas",
        element: <TelaProjetos />
      },
      {
        path: "projetos/:projetoId/apontamento",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ApontamentoTempo />
          </Suspense>
        )
      },
      {
        path: "tarefas/projeto/:projetoId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TarefasPorProjeto />
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  }
]);

export default AppRoutes;
