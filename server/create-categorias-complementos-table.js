// server/create-categorias-complementos-table.js
import pool from './config/db.js';

const createCategoriasComplementosTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Criando tabela categorias_complementos...');
    
    const query = `
      CREATE TABLE IF NOT EXISTS categorias_complementos (
        id SERIAL PRIMARY KEY,
        produto_id INTEGER NOT NULL,
        nome VARCHAR(100) NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status BOOLEAN NOT NULL DEFAULT true,
        quantidade_minima INTEGER DEFAULT 0,
        quantidade_maxima INTEGER,
        preenchimento_obrigatorio BOOLEAN NOT NULL DEFAULT false,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
      );
    `;
    
    await client.query(query);
    console.log('✅ Tabela categorias_complementos criada com sucesso!');
    
    // Criar índices para melhor performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_categorias_complementos_produto ON categorias_complementos(produto_id);');
    console.log('✅ Índice produto_id criado com sucesso!');
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_categorias_complementos_status ON categorias_complementos(status);');
    console.log('✅ Índice status criado com sucesso!');
    
    // Verificar se a tabela foi criada
    const checkQuery = 'SELECT * FROM categorias_complementos LIMIT 1;';
    await client.query(checkQuery);
    console.log('✅ Tabela verificada e funcionando!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela categorias_complementos:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

createCategoriasComplementosTable();
