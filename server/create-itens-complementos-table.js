// Script para criar a tabela itens_complementos
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const createItensComplementosTable = async () => {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    // Verificar se a tabela já existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'itens_complementos'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️ Tabela itens_complementos já existe!');
      
      // Verificar estrutura da tabela existente
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'itens_complementos' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estrutura atual da tabela:');
      tableStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      return;
    }
    
    console.log('✅ Criando tabela itens_complementos...');
    
    // Criar a tabela
    const createTable = await pool.query(`
      CREATE TABLE itens_complementos (
        id SERIAL PRIMARY KEY,
        categoria_id INTEGER NOT NULL,
        complemento_id INTEGER NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabela itens_complementos criada com sucesso!');
    
    // Criar índices para melhor performance
    console.log('🔍 Criando índices...');
    
    await pool.query(`
      CREATE INDEX idx_itens_complementos_categoria_id ON itens_complementos(categoria_id);
    `);
    
    await pool.query(`
      CREATE INDEX idx_itens_complementos_complemento_id ON itens_complementos(complemento_id);
    `);
    
    await pool.query(`
      CREATE INDEX idx_itens_complementos_categoria_complemento ON itens_complementos(categoria_id, complemento_id);
    `);
    
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar estrutura final
    const finalStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'itens_complementos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura final da tabela:');
    finalStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Verificar índices
    const indexes = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'itens_complementos';
    `);
    
    console.log('🔍 Índices criados:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com o banco fechada.');
  }
};

// Executar o script
createItensComplementosTable();
