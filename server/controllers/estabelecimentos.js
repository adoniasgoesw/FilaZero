import { pool } from '../config/db.js';

// Buscar dados do estabelecimento por ID
const getEstabelecimento = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        nome,
        cnpj,
        setor,
        plano_atual,
        status,
        criado_em,
        rua,
        numero,
        bairro,
        cep,
        cidade,
        estado,
        latitude,
        longitude
      FROM estabelecimentos 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar dados do estabelecimento do usuário logado
const getEstabelecimentoUsuario = async (req, res) => {
  try {
    // Verificar se req.usuario existe (o middleware define req.usuario, não req.user)
    if (!req.usuario || !req.usuario.estabelecimento_id) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou estabelecimento não encontrado'
      });
    }
    
    const { estabelecimento_id } = req.usuario;

    const query = `
      SELECT 
        id,
        nome,
        cnpj,
        setor,
        plano_atual,
        status,
        criado_em,
        rua,
        numero,
        bairro,
        cep,
        cidade,
        estado,
        latitude,
        longitude
      FROM estabelecimentos 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [estabelecimento_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar estabelecimento do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar dados do estabelecimento
const updateEstabelecimento = async (req, res) => {
  try {
    console.log('🔄 Recebendo requisição para atualizar estabelecimento');
    console.log('👤 Usuário:', req.usuario);
    console.log('📝 Dados recebidos:', req.body);
    
    // Verificar se req.usuario existe
    if (!req.usuario || !req.usuario.estabelecimento_id) {
      console.log('❌ Usuário não autenticado ou estabelecimento não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou estabelecimento não encontrado'
      });
    }
    
    const { estabelecimento_id } = req.usuario;
    const {
      nome,
      cnpj,
      setor,
      rua,
      numero,
      bairro,
      cep,
      cidade,
      estado
    } = req.body;
    
    console.log('🏢 ID do estabelecimento:', estabelecimento_id);
    console.log('📋 Dados a serem atualizados:', {
      nome, cnpj, setor, rua, numero, bairro, cep, cidade, estado
    });

    const query = `
      UPDATE estabelecimentos 
      SET nome = $2,
          cnpj = $3,
          setor = $4,
          rua = $5,
          numero = $6,
          bairro = $7,
          cep = $8,
          cidade = $9,
          estado = $10
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      estabelecimento_id,
      nome,
      cnpj,
      setor,
      rua,
      numero,
      bairro,
      cep,
      cidade,
      estado
    ]);

    console.log('📊 Resultado da query:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ Estabelecimento não encontrado no banco de dados');
      return res.status(404).json({
        success: false,
        message: 'Estabelecimento não encontrado'
      });
    }

    console.log('✅ Estabelecimento atualizado com sucesso:', result.rows[0]);
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Estabelecimento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar estabelecimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export {
  getEstabelecimento,
  getEstabelecimentoUsuario,
  updateEstabelecimento
};
