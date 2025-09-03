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
  },

  // Cadastrar categoria de complementos
  async cadastrarCategoriaComplemento(req, res) {
    try {
      const { 
        produto_id, 
        nome, 
        quantidade_minima, 
        quantidade_maxima, 
        preenchimento_obrigatorio 
      } = req.body;
      
      console.log('🔍 Dados recebidos:', req.body);

      // Validação dos campos obrigatórios
      if (!produto_id || !nome) {
        return res.status(400).json({
          success: false,
          message: 'Produto ID e nome são obrigatórios'
        });
      }

      // Verificar se o produto existe
      const produtoCheck = await pool.query(
        'SELECT id FROM produtos WHERE id = $1 AND status = true',
        [produto_id]
      );

      if (produtoCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado ou inativo'
        });
      }

      // Validar quantidades apenas se ambas estiverem preenchidas e válidas
      if (quantidade_minima && quantidade_maxima && 
          quantidade_minima !== '' && quantidade_maxima !== '') {
        const qtdMin = parseInt(quantidade_minima);
        const qtdMax = parseInt(quantidade_maxima);
        
        if (!isNaN(qtdMin) && !isNaN(qtdMax) && qtdMin > qtdMax) {
          return res.status(400).json({
            success: false,
            message: 'Quantidade mínima não pode ser maior que a máxima'
          });
        }
      }

      // Inserir categoria de complementos
      const query = `
        INSERT INTO categorias_complementos (
          produto_id, 
          nome, 
          quantidade_minima, 
          quantidade_maxima, 
          preenchimento_obrigatorio,
          status
        ) 
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *
      `;

      // Tratar valores vazios ou inválidos
      const qtdMinima = quantidade_minima && quantidade_minima !== '' ? parseInt(quantidade_minima) : 0;
      const qtdMaxima = quantidade_maxima && quantidade_maxima !== '' ? parseInt(quantidade_maxima) : null;
      
      console.log('🔍 Valores processados:', { qtdMinima, qtdMaxima });
      
      const values = [
        produto_id,
        nome.trim(),
        qtdMinima,
        qtdMaxima,
        preenchimento_obrigatorio === true || preenchimento_obrigatorio === 'true'
      ];
      
      console.log('🔍 Values para query:', values);

      const result = await pool.query(query, values);
      const categoriaComplemento = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Categoria de complementos cadastrada com sucesso',
        data: categoriaComplemento
      });

    } catch (error) {
      console.error('Erro ao cadastrar categoria de complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar categorias de complementos por produto
  async listarCategoriasComplementos(req, res) {
    try {
      const { produto_id } = req.params;

      if (!produto_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      const query = `
        SELECT * FROM categorias_complementos 
        WHERE produto_id = $1 AND status = true
        ORDER BY criado_em DESC
      `;

      const result = await pool.query(query, [produto_id]);

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao listar categorias de complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Editar categoria de complementos
  async editarCategoriaComplemento(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome, 
        quantidade_minima, 
        quantidade_maxima, 
        preenchimento_obrigatorio 
      } = req.body;

      // Validação dos campos obrigatórios
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      // Validar quantidades apenas se ambas estiverem preenchidas e válidas
      if (quantidade_minima && quantidade_maxima && 
          quantidade_minima !== '' && quantidade_maxima !== '') {
        const qtdMin = parseInt(quantidade_minima);
        const qtdMax = parseInt(quantidade_maxima);
        
        if (!isNaN(qtdMin) && !isNaN(qtdMax) && qtdMin > qtdMax) {
          return res.status(400).json({
            success: false,
            message: 'Quantidade mínima não pode ser maior que a máxima'
          });
        }
      }

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id FROM categorias_complementos WHERE id = $1 AND status = true',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria de complementos não encontrada'
        });
      }

      // Tratar valores vazios ou inválidos
      const qtdMinima = quantidade_minima && quantidade_minima !== '' ? parseInt(quantidade_minima) : 0;
      const qtdMaxima = quantidade_maxima && quantidade_maxima !== '' ? parseInt(quantidade_maxima) : null;

      // Atualizar categoria
      const query = `
        UPDATE categorias_complementos 
        SET 
          nome = $1,
          quantidade_minima = $2,
          quantidade_maxima = $3,
          preenchimento_obrigatorio = $4
        WHERE id = $5
        RETURNING *
      `;

      const values = [
        nome.trim(),
        qtdMinima,
        qtdMaxima,
        preenchimento_obrigatorio === true || preenchimento_obrigatorio === 'true',
        id
      ];

      const result = await pool.query(query, values);
      const categoriaAtualizada = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Categoria de complementos atualizada com sucesso',
        data: categoriaAtualizada
      });

    } catch (error) {
      console.error('Erro ao editar categoria de complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Deletar categoria de complementos
  async deletarCategoriaComplemento(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a categoria existe
      const categoriaCheck = await pool.query(
        'SELECT id, nome FROM categorias_complementos WHERE id = $1 AND status = true',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria de complementos não encontrada'
        });
      }

      // Soft delete - marcar como inativo
      const query = `
        UPDATE categorias_complementos 
        SET status = false
        WHERE id = $1
        RETURNING id, nome
      `;

      const result = await pool.query(query, [id]);
      const categoriaDeletada = result.rows[0];

      res.status(200).json({
        success: true,
        message: 'Categoria de complementos deletada com sucesso',
        data: categoriaDeletada
      });

    } catch (error) {
      console.error('Erro ao deletar categoria de complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ===== MÉTODOS DE COMPLEMENTOS =====

  // Cadastrar complemento
  async cadastrarComplemento(req, res) {
    try {
      const { estabelecimento_id, nome, valor_venda } = req.body;

      // Validações
      if (!estabelecimento_id || !nome || !valor_venda) {
        return res.status(400).json({
          success: false,
          message: 'Estabelecimento, nome e valor de venda são obrigatórios'
        });
      }

      const query = `
        INSERT INTO complementos (estabelecimento_id, nome, valor_venda)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const values = [estabelecimento_id, nome, valor_venda];
      const result = await pool.query(query, values);

      res.json({
        success: true,
        message: 'Complemento cadastrado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao cadastrar complemento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Listar complementos por estabelecimento
  async listarComplementos(req, res) {
    try {
      const { estabelecimento_id } = req.params;

      const query = `
        SELECT * FROM complementos 
        WHERE estabelecimento_id = $1 AND status = true
        ORDER BY criado_em DESC
      `;

      const result = await pool.query(query, [estabelecimento_id]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao listar complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Editar complemento
  async editarComplemento(req, res) {
    try {
      const { id } = req.params;
      const { nome, valor_venda } = req.body;

      // Validações
      if (!nome || !valor_venda) {
        return res.status(400).json({
          success: false,
          message: 'Nome e valor de venda são obrigatórios'
        });
      }

      const query = `
        UPDATE complementos 
        SET nome = $1, valor_venda = $2
        WHERE id = $3
        RETURNING *
      `;

      const values = [nome, valor_venda, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Complemento não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Complemento editado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao editar complemento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Deletar complemento (soft delete)
  async deletarComplemento(req, res) {
    try {
      const { id } = req.params;

      const query = `
        UPDATE complementos 
        SET status = false 
        WHERE id = $1
      `;

      await pool.query(query, [id]);

      res.json({
        success: true,
        message: 'Complemento deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar complemento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // ===== MÉTODOS PARA ITENS COMPLEMENTOS =====

  // Salvar complementos em uma categoria
  async salvarItensComplementos(req, res) {
    const { categoria_id, complementos } = req.body;

    try {
      console.log('🔍 Salvando itens complementos:', { categoria_id, complementos });

      // Validar dados
      if (!categoria_id || !complementos || !Array.isArray(complementos)) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos. categoria_id e complementos são obrigatórios.'
        });
      }

      // Verificar se a categoria existe
      const categoriaExiste = await pool.query(
        'SELECT id FROM categorias_complementos WHERE id = $1 AND status = true',
        [categoria_id]
      );

      if (categoriaExiste.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      // Remover itens existentes da categoria (para evitar duplicatas)
      await pool.query(
        'DELETE FROM itens_complementos WHERE categoria_id = $1',
        [categoria_id]
      );

      // Inserir novos itens
      const itensInseridos = [];
      for (const complemento_id of complementos) {
        const resultado = await pool.query(
          'INSERT INTO itens_complementos (categoria_id, complemento_id) VALUES ($1, $2) RETURNING *',
          [categoria_id, complemento_id]
        );
        itensInseridos.push(resultado.rows[0]);
      }

      console.log('✅ Itens complementos salvos:', itensInseridos.length);

      res.status(201).json({
        success: true,
        message: `${itensInseridos.length} complemento(s) adicionado(s) à categoria com sucesso!`,
        data: itensInseridos
      });

    } catch (error) {
      console.error('❌ Erro ao salvar itens complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Listar complementos de uma categoria
  async listarItensComplementos(req, res) {
    const { categoria_id } = req.params;

    try {
      console.log('🔍 Listando itens complementos para categoria:', categoria_id);

      // Buscar complementos da categoria com informações do complemento
      const resultado = await pool.query(`
        SELECT 
          ic.id,
          ic.categoria_id,
          ic.complemento_id,
          c.nome as complemento_nome,
          c.valor_venda as complemento_valor
        FROM itens_complementos ic
        INNER JOIN complementos c ON ic.complemento_id = c.id
        WHERE ic.categoria_id = $1 AND c.status = true
        ORDER BY c.nome ASC
      `, [categoria_id]);

      console.log('✅ Itens complementos encontrados:', resultado.rows.length);

      res.status(200).json({
        success: true,
        data: resultado.rows
      });

    } catch (error) {
      console.error('❌ Erro ao listar itens complementos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  // Deletar um item complemento específico
  async deletarItemComplemento(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do item complemento é obrigatório'
        });
      }

      // Verificar se o item existe
      const itemExiste = await pool.query(
        'SELECT * FROM itens_complementos WHERE id = $1',
        [id]
      );

      if (itemExiste.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item complemento não encontrado'
        });
      }

      // Deletar o item
      await pool.query(
        'DELETE FROM itens_complementos WHERE id = $1',
        [id]
      );

      console.log('✅ Item complemento deletado:', id);

      res.status(200).json({
        success: true,
        message: 'Item complemento deletado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao deletar item complemento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

export default produtosController;
