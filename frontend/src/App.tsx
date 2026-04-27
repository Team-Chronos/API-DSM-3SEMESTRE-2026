import { RouterProvider } from "react-router-dom";
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={AppRoutes} />
        <ToastContainer
          theme="dark"
        />
      </AuthProvider>
    </QueryClientProvider>
  )
  
}

