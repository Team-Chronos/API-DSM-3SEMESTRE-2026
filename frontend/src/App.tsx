import { BrowserRouter, Routes, Route, Navigate, RouterProvider } from "react-router-dom";
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./components/pages/Dashboard";
import Usuarios from "./components/pages/Usuarios";
import Projetos from "./components/pages/Projetos";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRoutes} />
    </AuthProvider>
  )
}

