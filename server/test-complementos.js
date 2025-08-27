// server/test-complementos.js
import pool from './config/db.js';

const testComplementos = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testando tabela complementos...');
    
    // Verificar se a tabela existe
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'complementos'
      );
    `;
    
    const tableExists = await client.query(checkTableQuery);
    console.log('✅ Tabela complementos existe:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Verificar estrutura da tabela
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'complementos' 
        ORDER BY ordinal_position;
      `;
      
      const structure = await client.query(structureQuery);
      console.log('📋 Estrutura da tabela:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Verificar se há dados
      const countQuery = 'SELECT COUNT(*) FROM complementos;';
      const count = await client.query(countQuery);
      console.log(`📊 Total de complementos: ${count.rows[0].count}`);
      
      // Verificar estabelecimentos disponíveis
      const estabelecimentosQuery = 'SELECT id, nome FROM estabelecimentos LIMIT 5;';
      const estabelecimentos = await client.query(estabelecimentosQuery);
      console.log('🏪 Estabelecimentos disponíveis:');
      estabelecimentos.rows.forEach(est => {
        console.log(`  - ID: ${est.id}, Nome: ${est.nome}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar complementos:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

testComplementos();
