import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Configuração para variáveis de ambiente
  define: {
    // Garantir que as variáveis de ambiente sejam acessíveis
    'process.env': {},
  },
  
  // Configuração de build
  build: {
    // Garantir que as variáveis de ambiente sejam incluídas no build
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // Configuração de servidor de desenvolvimento
  server: {
    port: 5173,
    host: true,
  },
})
