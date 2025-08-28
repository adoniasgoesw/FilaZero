// server/modify-categorias-complementos-table.js
import pool from './config/db.js';

const modifyCategoriasComplementosTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Modificando tabela categorias_complementos para permitir produto_id NULL...');
    
    // Primeiro, remover a constraint NOT NULL
    await client.query('ALTER TABLE categorias_complementos ALTER COLUMN produto_id DROP NOT NULL;');
    console.log('✅ Constraint NOT NULL removida de produto_id');
    
    // Verificar se a alteração foi feita
    const checkQuery = `
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categorias_complementos' AND column_name = 'produto_id';
    `;
    
    const result = await client.query(checkQuery);
    console.log('📋 Status da coluna produto_id:', result.rows[0]);
    
    // Verificar se a tabela está funcionando
    const testQuery = 'SELECT * FROM categorias_complementos LIMIT 1;';
    await client.query(testQuery);
    console.log('✅ Tabela verificada e funcionando!');
    
    console.log('🎉 Tabela modificada com sucesso! Agora produto_id pode ser NULL');
    
  } catch (error) {
    console.error('❌ Erro ao modificar tabela categorias_complementos:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

modifyCategoriasComplementosTable();


