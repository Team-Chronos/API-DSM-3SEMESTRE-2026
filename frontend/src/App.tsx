import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./components/pages/Dashboard";
import Usuarios from "./components/pages/Usuarios";
import Projetos from "./components/pages/Projetos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="projetos" element={<Projetos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}