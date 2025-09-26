const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/filazero'
});

async function testPedidosStructure() {
  try {
    console.log('🔍 Testando estrutura da tabela pedidos...\n');
    
    // 1. Verificar colunas da tabela pedidos
    console.log('1️⃣ Colunas da tabela pedidos:');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos' 
      ORDER BY ordinal_position
    `);
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 2. Verificar se a coluna codigo existe
    console.log('\n2️⃣ Verificando coluna codigo:');
    const codigoExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pedidos' AND column_name = 'codigo'
    `);
    console.log(`   - Coluna codigo existe: ${codigoExists.rows.length > 0 ? '✅ SIM' : '❌ NÃO'}`);
    
    // 3. Verificar se a coluna usuario_id existe
    console.log('\n3️⃣ Verificando coluna usuario_id:');
    const usuarioIdExists = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pedidos' AND column_name = 'usuario_id'
    `);
    console.log(`   - Coluna usuario_id existe: ${usuarioIdExists.rows.length > 0 ? '✅ SIM' : '❌ NÃO'}`);
    
    // 4. Verificar últimos pedidos
    console.log('\n4️⃣ Últimos 5 pedidos:');
    const pedidos = await pool.query(`
      SELECT id, codigo, usuario_id, criado_em, valor_total 
      FROM pedidos 
      ORDER BY id DESC 
      LIMIT 5
    `);
    pedidos.rows.forEach(pedido => {
      console.log(`   - ID: ${pedido.id}, Código: ${pedido.codigo || 'NULL'}, Usuario: ${pedido.usuario_id || 'NULL'}, Valor: ${pedido.valor_total}`);
    });
    
    // 5. Verificar usuários
    console.log('\n5️⃣ Usuários disponíveis:');
    const usuarios = await pool.query(`
      SELECT id, nome_completo, email 
      FROM usuarios 
      ORDER BY id 
      LIMIT 3
    `);
    usuarios.rows.forEach(usuario => {
      console.log(`   - ID: ${usuario.id}, Nome: ${usuario.nome_completo}, Email: ${usuario.email}`);
    });
    
    // 6. Testar query que está sendo usada no getPedido
    console.log('\n6️⃣ Testando query do getPedido:');
    const testQuery = await pool.query(`
      SELECT p.id, p.valor_total, p.criado_em, p.desconto, p.acrescimos, p.cliente_id,
             p.valor_pago, p.valor_restante, p.valor_troco, p.pagamento_id, p.codigo,
             c.nome AS cliente_nome, c.cpf, c.cnpj, c.endereco, c.whatsapp, c.email, c.taxa_entrega,
             pag.nome AS pagamento_nome, pag.tipo AS pagamento_tipo, pag.conta_bancaria AS pagamento_conta,
             u.nome_completo AS vendido_por
      FROM pedidos p
      LEFT JOIN clientes c ON c.id = p.cliente_id
      LEFT JOIN pagamentos pag ON pag.id = p.pagamento_id
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.criado_em DESC 
      LIMIT 3
    `);
    testQuery.rows.forEach(pedido => {
      console.log(`   - ID: ${pedido.id}, Código: ${pedido.codigo || 'NULL'}, Cliente: ${pedido.cliente_nome || 'NULL'}, Vendedor: ${pedido.vendido_por || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testPedidosStructure();
