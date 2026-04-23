import { RouterProvider } from "react-router-dom";
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from "react-toastify";
import "./styles/toastStyles.css"

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRoutes} />
      <ToastContainer
        theme="dark"
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-container"
      />
    </AuthProvider>
  )
  
}

