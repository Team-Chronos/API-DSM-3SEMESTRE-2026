import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const loginProxyTarget = env.VITE_LOGIN_API_URL || 'http://localhost:8083'
  const profissionaisProxyTarget =
    env.VITE_API_PROFISSIONAIS_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8081'

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api/auth': {
          target: loginProxyTarget,
          changeOrigin: true,
          secure: false
        },
        '/api': {
          target: profissionaisProxyTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
