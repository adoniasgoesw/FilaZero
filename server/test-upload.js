// server/test-upload.js - Script para testar upload de arquivos
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const testUpload = async () => {
  try {
    console.log('🧪 Iniciando teste de upload...');
    
    // Criar FormData
    const form = new FormData();
    
    // Adicionar campos de texto
    form.append('estabelecimento_id', '9');
    form.append('nome', 'Teste Categoria');
    form.append('descricao', 'Descrição de teste');
    
    // Adicionar arquivo de imagem (se existir)
    const testImagePath = './uploads/categoria-1756298159313-48653695.jpg';
    if (fs.existsSync(testImagePath)) {
      form.append('imagem', fs.createReadStream(testImagePath));
      console.log('📁 Arquivo de teste encontrado e adicionado');
    } else {
      console.log('⚠️ Arquivo de teste não encontrado, testando apenas campos de texto');
    }
    
    // Fazer requisição
    const response = await fetch('https://filazero-sistema-de-gestao.onrender.com/api/categorias', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Origin': 'https://filazero.netlify.app'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', response.headers);
    
    const data = await response.text();
    console.log('📄 Corpo da resposta:', data);
    
    if (response.ok) {
      console.log('✅ Upload realizado com sucesso!');
    } else {
      console.log('❌ Erro no upload:', response.status, data);
    }
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
};

// Executar teste
testUpload();
