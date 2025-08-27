// server/check-complementos-structure.js
import pool from './config/db.js';

const checkStructure = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estrutura completa da tabela complementos...');
    
    // Verificar todas as colunas
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default, ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'complementos' 
      ORDER BY ordinal_position;
    `;
    
    const structure = await client.query(structureQuery);
    console.log('📋 Estrutura completa da tabela:');
    structure.rows.forEach(col => {
      console.log(`  ${col.ordinal_position}. ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Verificar dados existentes
    const dataQuery = 'SELECT * FROM complementos LIMIT 3;';
    const data = await client.query(dataQuery);
    console.log(`\n📊 Dados existentes (${data.rows.length} registros):`);
    data.rows.forEach((row, index) => {
      console.log(`\n  Registro ${index + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`    ${key}: ${row[key]}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

checkStructure();
