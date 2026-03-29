import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Layout = lazy(() => import("../components/Layout"))
const Projetos = lazy (() => import("../pages/Projetos" ))
const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/projetos",
                element: <Projetos />
            }
        ]
    }

])

export default AppRoutes