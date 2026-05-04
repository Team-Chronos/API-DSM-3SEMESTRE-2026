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
        element: <Navigate to="/login" replace />
      },
      {

        path:"profissionais",
        element: <TelaListaProfissionais/>
      },
      {
        path:"profissionais/:id",
        element: <TelaDetalhesProfissional/>
      },
       
      {
        path: "cadastro-profissionais",
        element: <CadastroProfissional />

      },
      {
        path: "associacoes",
        element: <AssociacaoProfissionalProjeto />,
      },
      {
        path: "gestao-profissionais",
        element: <GestaoProfissionais />,
      },
      {
        path: "financeiro",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "projetos",
        element: <Projetos />,
      },
      {
        path: "projetos/:projetoId/",
        element: (
          <ProjetoProvider>
            <ProjetoLoader />
          </ProjetoProvider>
        ),
        children: [
          {
            index: true,
            element: <DetalhesProjeto />,
          },
          {
            path: "apontamento",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <ApontamentoTempo />
              </Suspense>
            ),
          },
          {
            path: "tarefas",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <TarefasPorProjeto />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "tarefas",
        element: <TelaProjetos />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default AppRoutes;
