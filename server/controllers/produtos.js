import pool from '../config/db.js';

const produtosController = {
  // Cadastrar novo produto
  async cadastrar(req, res) {
    try {
      const { 
        nome, 
        categoria_id, 
        valor_venda, 
        valor_custo, 
        codigo_pdv,
        habilita_estoque,
        estoque_qtd,
        habilita_tempo_preparo,
        tempo_preparo_min
      } = req.body;
      const estabelecimentoId = req.body.estabelecimento_id;
      // Cloudinary retorna a URL completa em req.file.path
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome || !categoria_id || !valor_venda || !estabelecimentoId) {
        return res.status(400).json({
          success: false,
          message: 'Nome, categoria, valor de venda e estabelecimento são obrigatórios'
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

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id FROM categorias WHERE id = $1 AND estabelecimento_id = $2',
        [categoria_id, estabelecimentoId]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      // Inserir novo produto
      const query = `
        INSERT INTO produtos (
          estabelecimento_id, 
          categoria_id,
          nome, 
          valor_venda,
          valor_custo,
          imagem_url,
          habilita_estoque,
          estoque_qtd,
          habilita_tempo_preparo,
          tempo_preparo_min,
          status, 
          criado_em
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
        RETURNING id, nome, categoria_id, valor_venda, valor_custo, imagem_url, habilita_estoque, estoque_qtd, habilita_tempo_preparo, tempo_preparo_min, status, criado_em
      `;

      const result = await pool.query(query, [
        estabelecimentoId,
        categoria_id,
        nome,
        parseFloat(valor_venda),
        valor_custo ? parseFloat(valor_custo) : null,
        imagemUrl,
        habilita_estoque === 'true' || habilita_estoque === true,
        estoque_qtd ? parseInt(estoque_qtd) : 0,
        habilita_tempo_preparo === 'true' || habilita_tempo_preparo === true,
        tempo_preparo_min ? parseInt(tempo_preparo_min) : null,
        true // status ativo
      ]);

      const novoProduto = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Produto cadastrado com sucesso',
        data: novoProduto
      });

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar categorias por estabelecimento (para dropdown)
  async listarCategorias(req, res) {
    try {
      const { estabelecimento_id } = req.params;

      const query = `
        SELECT 
          id, 
          nome,
          imagem_url
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
  },

  // Listar produtos por estabelecimento
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (page - 1) * limit;

      // Query para contar total de produtos
      const countQuery = `
        SELECT COUNT(*) as total
        FROM produtos p
        WHERE p.estabelecimento_id = $1
      `;

      // Query para buscar produtos com paginação
      const query = `
        SELECT 
          p.id,
          p.nome,
          p.descricao,
          p.valor_venda,
          p.valor_custo,
          p.imagem_url,
          p.habilita_estoque,
          p.estoque_qtd,
          p.habilita_tempo_preparo,
          p.tempo_preparo_min,
          p.status,
          p.criado_em,
          p.categoria_id,
          c.nome as categoria_nome,
          c.imagem_url as categoria_imagem_url
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.estabelecimento_id = $1
        ORDER BY p.nome ASC
        LIMIT $2 OFFSET $3
      `;

      // Executar queries em paralelo
      const [countResult, result] = await Promise.all([
        pool.query(countQuery, [estabelecimento_id]),
        pool.query(query, [estabelecimento_id, limit, offset])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          produtos: result.rows,
          total,
          page: parseInt(page),
          totalPages,
          hasMore: page < totalPages
        }
      });

    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Editar produto
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome, 
        categoria_id, 
        valor_venda, 
        valor_custo,
        habilita_estoque,
        estoque_qtd,
        habilita_tempo_preparo,
        tempo_preparo_min
      } = req.body;
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome || !categoria_id || !valor_venda) {
        return res.status(400).json({
          success: false,
          message: 'Nome, categoria e valor de venda são obrigatórios'
        });
      }

      // Verificar se o produto existe
      const produtoCheck = await pool.query(
        'SELECT id, nome, imagem_url, estabelecimento_id FROM produtos WHERE id = $1',
        [id]
      );

      if (produtoCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const produto = produtoCheck.rows[0];

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id FROM categorias WHERE id = $1 AND estabelecimento_id = $2',
        [categoria_id, produto.estabelecimento_id]
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
        // Atualizar com nova imagem
        query = `
          UPDATE produtos 
          SET 
            nome = $1, 
            categoria_id = $2, 
            valor_venda = $3, 
            valor_custo = $4,
            imagem_url = $5,
            habilita_estoque = $6,
            estoque_qtd = $7,
            habilita_tempo_preparo = $8,
            tempo_preparo_min = $9
          WHERE id = $10
          RETURNING id, nome, categoria_id, valor_venda, valor_custo, imagem_url, habilita_estoque, estoque_qtd, habilita_tempo_preparo, tempo_preparo_min, status
        `;
        values = [
          nome.trim(), 
          categoria_id, 
          parseFloat(valor_venda),
          valor_custo ? parseFloat(valor_custo) : null,
          imagemUrl,
          habilita_estoque === 'true' || habilita_estoque === true,
          estoque_qtd ? parseInt(estoque_qtd) : 0,
          habilita_tempo_preparo === 'true' || habilita_tempo_preparo === true,
          tempo_preparo_min ? parseInt(tempo_preparo_min) : null,
          id
        ];
      } else {
        // Atualizar sem nova imagem
        query = `
          UPDATE produtos 
          SET 
            nome = $1, 
            categoria_id = $2, 
            valor_venda = $3, 
            valor_custo = $4,
            habilita_estoque = $5,
            estoque_qtd = $6,
            habilita_tempo_preparo = $7,
            tempo_preparo_min = $8
          WHERE id = $9
          RETURNING id, nome, categoria_id, valor_venda, valor_custo, imagem_url, habilita_estoque, estoque_qtd, habilita_tempo_preparo, tempo_preparo_min, status
        `;
        values = [
          nome.trim(), 
          categoria_id, 
          parseFloat(valor_venda),
          valor_custo ? parseFloat(valor_custo) : null,
          habilita_estoque === 'true' || habilita_estoque === true,
          estoque_qtd ? parseInt(estoque_qtd) : 0,
          habilita_tempo_preparo === 'true' || habilita_tempo_preparo === true,
          tempo_preparo_min ? parseInt(tempo_preparo_min) : null,
          id
        ];
      }

      const result = await pool.query(query, values);
      const produtoAtualizado = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: produtoAtualizado
      });

    } catch (error) {
      console.error('Erro ao editar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Deletar produto
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o produto existe
      const produtoCheck = await pool.query(
        'SELECT id, nome, imagem_url FROM produtos WHERE id = $1',
        [id]
      );

      if (produtoCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const produto = produtoCheck.rows[0];

      // Deletar o produto do banco
      await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

      res.status(200).json({
        success: true,
        message: 'Produto deletado com sucesso',
        data: {
          id: produto.id,
          nome: produto.nome
        }
      });

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Alterar status do produto
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;

      // Verificar se o produto existe
      const produtoCheck = await pool.query(
        'SELECT id, nome, status FROM produtos WHERE id = $1',
        [id]
      );

      if (produtoCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const produto = produtoCheck.rows[0];
      const novoStatus = !produto.status;

      // Atualizar status do produto
      const query = `
        UPDATE produtos 
        SET status = $1
        WHERE id = $2
        RETURNING id, nome, status
      `;

      const result = await pool.query(query, [novoStatus, id]);
      const produtoAtualizado = result.rows[0];

      res.status(200).json({
        success: true,
        message: `Produto ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
        data: produtoAtualizado
      });

    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default produtosController;
