// server/test-db.js - Script para testar conexão com banco de dados
import pool from './config/db.js';

const testDatabase = async () => {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Teste básico de conexão
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida:', result.rows[0].now);
    
    // Verificar se a tabela categorias existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categorias'
      );
    `);
    
    console.log('📋 Tabela categorias existe:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Verificar estrutura da tabela
      const columns = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'categorias' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('🏗️ Estrutura da tabela categorias:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Verificar se há dados
      const count = await pool.query('SELECT COUNT(*) FROM categorias');
      console.log('📊 Total de categorias:', count.rows[0].count);
      
      // Verificar estabelecimento_id = 9
      const estabelecimento = await pool.query('SELECT COUNT(*) FROM categorias WHERE estabelecimento_id = $1', ['9']);
      console.log('🏪 Categorias do estabelecimento 9:', estabelecimento.rows[0].count);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar banco:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com banco fechada');
  }
};

// Executar teste
testDatabase();
