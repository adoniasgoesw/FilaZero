// server/check-db-structure.js - Verificar estrutura da tabela categorias
import pool from './config/db.js';

const checkDatabaseStructure = async () => {
  try {
    console.log('🔍 Verificando estrutura da tabela categorias...');
    
    // Verificar se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categorias'
      );
    `);
    
    console.log('📋 Tabela categorias existe:', tableExists.rows[0].exists);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ Tabela não encontrada');
      return;
    }
    
    // Verificar estrutura da tabela
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('🏗️ Estrutura da tabela categorias:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Verificar se há dados
    const count = await pool.query('SELECT COUNT(*) FROM categorias');
    console.log('📊 Total de categorias:', count.rows[0].count);
    
    // Verificar algumas categorias de exemplo
    if (parseInt(count.rows[0].count) > 0) {
      const sampleData = await pool.query('SELECT id, nome, status, estabelecimento_id FROM categorias LIMIT 5');
      console.log('📋 Exemplos de categorias:');
      sampleData.rows.forEach(cat => {
        console.log(`  - ID: ${cat.id}, Nome: ${cat.nome}, Status: ${cat.status}, Estabelecimento: ${cat.estabelecimento_id}`);
      });
    }
    
    // Verificar se a coluna updated_at existe
    const hasUpdatedAt = columns.rows.some(col => col.column_name === 'updated_at');
    console.log('🕒 Coluna updated_at existe:', hasUpdatedAt);
    
    if (!hasUpdatedAt) {
      console.log('⚠️ AVISO: Coluna updated_at não existe. Vamos criá-la...');
      
      try {
        await pool.query(`
          ALTER TABLE categorias 
          ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Coluna updated_at criada com sucesso!');
      } catch (alterError) {
        console.log('ℹ️ Coluna updated_at já existe ou não pode ser criada:', alterError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com banco fechada');
  }
};

// Executar verificação
checkDatabaseStructure();
