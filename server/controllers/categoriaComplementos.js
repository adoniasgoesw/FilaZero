import pool from '../config/db.js';

// Criar nova categoria de complemento
export const criarCategoriaComplemento = async (req, res) => {
  try {
    const { produto_id, nome, quantidade_minima, quantidade_maxima, preenchimento_obrigatorio, status } = req.body;

    // Validações básicas
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    if (quantidade_minima > quantidade_maxima) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade mínima não pode ser maior que a máxima'
      });
    }

    // Inserir no banco
    const query = `
      INSERT INTO categorias_complementos 
      (produto_id, nome, quantidade_minima, quantidade_maxima, preenchimento_obrigatorio, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      produto_id,
      nome.trim(),
      quantidade_minima || 0,
      quantidade_maxima || 1,
      preenchimento_obrigatorio || false,
      status !== undefined ? status : true
    ];

    const result = await pool.query(query, values);
    const novaCategoria = result.rows[0];

    console.log('✅ Categoria de complemento criada:', novaCategoria);

    res.status(201).json({
      success: true,
      message: 'Categoria de complemento criada com sucesso',
      data: novaCategoria
    });

  } catch (error) {
    console.error('❌ Erro ao criar categoria de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar categoria'
    });
  }
};

// Listar categorias de complementos por produto
export const listarCategoriasPorProduto = async (req, res) => {
  try {
    const { produtoId } = req.params;

    if (!produtoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do produto é obrigatório'
      });
    }

    const query = `
      SELECT * FROM categorias_complementos 
      WHERE produto_id = $1 
      ORDER BY criado_em DESC
    `;

    const result = await pool.query(query, [produtoId]);
    const categorias = result.rows;

    console.log(`✅ Categorias encontradas para produto ${produtoId}:`, categorias.length);

    res.json({
      success: true,
      message: 'Categorias carregadas com sucesso',
      data: categorias
    });

  } catch (error) {
    console.error('❌ Erro ao listar categorias de complementos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar categorias'
    });
  }
};

// Atualizar categoria de complemento completa
export const atualizarCategoriaComplemento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade_minima, quantidade_maxima, preenchimento_obrigatorio, status } = req.body;

    // Validações básicas
    if (!nome || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório'
      });
    }

    if (quantidade_minima > quantidade_maxima) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade mínima não pode ser maior que a máxima'
      });
    }

    // Verificar se a categoria existe
    const checkQuery = 'SELECT * FROM categorias_complementos WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Atualizar no banco
    const query = `
      UPDATE categorias_complementos 
      SET nome = $1, quantidade_minima = $2, quantidade_maxima = $3, 
          preenchimento_obrigatorio = $4, status = $5
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      nome.trim(),
      quantidade_minima || 0,
      quantidade_maxima || 1,
      preenchimento_obrigatorio || false,
      status !== undefined ? status : true,
      id
    ];

    const result = await pool.query(query, values);
    const categoriaAtualizada = result.rows[0];

    console.log('✅ Categoria de complemento atualizada:', categoriaAtualizada);

    res.json({
      success: true,
      message: 'Categoria de complemento atualizada com sucesso',
      data: categoriaAtualizada
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar categoria de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar categoria'
    });
  }
};

// Atualizar status da categoria de complemento
export const atualizarStatusCategoriaComplemento = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório'
      });
    }

    const query = `
      UPDATE categorias_complementos 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const categoriaAtualizada = result.rows[0];

    console.log('✅ Status da categoria atualizado:', categoriaAtualizada);

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: categoriaAtualizada
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status da categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar status'
    });
  }
};

// Deletar categoria de complemento
export const deletarCategoriaComplemento = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM categorias_complementos 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    const categoriaDeletada = result.rows[0];

    console.log('✅ Categoria deletada:', categoriaDeletada);

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso',
      data: categoriaDeletada
    });

  } catch (error) {
    console.error('❌ Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao deletar categoria'
    });
  }
};
