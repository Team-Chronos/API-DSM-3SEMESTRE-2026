import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import CadastroProfissional from "../pages/cadastroProfissionail";
import AssociacaoProfissionalProjeto from "../pages/associacaoProfissionalProjeto";
import GestaoProfissionais from "../pages/gestaoDeProfissionais";
import Login from "../pages/login";
import ApontamentoTempo from "../pages/ApontamentoTempo";
import TelaTarefas from "../pages/GerenciarTarefas/gerenciarItensTarefas";
import Projetos from "../pages/Projetos";


const Layout = lazy(() => import("../components/Layout"))
const DashboardPage = lazy(() => (import("../pages/Financeiro/FinanceiroPage")))

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
                element: <Navigate to="/profissionais" replace />
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

                path: "/gestao-profissionais",
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
                path: "projetos/:projetoId/apontamento/",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <ApontamentoTempo />
                    </Suspense>
                )
            },
             {
                path: "gerenciar/tarefas",
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <TelaTarefas />
                    </Suspense>
                )
            },
        ]
    },
    {
        path: "/login",
        element: <Login />
    }
])

export default AppRoutes