// server/test-status.js - Testar rota de atualização de status
import fetch from 'node-fetch';

const testStatusUpdate = async () => {
  try {
    console.log('🧪 Testando atualização de status da categoria...');
    
    const categoriaId = 28; // ID da categoria que você mencionou
    
    // Teste 1: Desativar categoria (status = false)
    console.log('\n📝 Teste 1: Desativando categoria...');
    const response1 = await fetch(`https://filazero-sistema-de-gestao.onrender.com/api/categorias/${categoriaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://filazero.netlify.app'
      },
      body: JSON.stringify({ status: false })
    });
    
    console.log('📡 Status da resposta 1:', response1.status);
    const data1 = await response1.text();
    console.log('📄 Resposta 1:', data1);
    
    if (response1.ok) {
      console.log('✅ Categoria desativada com sucesso!');
    } else {
      console.log('❌ Erro ao desativar categoria:', response1.status, data1);
    }
    
    // Aguardar um pouco antes do próximo teste
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Ativar categoria (status = true)
    console.log('\n📝 Teste 2: Ativando categoria...');
    const response2 = await fetch(`https://filazero-sistema-de-gestao.onrender.com/api/categorias/${categoriaId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://filazero.netlify.app'
      },
      body: JSON.stringify({ status: true })
    });
    
    console.log('📡 Status da resposta 2:', response2.status);
    const data2 = await response2.text();
    console.log('📄 Resposta 2:', data2);
    
    if (response2.ok) {
      console.log('✅ Categoria ativada com sucesso!');
    } else {
      console.log('❌ Erro ao ativar categoria:', response2.status, data2);
    }
    
    // Teste 3: Verificar status atual
    console.log('\n📝 Teste 3: Verificando status atual...');
    const response3 = await fetch(`https://filazero-sistema-de-gestao.onrender.com/api/categorias/estabelecimento/9`, {
      method: 'GET',
      headers: {
        'Origin': 'https://filazero.netlify.app'
      }
    });
    
    console.log('📡 Status da resposta 3:', response3.status);
    const data3 = await response3.text();
    console.log('📄 Resposta 3:', data3);
    
    if (response3.ok) {
      console.log('✅ Status verificado com sucesso!');
    } else {
      console.log('❌ Erro ao verificar status:', response3.status, data3);
    }
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error);
  }
};

// Executar teste
testStatusUpdate();
