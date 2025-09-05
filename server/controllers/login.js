import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const loginController = {
  // Login do usuário
  async login(req, res) {
    try {
      const { cpf, senha } = req.body;

      // Validação dos campos obrigatórios
      if (!cpf || !senha) {
        return res.status(400).json({
          success: false,
          message: 'CPF e senha são obrigatórios'
        });
      }

      // Buscar usuário pelo CPF
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
        WHERE u.cpf = $1 AND u.status = true
      `;

      const result = await pool.query(query, [cpf]);

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

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: usuario.id,
          cpf: usuario.cpf,
          estabelecimento_id: usuario.estabelecimento_id,
          cargo: usuario.cargo
        },
        process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
        { expiresIn: '24h' }
      );

      // Garantir configuração padrão de pontos de atendimento para o estabelecimento no login
      try {
        if (usuario.estabelecimento_id) {
          const select = await pool.query(
            'SELECT id FROM pontos_atendimento WHERE estabelecimento_id = $1 LIMIT 1',
            [usuario.estabelecimento_id]
          );
          if (select.rows.length === 0) {
            await pool.query(
              `INSERT INTO pontos_atendimento (
                estabelecimento_id,
                atendimento_mesas,
                atendimento_comandas,
                quantidade_mesas,
                quantidade_comandas,
                prefixo_comanda
              ) VALUES ($1, true, false, 4, 0, '')`,
              [usuario.estabelecimento_id]
            );
          }
        }
      } catch (ensureErr) {
        // Não bloquear o login por falha de criação; apenas logar
        console.error('Falha ao garantir pontos_atendimento padrão no login:', ensureErr.message);
      }

      // Remover senha do objeto de resposta
      delete usuario.senha;

      // Retornar sucesso com dados do usuário e token
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          usuario,
          token
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Verificar token (middleware)
  async verificarToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token não fornecido'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui');
      req.usuario = decoded;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao verificar token'
      });
    }
  },

  // Obter dados do usuário logado
  async getUsuarioLogado(req, res) {
    try {
      const { id } = req.usuario;

      const query = `
        SELECT 
          u.id,
          u.estabelecimento_id,
          u.nome_completo,
          u.email,
          u.whatsapp,
          u.cpf,
          u.cargo,
          u.status,
          u.criado_em,
          e.nome as nome_estabelecimento,
          e.setor as setor_estabelecimento
        FROM usuarios u
        LEFT JOIN estabelecimentos e ON u.estabelecimento_id = e.id
        WHERE u.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

export default loginController;
