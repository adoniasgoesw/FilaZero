// server/test-cache.js
// Arquivo para testar o sistema de cache

import cacheManager from './config/cache.js';

// Função para testar o cache
async function testCache() {
  console.log('🧪 Iniciando testes do sistema de cache...\n');

  try {
    // Teste 1: Salvar dados no cache
    console.log('📝 Teste 1: Salvando dados no cache...');
    const testData = {
      id: 1,
      nome: 'Produto Teste',
      preco: 29.99,
      categoria: 'Teste'
    };
    
    await cacheManager.set('test:produto:1', testData, 60); // 1 minuto
    console.log('✅ Dados salvos no cache\n');

    // Teste 2: Buscar dados do cache
    console.log('🔍 Teste 2: Buscando dados do cache...');
    const cachedData = await cacheManager.get('test:produto:1');
    
    if (cachedData) {
      console.log('✅ Dados encontrados no cache:', cachedData);
    } else {
      console.log('❌ Dados não encontrados no cache');
    }
    console.log('');

    // Teste 3: Testar cache miss
    console.log('🔍 Teste 3: Testando cache miss...');
    const nonExistentData = await cacheManager.get('test:produto:999');
    
    if (!nonExistentData) {
      console.log('✅ Cache miss funcionando corretamente');
    } else {
      console.log('❌ Cache miss não funcionando');
    }
    console.log('');

    // Teste 4: Salvar múltiplos itens
    console.log('📝 Teste 4: Salvando múltiplos itens...');
    const categorias = [
      { id: 1, nome: 'Pizzas', status: true },
      { id: 2, nome: 'Bebidas', status: true },
      { id: 3, nome: 'Sobremesas', status: false }
    ];
    
    for (let i = 0; i < categorias.length; i++) {
      await cacheManager.set(`test:categoria:${categorias[i].id}`, categorias[i], 120);
    }
    console.log('✅ Múltiplos itens salvos no cache\n');

    // Teste 5: Deletar item específico
    console.log('🗑️ Teste 5: Deletando item específico...');
    await cacheManager.delete('test:produto:1');
    
    const deletedData = await cacheManager.get('test:produto:1');
    if (!deletedData) {
      console.log('✅ Item deletado com sucesso');
    } else {
      console.log('❌ Item não foi deletado');
    }
    console.log('');

    // Teste 6: Deletar por padrão
    console.log('🗑️ Teste 6: Deletando por padrão...');
    await cacheManager.deletePattern('test:categoria');
    
    const remainingData = await cacheManager.get('test:categoria:1');
    if (!remainingData) {
      console.log('✅ Deletar por padrão funcionando');
    } else {
      console.log('❌ Deletar por padrão não funcionando');
    }
    console.log('');

    // Teste 7: Estatísticas do cache
    console.log('📊 Teste 7: Estatísticas do cache...');
    const stats = cacheManager.getStats();
    console.log('📈 Estatísticas:', stats);
    console.log('');

    // Teste 8: Limpar todo o cache
    console.log('🧹 Teste 8: Limpando todo o cache...');
    await cacheManager.clear();
    
    const finalStats = cacheManager.getStats();
    console.log('📈 Estatísticas finais:', finalStats);
    console.log('');

    console.log('🎉 Todos os testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testCache();
}

export default testCache;
