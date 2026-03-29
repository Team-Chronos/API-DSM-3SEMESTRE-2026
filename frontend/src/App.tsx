import { RouterProvider } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'

function App() {

  return (
    <AuthProvider>
      <RouterProvider router={AppRoutes} />
    </AuthProvider>
  )
}

export default App