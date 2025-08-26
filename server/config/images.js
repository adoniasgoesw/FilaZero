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

// Função para forçar produção em ambiente Render
const forceProductionInRender = () => {
  return process.env.RENDER === 'true' || 
         process.env.NODE_ENV === 'production' ||
         process.env.HOSTNAME?.includes('render.com');
};

// Função para detectar ambiente
export const detectEnvironment = (req) => {
  const host = req.get('host') || '';
  const userAgent = req.get('User-Agent') || '';
  const origin = req.get('origin') || '';
  const referer = req.get('referer') || '';
  
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
  
  // Verificar origem da requisição (frontend)
  const originIndicators = {
    isNetlify: origin.includes('netlify.app') || referer.includes('netlify.app'),
    isLocalhost: origin.includes('localhost') || referer.includes('localhost'),
    isProduction: origin.includes('filazero.netlify.app') || referer.includes('filazero.netlify.app')
  };
  
  // Detectar se é produção - PRIORIDADE para variáveis de ambiente
  let isProduction = false;
  
  // 1. FORÇAR produção se estiver no Render (mais importante!)
  if (forceProductionInRender()) {
    isProduction = true;
  }
  // 2. Verificar variáveis de ambiente
  else if (envVars.NODE_ENV === 'production' || envVars.RENDER === 'true') {
    isProduction = true;
  }
  // 3. Verificar se o servidor está rodando no Render
  else if (hostIndicators.isRender || hostIndicators.isProduction) {
    isProduction = true;
  }
  // 4. Verificar se o frontend está em produção
  else if (originIndicators.isProduction) {
    isProduction = true;
  }
  // 5. Fallback: se não for nenhum dos acima, é desenvolvimento
  else {
    isProduction = false;
  }
  
  console.log('🔍 Detecção de ambiente:', {
    envVars,
    hostIndicators,
    originIndicators,
    host,
    origin,
    referer,
    userAgent: userAgent.substring(0, 100) + '...',
    isProduction,
    finalDecision: isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'
  });
  
  return {
    isProduction,
    config: isProduction ? imageConfig.production : imageConfig.development,
    host,
    origin,
    envVars
  };
};

// Função para construir URL de imagem
export const buildImageUrl = (imagePath, req) => {
  console.log('🔍 buildImageUrl iniciada com:', {
    imagePath,
    reqHost: req.get('host'),
    reqUserAgent: req.get('User-Agent')
  });
  
  if (!imagePath) {
    console.log('❌ imagePath é null/undefined');
    return null;
  }
  
  // Se já é uma URL completa, retornar como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ URL já é completa, retornando:', imagePath);
    return imagePath;
  }
  
  try {
    // Detectar ambiente
    const envInfo = detectEnvironment(req);
    console.log('🌍 Ambiente detectado:', envInfo);
    
    const { isProduction, config } = envInfo;
    
    // Construir URL
    let fullUrl = `${config.baseUrl}${imagePath}`;
    
    // FORÇAR HTTPS em produção se por algum motivo ainda estiver HTTP
    if (isProduction && fullUrl.startsWith('http://')) {
      fullUrl = fullUrl.replace('http://', 'https://');
      console.log('🔄 URL forçada para HTTPS:', fullUrl);
    }
    
    console.log('🖼️ URL de imagem construída:', {
      originalPath: imagePath,
      environment: isProduction ? 'production' : 'development',
      baseUrl: config.baseUrl,
      fullUrl: fullUrl,
      isProduction,
      config,
      finalUrl: fullUrl
    });
    
    return fullUrl;
  } catch (error) {
    console.error('❌ Erro em buildImageUrl:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
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
