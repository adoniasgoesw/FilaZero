// server/config/images.js - Configuração de URLs de imagens
import dotenv from 'dotenv';

dotenv.config();

// Configurações de ambiente
export const imageConfig = {
  // URLs de produção
  production: {
    baseUrl: 'https://filazero-sistema-de-gestao.onrender.com',
    protocol: 'https',
    domain: 'filazero-sistema-de-gestao.onrender.com'
  },
  
  // URLs de desenvolvimento
  development: {
    baseUrl: 'http://localhost:3001',
    protocol: 'http',
    domain: 'localhost:3001'
  }
};

// Função para detectar ambiente
export const detectEnvironment = (req) => {
  const host = req.get('host') || '';
  const userAgent = req.get('User-Agent') || '';
  
  // Verificar variáveis de ambiente
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    RENDER: process.env.RENDER,
    PORT: process.env.PORT
  };
  
  // Verificar host da requisição
  const hostIndicators = {
    isRender: host.includes('render.com'),
    isLocalhost: host.includes('localhost'),
    isProduction: host.includes('filazero-sistema-de-gestao.onrender.com')
  };
  
  // Detectar se é produção
  const isProduction = envVars.NODE_ENV === 'production' ||
                      envVars.RENDER === 'true' ||
                      hostIndicators.isRender ||
                      hostIndicators.isProduction;
  
  console.log('🔍 Detecção de ambiente:', {
    envVars,
    hostIndicators,
    host,
    userAgent: userAgent.substring(0, 100) + '...',
    isProduction
  });
  
  return {
    isProduction,
    config: isProduction ? imageConfig.production : imageConfig.development,
    host,
    envVars
  };
};

// Função para construir URL de imagem
export const buildImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  
  // Se já é uma URL completa, retornar como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Detectar ambiente
  const { isProduction, config } = detectEnvironment(req);
  
  // Construir URL
  const fullUrl = `${config.baseUrl}${imagePath}`;
  
  console.log('🖼️ URL de imagem construída:', {
    originalPath: imagePath,
    environment: isProduction ? 'production' : 'development',
    baseUrl: config.baseUrl,
    fullUrl: fullUrl
  });
  
  return fullUrl;
};

// Função para validar URL de imagem
export const validateImageUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch (error) {
    console.error('❌ URL inválida:', url, error.message);
    return false;
  }
};

// Função para obter configuração atual
export const getCurrentConfig = (req) => {
  return detectEnvironment(req);
};
