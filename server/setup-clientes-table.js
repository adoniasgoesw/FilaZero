import { query, testConnection, closePool } from './config/db.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

async function setupClientesTable() {
  try {
    console.log('🔍 Verificando conectividade...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      return;
    }
    
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar se a tabela clientes existe
    console.log('\n🔍 Verificando se a tabela clientes existe...');
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clientes'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabela clientes já existe');
      
      // Verificar estrutura da tabela
      console.log('\n🔍 Verificando estrutura da tabela...');
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'clientes' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Colunas da tabela clientes:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
    } else {
      console.log('❌ Tabela clientes não existe, criando...');
      
      // Criar tabela clientes
      await query(`
        CREATE TABLE clientes (
          id SERIAL PRIMARY KEY,
          estabelecimento_id INTEGER NOT NULL,
          nome VARCHAR(150) NOT NULL,
          cpf VARCHAR(14),
          cnpj VARCHAR(18),
          endereco TEXT,
          whatsapp VARCHAR(20),
          email VARCHAR(100),
          taxa_entrega NUMERIC(10,2) DEFAULT 0.00,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status BOOLEAN NOT NULL DEFAULT true
        );
      `);
      
      console.log('✅ Tabela clientes criada com sucesso');
      
      // Criar índices para melhor performance
      console.log('\n🔍 Criando índices...');
      await query(`
        CREATE INDEX idx_clientes_estabelecimento_id ON clientes(estabelecimento_id);
      `);
      await query(`
        CREATE INDEX idx_clientes_cpf ON clientes(cpf) WHERE cpf IS NOT NULL;
      `);
      await query(`
        CREATE INDEX idx_clientes_cnpj ON clientes(cnpj) WHERE cnpj IS NOT NULL;
      `);
      await query(`
        CREATE INDEX idx_clientes_status ON clientes(status);
      `);
      
      console.log('✅ Índices criados com sucesso');
    }
    
    // Testar inserção de um cliente de exemplo
    console.log('\n🧪 Testando inserção de cliente...');
    const testCliente = await query(`
      INSERT INTO clientes (estabelecimento_id, nome, cpf, whatsapp, email)
      VALUES (1, 'Cliente Teste', '12345678901', '(11) 99999-9999', 'teste@exemplo.com')
      RETURNING *;
    `);
    
    console.log('✅ Cliente de teste inserido:', testCliente.rows[0]);
    
    // Limpar cliente de teste
    await query('DELETE FROM clientes WHERE nome = $1', ['Cliente Teste']);
    console.log('✅ Cliente de teste removido');
    
    console.log('\n🎉 Setup da tabela clientes concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o setup:', error);
  } finally {
    console.log('\n🔚 Fechando conexões...');
    await closePool();
    process.exit(0);
  }
}

setupClientesTable();





















