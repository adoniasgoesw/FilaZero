// server/test-urls.js - Teste de construção de URLs
import { buildImageUrl, detectEnvironment } from './config/images.js';

// Simular objeto de requisição para teste
const createMockRequest = (host, userAgent = 'Mozilla/5.0 (Test)') => {
  return {
    get: (header) => {
      if (header === 'host') return host;
      if (header === 'User-Agent') return userAgent;
      return null;
    }
  };
};

// Testes
console.log('🧪 Testando construção de URLs de imagens...\n');

// Teste 1: Desenvolvimento (localhost)
console.log('🔧 Teste 1: Ambiente de Desenvolvimento');
const devReq = createMockRequest('localhost:3001');
const devUrl = buildImageUrl('/uploads/categoria-123.jpg', devReq);
console.log('Host: localhost:3001');
console.log('URL construída:', devUrl);
console.log('✅ Esperado: http://localhost:3001/uploads/categoria-123.jpg\n');

// Teste 2: Produção (Render)
console.log('🚀 Teste 2: Ambiente de Produção (Render)');
const prodReq = createMockRequest('filazero-sistema-de-gestao.onrender.com');
const prodUrl = buildImageUrl('/uploads/categoria-123.jpg', prodReq);
console.log('Host: filazero-sistema-de-gestao.onrender.com');
console.log('URL construída:', prodUrl);
console.log('✅ Esperado: https://filazero-sistema-de-gestao.onrender.com/uploads/categoria-123.jpg\n');

// Teste 3: Produção (Render com subdomínio)
console.log('🚀 Teste 3: Ambiente de Produção (Render com subdomínio)');
const prodSubReq = createMockRequest('app-123456.onrender.com');
const prodSubUrl = buildImageUrl('/uploads/categoria-123.jpg', prodSubReq);
console.log('Host: app-123456.onrender.com');
console.log('URL construída:', prodSubUrl);
console.log('✅ Esperado: https://filazero-sistema-de-gestao.onrender.com/uploads/categoria-123.jpg\n');

// Teste 4: URL já completa
console.log('🔗 Teste 4: URL já completa');
const completeUrl = buildImageUrl('https://exemplo.com/imagem.jpg', devReq);
console.log('URL original: https://exemplo.com/imagem.jpg');
console.log('URL retornada:', completeUrl);
console.log('✅ Esperado: https://exemplo.com/imagem.jpg\n');

// Teste 5: Sem imagem
console.log('❌ Teste 5: Sem imagem');
const noImageUrl = buildImageUrl(null, devReq);
console.log('Imagem: null');
console.log('URL retornada:', noImageUrl);
console.log('✅ Esperado: null\n');

// Teste 6: Detecção de ambiente
console.log('🌍 Teste 6: Detecção de ambiente');
const envDev = detectEnvironment(devReq);
const envProd = detectEnvironment(prodReq);

console.log('Desenvolvimento:', {
  isProduction: envDev.isProduction,
  config: envDev.config,
  host: envDev.host
});

console.log('Produção:', {
  isProduction: envProd.isProduction,
  config: envProd.config,
  host: envProd.host
});

console.log('\n🎯 Testes concluídos!');
