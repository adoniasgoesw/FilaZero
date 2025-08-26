// server/init-uploads.js - Script para inicializar pasta de uploads
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para inicializar pasta de uploads
export const initializeUploads = () => {
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    console.log('📁 Inicializando pasta de uploads...');
    console.log('📍 Caminho:', uploadsPath);
    
    // Verificar se a pasta existe
    if (!fs.existsSync(uploadsPath)) {
      // Criar pasta se não existir
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('✅ Pasta uploads criada com sucesso');
    } else {
      console.log('✅ Pasta uploads já existe');
    }
    
    // Verificar permissões
    try {
      fs.accessSync(uploadsPath, fs.constants.R_OK | fs.constants.W_OK);
      console.log('✅ Permissões de leitura/escrita OK');
    } catch (error) {
      console.error('❌ Problema com permissões da pasta uploads:', error.message);
      throw new Error('Pasta uploads não tem permissões adequadas');
    }
    
    // Listar arquivos existentes
    const files = fs.readdirSync(uploadsPath);
    console.log(`📊 Arquivos na pasta uploads: ${files.length}`);
    if (files.length > 0) {
      console.log('📋 Arquivos:', files.slice(0, 5).join(', '));
      if (files.length > 5) console.log(`... e mais ${files.length - 5} arquivos`);
    }
    
    return uploadsPath;
  } catch (error) {
    console.error('❌ Erro ao inicializar pasta uploads:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeUploads();
}
