import pool from './config/db.js';

async function debugCPF() {
  try {
    console.log('🔍 Verificando CPFs no banco de dados...');
    
    // Buscar todos os usuários
    const result = await pool.query('SELECT id, nome_completo, cpf, status FROM usuarios');
    
    console.log('📋 Usuários encontrados:');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}, Nome: ${user.nome_completo}, CPF: "${user.cpf}", Status: ${user.status}`);
    });
    
    // Testar busca específica
    const testCPF = '13294103948';
    console.log(`\n🔍 Testando busca por CPF: ${testCPF}`);
    
    const specificResult = await pool.query('SELECT * FROM usuarios WHERE cpf = $1', [testCPF]);
    console.log(`Resultado da busca específica: ${specificResult.rows.length} linhas`);
    
    if (specificResult.rows.length > 0) {
      console.log('Usuário encontrado:', specificResult.rows[0]);
    }
    
    // Testar busca com LIKE
    const likeResult = await pool.query('SELECT * FROM usuarios WHERE cpf LIKE $1', [`%${testCPF}%`]);
    console.log(`Resultado da busca com LIKE: ${likeResult.rows.length} linhas`);
    
    if (likeResult.rows.length > 0) {
      console.log('Usuários encontrados com LIKE:', likeResult.rows);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

debugCPF();




