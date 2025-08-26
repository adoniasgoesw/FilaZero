import pool from '../config/db.js';

// Cadastrar nova categoria
const criarCategoria = async (req, res) => {
  try {
    console.log('📝 Iniciando criação de categoria...');
    console.log('📋 Body recebido:', req.body);
    
    const {
      estabelecimento_id,
      nome,
      descricao,
      cor,
      icone,
      status = true
    } = req.body;

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
        cor, 
        icone, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [estabelecimento_id, nome, descricao, cor, icone, status]
    );

    console.log('✅ Categoria criada com sucesso:', novaCategoria.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: novaCategoria.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
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
      'SELECT * FROM categorias WHERE estabelecimento_id = $1 ORDER BY nome',
      [estabelecimento_id]
    );

    console.log('📋 Categorias encontradas:', categorias.rows.length);

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

    console.log('🔍 Categoria encontrada:', { id: categoria.rows[0].id, nome: categoria.rows[0].nome });

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
    console.log('📝 Iniciando atualização de categoria...');
    console.log('🆔 ID da categoria:', req.params.id);
    console.log('📋 Body recebido:', req.body);
    
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
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se já existe outra categoria com o mesmo nome no mesmo estabelecimento
    if (nome) {
      const categoriaComMesmoNome = await pool.query(
        'SELECT id FROM categorias WHERE nome = $1 AND estabelecimento_id = $2 AND id != $3',
        [nome, categoriaExistente.rows[0].estabelecimento_id, id]
      );

      if (categoriaComMesmoNome.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma categoria com este nome neste estabelecimento'
        });
      }
    }

    // Atualizar categoria
    const categoriaAtualizada = await pool.query(
      `UPDATE categorias SET 
        nome = COALESCE($1, nome),
        descricao = COALESCE($2, descricao),
        cor = COALESCE($3, cor),
        icone = COALESCE($4, icone),
        status = COALESCE($5, status),
        updated_at = NOW()
      WHERE id = $6 
      RETURNING *`,
      [nome, descricao, cor, icone, status, id]
    );

    console.log('✅ Categoria atualizada com sucesso:', categoriaAtualizada.rows[0]);

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoriaAtualizada.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar status da categoria
const atualizarStatusCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser um valor booleano'
      });
    }

    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Atualizar status
    const categoriaAtualizada = await pool.query(
      'UPDATE categorias SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    console.log('✅ Status da categoria atualizado:', { id, status });

    res.json({
      success: true,
      message: `Categoria ${status ? 'ativada' : 'desativada'} com sucesso`,
      data: categoriaAtualizada.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status da categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar categoria
const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Deletar categoria
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);

    console.log('✅ Categoria deletada com sucesso:', { id, nome: categoriaExistente.rows[0].nome });

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error);
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
  atualizarStatusCategoria,
  deletarCategoria
};
