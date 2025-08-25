// server/controllers/login.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!cpf || !senha) {
      return res.status(400).json({
        success: false,
        message: 'CPF e senha são obrigatórios'
      });
    }

    // Remover formatação do CPF (pontos e traços)
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Validar se o CPF tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos'
      });
    }

    // Buscar usuário pelo CPF
    const query = `
      SELECT u.id, u.nome_completo, u.email, u.cpf, u.senha, u.cargo, u.status,
             e.id as estabelecimento_id, e.nome as estabelecimento_nome, e.cnpj
      FROM usuarios u
      INNER JOIN estabelecimentos e ON u.estabelecimento_id = e.id
      WHERE u.cpf = $1 AND u.status = true
    `;

    console.log('🔍 Buscando usuário com CPF:', cpfLimpo);
    console.log('🔍 CPF original recebido:', cpf);

    const result = await pool.query(query, [cpfLimpo]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'CPF não encontrado ou usuário inativo'
      });
    }

    const usuario = result.rows[0];

    // Verificar se a senha está correta
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Login bem-sucedido
    res.status(200).json({
      success: true,
      message: 'Acesso permitido',
      data: {
        usuario: {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          cpf: usuario.cpf,
          cargo: usuario.cargo
        },
        estabelecimento: {
          id: usuario.estabelecimento_id,
          nome: usuario.estabelecimento_nome,
          cnpj: usuario.cnpj
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
