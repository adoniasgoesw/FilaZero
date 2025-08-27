// server/add-valor-venda-column.js
import pool from './config/db.js';

const addValorVendaColumn = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adicionando coluna valor_venda à tabela complementos...');
    
    // Verificar se a coluna já existe
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'complementos' 
        AND column_name = 'valor_venda'
      );
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows[0].exists) {
      console.log('✅ Coluna valor_venda já existe!');
    } else {
      // Adicionar a coluna
      const addColumnQuery = `
        ALTER TABLE complementos 
        ADD COLUMN valor_venda NUMERIC(10,2) DEFAULT 0.00;
      `;
      
      await client.query(addColumnQuery);
      console.log('✅ Coluna valor_venda adicionada com sucesso!');
    }
    
    // Verificar estrutura final
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'complementos' 
      ORDER BY ordinal_position;
    `;
    
    const structure = await client.query(structureQuery);
    console.log('📋 Estrutura final da tabela:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

addValorVendaColumn();
