// server/fix-db-structure.js - Corrigir estrutura da tabela categorias
import pool from './config/db.js';

const fixDatabaseStructure = async () => {
  try {
    console.log('🔧 Corrigindo estrutura da tabela categorias...');
    
    // Verificar estrutura atual
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('🏗️ Estrutura atual:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Lista de colunas que devem existir
    const requiredColumns = [
      { name: 'id', type: 'SERIAL PRIMARY KEY' },
      { name: 'estabelecimento_id', type: 'INTEGER NOT NULL' },
      { name: 'nome', type: 'VARCHAR(100) NOT NULL' },
      { name: 'descricao', type: 'TEXT' },
      { name: 'imagem_url', type: 'TEXT' },
      { name: 'cor', type: 'VARCHAR(20)' },
      { name: 'icone', type: 'VARCHAR(50)' },
      { name: 'status', type: 'BOOLEAN NOT NULL DEFAULT true' },
      { name: 'criado_em', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    // Verificar e adicionar colunas que estão faltando
    for (const requiredCol of requiredColumns) {
      const exists = columns.rows.some(col => col.column_name === requiredCol.name);
      
      if (!exists) {
        console.log(`⚠️ Adicionando coluna: ${requiredCol.name}`);
        
        try {
          if (requiredCol.name === 'id') {
            // A coluna id já existe, não precisa adicionar
            continue;
          }
          
          let alterQuery = '';
          if (requiredCol.name === 'imagem_url') {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} TEXT`;
          } else if (requiredCol.name === 'cor') {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} VARCHAR(20)`;
          } else if (requiredCol.name === 'icone') {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} VARCHAR(50)`;
          } else if (requiredCol.name === 'criado_em') {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
          } else if (requiredCol.name === 'updated_at') {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
          } else {
            alterQuery = `ALTER TABLE categorias ADD COLUMN ${requiredCol.name} ${requiredCol.type}`;
          }
          
          await pool.query(alterQuery);
          console.log(`✅ Coluna ${requiredCol.name} adicionada com sucesso!`);
          
        } catch (alterError) {
          console.log(`ℹ️ Coluna ${requiredCol.name} já existe ou não pode ser criada:`, alterError.message);
        }
      } else {
        console.log(`✅ Coluna ${requiredCol.name} já existe`);
      }
    }
    
    // Verificar estrutura final
    const finalColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n🏗️ Estrutura final da tabela:');
    finalColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // Verificar dados existentes
    const count = await pool.query('SELECT COUNT(*) FROM categorias');
    console.log(`\n📊 Total de categorias: ${count.rows[0].count}`);
    
    if (parseInt(count.rows[0].count) > 0) {
      const sampleData = await pool.query('SELECT id, nome, status, estabelecimento_id, imagem_url, cor, icone FROM categorias LIMIT 3');
      console.log('📋 Exemplos de categorias:');
      sampleData.rows.forEach(cat => {
        console.log(`  - ID: ${cat.id}, Nome: ${cat.nome}, Status: ${cat.status}, Estabelecimento: ${cat.estabelecimento_id}`);
        console.log(`    Imagem: ${cat.imagem_url || 'N/A'}, Cor: ${cat.cor || 'N/A'}, Ícone: ${cat.icone || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Estrutura da tabela corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir estrutura:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexão com banco fechada');
  }
};

// Executar correção
fixDatabaseStructure();
