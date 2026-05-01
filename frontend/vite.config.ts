import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Nenhum rewrite – o gateway receberá a URL exata (ex: /api/login, /api/projeto/projetos)
        // Mas como o gateway não tem prefixo /api, precisamos removê-lo? 
        // ATENÇÃO: O gateway espera /login, /projeto/projetos, etc. Portanto, PRECISAMOS DO REWRITE!
        // Corrigindo: o gateway NÃO TEM /api. Então o rewrite é necessário.
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});