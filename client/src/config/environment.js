// src/config/environment.js - Configuração de ambiente
export const config = {
  // API URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Ambiente
  environment: import.meta.env.MODE || 'development',
  
  // Verificar se está em produção
  isProduction: import.meta.env.MODE === 'production',
  
  // Verificar se está em desenvolvimento
  isDevelopment: import.meta.env.MODE === 'development',
  
  // Debug das variáveis de ambiente
  debug: {
    viteApiUrl: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE,
    allEnv: import.meta.env,
  }
};

// Log da configuração
console.log('🔧 Configuração de ambiente carregada:', config);
console.log('🌍 API URL:', config.apiUrl);
console.log('🌐 Ambiente:', config.environment);
console.log('📦 Variáveis de ambiente:', config.debug);

export default config;
