import pool from './config/db.js';

async function testQuery() {
  try {
    console.log('🔍 Testando query de login...');
    
    const cpf = '13294103948';
    
    // Testar a query atual
    const query = `
      SELECT 
        u.id,
        u.estabelecimento_id,
        u.nome_completo,
        u.email,
        u.whatsapp,
        u.cpf,
        u.senha,
        u.cargo,
        u.status,
        e.nome as nome_estabelecimento,
        e.setor as setor_estabelecimento
      FROM usuarios u
      LEFT JOIN estabelecimentos e ON u.estabelecimento_id = e.id
      WHERE REGEXP_REPLACE(u.cpf, '[^0-9]', '', 'g') = $1 AND u.status = true
    `;
    
    const result = await pool.query(query, [cpf]);
    console.log('Resultado da query:', result.rows.length, 'linhas');
    
    if (result.rows.length > 0) {
      console.log('Usuário encontrado:', result.rows[0]);
    } else {
      console.log('Nenhum usuário encontrado');
      
      // Testar query alternativa
      const altQuery = `
        SELECT 
          u.id,
          u.estabelecimento_id,
          u.nome_completo,
          u.email,
          u.whatsapp,
          u.cpf,
          u.senha,
          u.cargo,
          u.status,
          e.nome as nome_estabelecimento,
          e.setor as setor_estabelecimento
        FROM usuarios u
        LEFT JOIN estabelecimentos e ON u.estabelecimento_id = e.id
        WHERE REPLACE(REPLACE(REPLACE(u.cpf, '.', ''), '-', ''), ' ', '') = $1 AND u.status = true
      `;
      
      const altResult = await pool.query(altQuery, [cpf]);
      console.log('Resultado da query alternativa:', altResult.rows.length, 'linhas');
      
      if (altResult.rows.length > 0) {
        console.log('Usuário encontrado com query alternativa:', altResult.rows[0]);
      }
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

testQuery();




