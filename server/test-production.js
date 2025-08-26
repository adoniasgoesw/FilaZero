// server/test-production.js - Teste de detecção de ambiente
import { detectEnvironment, buildImageUrl } from './config/images.js';

// Simular variáveis de ambiente de produção
process.env.RENDER = 'true';
process.env.NODE_ENV = 'production';

// Simular objeto de requisição
const mockReq = {
  get: (header) => {
    switch (header) {
      case 'host': return 'filazero-sistema-de-gestao.onrender.com';
      case 'origin': return 'https://filazero.netlify.app';
      case 'referer': return 'https://filazero.netlify.app/gestao/categorias';
      case 'User-Agent': return 'Mozilla/5.0 (Test)';
      default: return null;
    }
  }
};

console.log('🧪 Testando detecção de ambiente...\n');

// Teste 1: Detecção de ambiente
console.log('🔍 Teste 1: Detecção de Ambiente');
const envInfo = detectEnvironment(mockReq);
console.log('Resultado:', envInfo);
console.log('✅ Esperado: isProduction = true\n');

// Teste 2: Construção de URL
console.log('🖼️ Teste 2: Construção de URL');
const imageUrl = buildImageUrl('/uploads/categoria-123.jpg', mockReq);
console.log('URL construída:', imageUrl);
console.log('✅ Esperado: https://filazero-sistema-de-gestao.onrender.com/uploads/categoria-123.jpg\n');

// Teste 3: Verificar configuração
console.log('⚙️ Teste 3: Configuração');
console.log('Config:', envInfo.config);
console.log('Base URL:', envInfo.config.baseUrl);
console.log('Protocol:', envInfo.config.protocol);

console.log('\n🎯 Teste concluído!');
