import pool from '../config/db.js';

const categoriasController = {
  // Cadastrar nova categoria
  async cadastrar(req, res) {
    try {
      const { nome } = req.body;
      const estabelecimentoId = req.body.estabelecimento_id;
      // Cloudinary retorna a URL completa em req.file.path
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
          descricao,
          imagem_url, 
          cor,
          icone,
          status, 
          criado_em,
          updated_at
        FROM categorias 
        WHERE estabelecimento_id = $1
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
  },

  // Editar categoria
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      // Cloudinary retorna a URL completa em req.file.path
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id, nome, imagem_url FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      // Preparar query de atualização
      let query, values;
      
      if (imagemUrl) {
        // Atualizar nome e imagem
        query = `
          UPDATE categorias 
          SET nome = $1, imagem_url = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING id, nome, imagem_url, status, updated_at
        `;
        values = [nome.trim(), imagemUrl, id];
      } else {
        // Atualizar apenas o nome
        query = `
          UPDATE categorias 
          SET nome = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, nome, imagem_url, status, updated_at
        `;
        values = [nome.trim(), id];
      }

      const result = await pool.query(query, values);
      const categoriaAtualizada = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: categoriaAtualizada
      });

    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Deletar categoria
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id, nome, imagem_url FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const categoria = categoriaCheck.rows[0];

      // Deletar a categoria do banco
      await pool.query('DELETE FROM categorias WHERE id = $1', [id]);

      res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso',
        data: {
          id: categoria.id,
          nome: categoria.nome
        }
      });

    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Alterar status da categoria
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id, nome, status FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const categoria = categoriaCheck.rows[0];
      const novoStatus = !categoria.status;

      // Atualizar status da categoria
      const query = `
        UPDATE categorias 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, status, updated_at
      `;

      const result = await pool.query(query, [novoStatus, id]);
      const categoriaAtualizada = result.rows[0];

      res.status(200).json({
        success: true,
        message: `Categoria ${novoStatus ? 'ativada' : 'desativada'} com sucesso`,
        data: categoriaAtualizada
      });

    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default categoriasController;

