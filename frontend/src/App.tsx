import { RouterProvider } from "react-router-dom";
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRoutes} />
      <ToastContainer
        theme="dark"
      />
    </AuthProvider>
  )
}

