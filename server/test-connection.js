import { testConnection, checkConnectionHealth, closePool } from './config/db.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

console.log('🔍 Testando conectividade com o banco de dados...');
console.log('📊 Configurações:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

async function runTests() {
  try {
    console.log('\n1️⃣ Teste básico de conexão...');
    const basicTest = await testConnection();
    
    if (basicTest) {
      console.log('✅ Teste básico passou');
      
      console.log('\n2️⃣ Teste de saúde da conexão...');
      const healthTest = await checkConnectionHealth();
      
      if (healthTest) {
        console.log('✅ Teste de saúde passou');
        
        console.log('\n3️⃣ Teste de query simples...');
        const { query } = await import('./config/db.js');
        const result = await query('SELECT NOW() as timestamp, version() as version');
        console.log('✅ Query executada com sucesso:', result.rows[0]);
        
        console.log('\n4️⃣ Teste de query de clientes...');
        const clientesResult = await query('SELECT COUNT(*) as total FROM clientes');
        console.log('✅ Query de clientes executada:', clientesResult.rows[0]);
        
      } else {
        console.log('❌ Teste de saúde falhou');
      }
    } else {
      console.log('❌ Teste básico falhou');
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    console.log('\n🔚 Fechando conexões...');
    await closePool();
    process.exit(0);
  }
}

runTests();





















