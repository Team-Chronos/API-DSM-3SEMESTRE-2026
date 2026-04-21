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

import TelaListaProfissionais from "../pages/listaProfissionais";

const Layout = lazy(() => import("../components/Layout"));
const DashboardPage = lazy(() => import("../pages/Financeiro/FinanceiroPage"));

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
        path:"profissionais",
        element: <TelaListaProfissionais/>
      },
      {
        path: "cadastro-profissionais",
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
