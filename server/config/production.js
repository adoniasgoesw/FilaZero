// server/config/production.js - Configurações específicas para produção
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações de produção
export const productionConfig = {
  // Caminhos
  uploadsPath: path.join(__dirname, '..', 'uploads'),
  tempPath: path.join(__dirname, '..', 'temp'),
  
  // Limites de upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Configurações de segurança
  corsOrigins: [
    'https://filazero.netlify.app',
    'https://filazero-sistema-de-gestao.onrender.com'
  ],
  
  // Headers de segurança
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  },
  
  // Configurações de log
  logLevel: process.env.LOG_LEVEL || 'info',
  enableDetailedLogs: process.env.NODE_ENV === 'production' ? false : true
};

// Função para validar ambiente de produção
export const validateProductionEnvironment = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NODE_ENV'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Ambiente de produção validado com sucesso');
  return true;
};

// Função para configurar logs de produção
export const setupProductionLogging = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Configurando logs de produção...');
    
    // Redirecionar logs de erro para stderr
    const originalError = console.error;
    console.error = (...args) => {
      process.stderr.write(args.join(' ') + '\n');
    };
    
    console.log('✅ Logs de produção configurados');
  }
};
