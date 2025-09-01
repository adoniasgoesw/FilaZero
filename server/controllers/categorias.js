import pool from '../config/db.js';

const categoriasController = {
  // Cadastrar nova categoria
  async cadastrar(req, res) {
    try {
      const { nome } = req.body;
      const estabelecimentoId = req.body.estabelecimento_id;
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome || !estabelecimentoId) {
        return res.status(400).json({
          success: false,
          message: 'Nome e estabelecimento_id são obrigatórios'
        });
      }

      // Verificar se o estabelecimento existe
      const estabelecimentoCheck = await pool.query(
        'SELECT id FROM estabelecimentos WHERE id = $1 AND status = true',
        [estabelecimentoId]
      );

      if (estabelecimentoCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado ou inativo'
        });
      }

      // Inserir nova categoria
      const query = `
        INSERT INTO categorias (
          estabelecimento_id, 
          nome, 
          imagem_url, 
          status, 
          criado_em
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id, nome, imagem_url, status, criado_em
      `;

      const result = await pool.query(query, [
        estabelecimentoId,
        nome,
        imagemUrl,
        true // status ativo
      ]);

      const novaCategoria = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Categoria cadastrada com sucesso',
        data: novaCategoria
      });

    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar categorias por estabelecimento
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;

      const query = `
        SELECT 
          id, 
          nome, 
          imagem_url, 
          status, 
          criado_em
        FROM categorias 
        WHERE estabelecimento_id = $1 AND status = true
        ORDER BY nome ASC
      `;

      const result = await pool.query(query, [estabelecimento_id]);

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

export default categoriasController;
