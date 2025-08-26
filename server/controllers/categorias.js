import pool from '../config/db.js';

// Cadastrar nova categoria
const criarCategoria = async (req, res) => {
  try {
    const {
      estabelecimento_id,
      nome,
      descricao,
      cor,
      icone,
      status = true
    } = req.body;

    // Verificar se a imagem foi enviada
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Validar campos obrigatórios
    if (!estabelecimento_id || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID e nome são obrigatórios'
      });
    }

    // Verificar se já existe categoria com o mesmo nome no estabelecimento
    const categoriaExistente = await pool.query(
      'SELECT id FROM categorias WHERE nome = $1 AND estabelecimento_id = $2',
      [nome, estabelecimento_id]
    );

    if (categoriaExistente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma categoria com este nome neste estabelecimento'
      });
    }

    // Inserir nova categoria
    const novaCategoria = await pool.query(
      `INSERT INTO categorias (
        estabelecimento_id, 
        nome, 
        descricao, 
        imagem_url, 
        cor, 
        icone, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [estabelecimento_id, nome, descricao, imagem_url, cor, icone, status]
    );

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: novaCategoria.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar categorias por estabelecimento
const buscarCategoriasPorEstabelecimento = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;

    const categorias = await pool.query(
      'SELECT * FROM categorias WHERE estabelecimento_id = $1 AND status = true ORDER BY nome',
      [estabelecimento_id]
    );

    res.json({
      success: true,
      data: categorias.rows
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar categoria por ID
const buscarCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoria.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar categoria
const atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      cor,
      icone,
      status
    } = req.body;

    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se a imagem foi enviada
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Construir query de atualização dinamicamente
    let query = 'UPDATE categorias SET';
    const values = [];
    let paramCount = 1;

    if (nome !== undefined) {
      query += ` nome = $${paramCount}`;
      values.push(nome);
      paramCount++;
    }

    if (descricao !== undefined) {
      query += paramCount === 1 ? ` descricao = $${paramCount}` : `, descricao = $${paramCount}`;
      values.push(descricao);
      paramCount++;
    }

    if (imagem_url !== undefined) {
      query += paramCount === 1 ? ` imagem_url = $${paramCount}` : `, imagem_url = $${paramCount}`;
      values.push(imagem_url);
      paramCount++;
    }

    if (cor !== undefined) {
      query += paramCount === 1 ? ` cor = $${paramCount}` : `, cor = $${paramCount}`;
      values.push(cor);
      paramCount++;
    }

    if (icone !== undefined) {
      query += paramCount === 1 ? ` icone = $${paramCount}` : `, icone = $${paramCount}`;
      values.push(icone);
      paramCount++;
    }

    if (status !== undefined) {
      query += paramCount === 1 ? ` status = $${paramCount}` : `, status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += `, atualizado_em = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const categoriaAtualizada = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoriaAtualizada.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar categoria (soft delete)
const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Soft delete - apenas desativa a categoria
    await pool.query(
      'UPDATE categorias SET status = false, atualizado_em = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export {
  criarCategoria,
  buscarCategoriasPorEstabelecimento,
  buscarCategoriaPorId,
  atualizarCategoria,
  deletarCategoria
};
