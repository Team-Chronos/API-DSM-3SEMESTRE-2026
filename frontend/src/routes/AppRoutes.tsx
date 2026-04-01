import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import CadastroProfissional from "../pages/cadastroProfissionail";
import AssociacaoProfissionalProjeto from "../pages/associacaoProfissionalProjeto";
import GestaoProfissionais from "../pages/gestaoDeProfissionais";
import Login from "../pages/login";
import AppLayout from "../components/layout/AppLayout";
import ApontamentoTempo from "../pages/ApontamentoTempo";

const Layout = lazy(() => import("../components/layout"))
const DashboardPage = lazy(() => (import("../pages/Financeiro/FinanceiroPage")))

const AppRoutes = createBrowserRouter([{
    path: "/",
    element: (
        <Suspense fallback={<div>Loading...</div>}>
            <AppLayout />
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
            element: <DashboardPage />
        },
        {
            path: "apontamento/tempo/",
            element: <ApontamentoTempo />
        },
    ]
},
{
    path: "/login",
    element: <Login />
}])

export default AppRoutes