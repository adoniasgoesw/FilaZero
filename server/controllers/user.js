// server/controllers/user.js
import pool from '../config/db.js';
import cacheManager from '../config/cache.js';

// Buscar perfil do usuário
export const buscarPerfilUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Tentar buscar do cache primeiro
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await cacheManager.get(cacheKey);
    
    if (cachedProfile) {
      console.log('⚡ Perfil servido do cache');
      return res.json({
        success: true,
        data: cachedProfile,
        fromCache: true
      });
    }

    // Se não encontrou no cache, buscar do banco
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.cargo,
        u.cpf,
        u.telefone,
        u.status,
        u.criado_em,
        e.id as estabelecimento_id,
        e.nome as estabelecimento_nome,
        e.endereco as estabelecimento_endereco,
        e.telefone as estabelecimento_telefone,
        e.cnpj as estabelecimento_cnpj
      FROM usuarios u
      LEFT JOIN estabelecimentos e ON u.estabelecimento_id = e.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const userProfile = result.rows[0];
    
    // Salvar no cache por 10 minutos
    await cacheManager.set(cacheKey, userProfile, 600);
    
    console.log('💾 Perfil salvo no cache');
    
    res.json({
      success: true,
      data: userProfile,
      fromCache: false
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
};

// Atualizar perfil do usuário
export const atualizarPerfilUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nome, email, cargo, telefone } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Verificar se o usuário existe
    const checkQuery = 'SELECT * FROM usuarios WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar usuário
    const updateQuery = `
      UPDATE usuarios 
      SET nome = COALESCE($1, nome), 
          email = COALESCE($2, email), 
          cargo = COALESCE($3, cargo), 
          telefone = COALESCE($4, telefone),
          atualizado_em = NOW()
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [nome, email, cargo, telefone, userId]);
    
    // Invalidar cache do perfil
    const cacheKey = `user:profile:${userId}`;
    await cacheManager.delete(cacheKey);
    
    console.log('🗑️ Cache do perfil invalidado após atualização');
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
};

// Buscar usuários por estabelecimento
export const buscarUsuariosPorEstabelecimento = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;
    
    if (!estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do estabelecimento é obrigatório'
      });
    }

    // Tentar buscar do cache
    const cacheKey = `users:estabelecimento:${estabelecimento_id}`;
    const cachedUsers = await cacheManager.get(cacheKey);
    
    if (cachedUsers) {
      console.log('⚡ Usuários servidos do cache');
      return res.json({
        success: true,
        data: cachedUsers,
        fromCache: true
      });
    }

    // Buscar do banco
    const query = `
      SELECT 
        id,
        nome,
        email,
        cargo,
        status,
        criado_em
      FROM usuarios 
      WHERE estabelecimento_id = $1 
      ORDER BY nome ASC
    `;
    
    const result = await pool.query(query, [estabelecimento_id]);
    
    // Salvar no cache por 5 minutos
    await cacheManager.set(cacheKey, result.rows, 300);
    
    console.log('💾 Lista de usuários salva no cache');
    
    res.json({
      success: true,
      data: result.rows,
      fromCache: false
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar usuários',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
};

// Atualizar status do usuário
export const atualizarStatusUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser um valor booleano'
      });
    }

    // Verificar se o usuário existe
    const checkQuery = 'SELECT estabelecimento_id FROM usuarios WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const estabelecimento_id = checkResult.rows[0].estabelecimento_id;

    // Atualizar status
    const updateQuery = `
      UPDATE usuarios 
      SET status = $1, atualizado_em = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [status, userId]);
    
    // Invalidar caches relacionados
    await cacheManager.delete(`user:profile:${userId}`);
    await cacheManager.deletePattern(`users:estabelecimento:${estabelecimento_id}`);
    
    console.log('🗑️ Caches relacionados invalidados após mudança de status');
    
    res.json({
      success: true,
      message: `Usuário ${status ? 'ativado' : 'desativado'} com sucesso!`,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
};
