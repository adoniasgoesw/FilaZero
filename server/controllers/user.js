// server/controllers/user.js
import pool from '../config/db.js';

export const getUserProfile = async (req, res) => {
  try {
    const { userId, estabelecimentoId } = req.params;

    // Validar se os IDs foram fornecidos
    if (!userId || !estabelecimentoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e ID do estabelecimento são obrigatórios'
      });
    }

    // Buscar dados do usuário e estabelecimento
    const query = `
      SELECT u.id, u.nome_completo, u.email, u.cpf, u.cargo, u.status,
             e.id as estabelecimento_id, e.nome as estabelecimento_nome, e.cnpj
      FROM usuarios u
      INNER JOIN estabelecimentos e ON u.estabelecimento_id = e.id
      WHERE u.id = $1 AND e.id = $2 AND u.status = true AND e.status = true
    `;

    const result = await pool.query(query, [userId, estabelecimentoId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário ou estabelecimento não encontrado'
      });
    }

    const userData = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        usuario: {
          id: userData.id,
          nome_completo: userData.nome_completo,
          email: userData.email,
          cpf: userData.cpf,
          cargo: userData.cargo
        },
        estabelecimento: {
          id: userData.estabelecimento_id,
          nome: userData.estabelecimento_nome,
          cnpj: userData.cnpj
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
