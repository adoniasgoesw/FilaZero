// server/create-complementos-table.js
import pool from './config/db.js';

const createComplementosTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Criando tabela complementos...');
    
    const query = `
      CREATE TABLE IF NOT EXISTS complementos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        valor_venda DECIMAL(10,2) DEFAULT 0.00,
        valor_custo DECIMAL(10,2) DEFAULT 0.00,
        imagem_url TEXT,
        estabelecimento_id INTEGER NOT NULL,
        status BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE
      );
    `;
    
    await client.query(query);
    console.log('✅ Tabela complementos criada com sucesso!');
    
    // Criar índice para melhor performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_complementos_estabelecimento ON complementos(estabelecimento_id);');
    console.log('✅ Índice criado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela complementos:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

createComplementosTable();
