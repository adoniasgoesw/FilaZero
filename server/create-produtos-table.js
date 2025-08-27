import pool from './config/db.js';

const criarTabelaProdutos = async () => {
  try {
    console.log('🔧 Iniciando criação da tabela produtos...');
    
    // Verificar se a tabela já existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'produtos'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabela produtos já existe!');
      
      // Verificar estrutura atual
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'produtos' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estrutura atual da tabela produtos:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
      });
      
      return;
    }
    
    // Criar tabela produtos
    const createTableQuery = `
      CREATE TABLE produtos (
        id SERIAL PRIMARY KEY,
        estabelecimento_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria_id INTEGER NOT NULL,
        imagem_url TEXT,
        valor_venda DECIMAL(10,2),
        valor_custo DECIMAL(10,2),
        habilitar_estoque BOOLEAN DEFAULT false,
        estoque_quantidade INTEGER,
        habilitar_tempo_preparo BOOLEAN DEFAULT false,
        tempo_preparo INTEGER,
        status BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Tabela produtos criada com sucesso!');
    
    // Criar índices para melhor performance
    const createIndexesQuery = `
      CREATE INDEX idx_produtos_estabelecimento ON produtos(estabelecimento_id);
      CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
      CREATE INDEX idx_produtos_status ON produtos(status);
      CREATE INDEX idx_produtos_nome ON produtos(nome);
    `;
    
    await pool.query(createIndexesQuery);
    console.log('✅ Índices criados com sucesso!');
    
    // Adicionar foreign key para categoria
    const addForeignKeyQuery = `
      ALTER TABLE produtos 
      ADD CONSTRAINT fk_produtos_categoria 
      FOREIGN KEY (categoria_id) 
      REFERENCES categorias(id) 
      ON DELETE RESTRICT;
    `;
    
    try {
      await pool.query(addForeignKeyQuery);
      console.log('✅ Foreign key para categoria adicionada!');
    } catch (error) {
      console.log('⚠️ Não foi possível adicionar foreign key (categorias podem não existir ainda):', error.message);
    }
    
    // Adicionar foreign key para estabelecimento
    const addEstabelecimentoFKQuery = `
      ALTER TABLE produtos 
      ADD CONSTRAINT fk_produtos_estabelecimento 
      FOREIGN KEY (estabelecimento_id) 
      REFERENCES estabelecimentos(id) 
      ON DELETE CASCADE;
    `;
    
    try {
      await pool.query(addEstabelecimentoFKQuery);
      console.log('✅ Foreign key para estabelecimento adicionada!');
    } catch (error) {
      console.log('⚠️ Não foi possível adicionar foreign key para estabelecimento:', error.message);
    }
    
    console.log('🎉 Tabela produtos configurada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela produtos:', error);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  criarTabelaProdutos();
}

export default criarTabelaProdutos;
