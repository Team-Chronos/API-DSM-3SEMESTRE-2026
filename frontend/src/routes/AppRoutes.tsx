import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const Layout = lazy(() => import("../components/layout"))

const AppRoutes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: []
    }
])

export default AppRoutes