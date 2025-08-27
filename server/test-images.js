// Script para testar se as imagens estão sendo servidas corretamente
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar se a pasta uploads existe
const uploadsPath = path.join(__dirname, 'uploads');
console.log('📁 Caminho da pasta uploads:', uploadsPath);

if (fs.existsSync(uploadsPath)) {
  console.log('✅ Pasta uploads existe');
  
  // Listar arquivos na pasta uploads
  const files = fs.readdirSync(uploadsPath);
  console.log('📄 Arquivos encontrados:', files);
  
  // Verificar URLs das imagens
  files.forEach(file => {
    const filePath = path.join(uploadsPath, file);
    const stats = fs.statSync(filePath);
    
    console.log(`\n📁 Arquivo: ${file}`);
    console.log(`📏 Tamanho: ${stats.size} bytes`);
    console.log(`🔗 URL local: http://localhost:3001/uploads/${file}`);
    console.log(`🔗 URL produção: https://filazero-sistema-de-gestao.onrender.com/uploads/${file}`);
    
    // Verificar se é uma imagem válida
    const ext = path.extname(file).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    console.log(`🖼️ É imagem: ${isImage ? 'Sim' : 'Não'} (${ext})`);
  });
} else {
  console.log('❌ Pasta uploads não existe');
}

// Verificar variáveis de ambiente
console.log('\n🌍 Variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('RENDER:', process.env.RENDER);
console.log('HOSTNAME:', process.env.HOSTNAME);

// Verificar se está rodando no Render
const isRender = process.env.RENDER === 'true' || 
                 process.env.NODE_ENV === 'production' ||
                 process.env.HOSTNAME?.includes('render.com');

console.log('🚀 Rodando no Render:', isRender ? 'Sim' : 'Não');
