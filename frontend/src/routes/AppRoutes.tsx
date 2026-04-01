import { lazy, Suspense } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import CadastroProfissional from "../pages/cadastroProfissionail";
import AssociacaoProfissionalProjeto from "../pages/associacaoProfissionalProjeto";
import GestaoProfissionais from "../pages/gestaoDeProfissionais";
import Login from "../pages/login";

const Layout = lazy(() => import("../components/Layout"))

const AppRoutes = createBrowserRouter([{
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
    ]
},
{
    path: "/login",
    element: <Login />
}
])

export default AppRoutes