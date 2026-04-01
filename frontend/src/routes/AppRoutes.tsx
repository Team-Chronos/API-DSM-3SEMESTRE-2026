import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Layout = lazy(() => import("../components/Layout"))
const ApontamentoTempo = lazy(() => (import("../pages/ApontamentoTempo")))

const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "projetos/:projetoId/apontamento/",
                element: <ApontamentoTempo />
            }
        ]
    }
])

export default AppRoutes