import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Criar item de complemento (relacionar categoria com complemento)
const criarItemComplemento = async (req, res) => {
  const { categoria_id, complemento_id } = req.body;

  try {
    // Verificar se a categoria existe
    const categoriaCheck = await pool.query(
      'SELECT id FROM categorias_complementos WHERE id = $1',
      [categoria_id]
    );

    if (categoriaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se o complemento existe
    const complementoCheck = await pool.query(
      'SELECT id FROM complementos WHERE id = $1',
      [complemento_id]
    );

    if (complementoCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    // Verificar se já existe essa relação
    const existingCheck = await pool.query(
      'SELECT id FROM itens_complementos WHERE categoria_id = $1 AND complemento_id = $2',
      [categoria_id, complemento_id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este complemento já está associado a esta categoria'
      });
    }

    // Criar o item de complemento
    const result = await pool.query(
      'INSERT INTO itens_complementos (categoria_id, complemento_id) VALUES ($1, $2) RETURNING *',
      [categoria_id, complemento_id]
    );

    res.status(201).json({
      success: true,
      message: 'Item de complemento criado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar item de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar múltiplos itens de complemento de uma vez
const criarMultiplosItensComplemento = async (req, res) => {
  const { categoria_id, complemento_ids } = req.body;

  try {
    // Verificar se a categoria existe
    const categoriaCheck = await pool.query(
      'SELECT id FROM categorias_complementos WHERE id = $1',
      [categoria_id]
    );

    if (categoriaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Verificar se os complementos existem
    const complementosCheck = await pool.query(
      'SELECT id FROM complementos WHERE id = ANY($1)',
      [complemento_ids]
    );

    if (complementosCheck.rows.length !== complemento_ids.length) {
      return res.status(404).json({
        success: false,
        message: 'Um ou mais complementos não foram encontrados'
      });
    }

    // Iniciar transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const createdItems = [];

      for (const complemento_id of complemento_ids) {
        // Verificar se já existe essa relação
        const existingCheck = await client.query(
          'SELECT id FROM itens_complementos WHERE categoria_id = $1 AND complemento_id = $2',
          [categoria_id, complemento_id]
        );

        if (existingCheck.rows.length === 0) {
          // Criar o item de complemento
          const result = await client.query(
            'INSERT INTO itens_complementos (categoria_id, complemento_id) VALUES ($1, $2) RETURNING *',
            [categoria_id, complemento_id]
          );
          createdItems.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: `${createdItems.length} itens de complemento criados com sucesso`,
        data: createdItems
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao criar múltiplos itens de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar itens de complemento por categoria
const buscarItensPorCategoria = async (req, res) => {
  const { categoria_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        ic.id,
        ic.categoria_id,
        ic.complemento_id,
        c.nome as nome_complemento,
        c.valor_venda,
        c.status as status_complemento
      FROM itens_complementos ic
      INNER JOIN complementos c ON ic.complemento_id = c.id
      WHERE ic.categoria_id = $1
      ORDER BY c.nome
    `, [categoria_id]);

    res.status(200).json({
      success: true,
      message: 'Itens de complemento encontrados',
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar itens de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar itens de complemento por produto (todas as categorias)
const buscarItensPorProduto = async (req, res) => {
  const { produto_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        ic.id,
        ic.categoria_id,
        ic.complemento_id,
        cc.nome as nome_categoria,
        c.nome as nome_complemento,
        c.valor_venda,
        c.status as status_complemento
      FROM itens_complementos ic
      INNER JOIN categorias_complementos cc ON ic.categoria_id = cc.id
      INNER JOIN complementos c ON ic.complemento_id = c.id
      WHERE cc.produto_id = $1
      ORDER BY cc.nome, c.nome
    `, [produto_id]);

    res.status(200).json({
      success: true,
      message: 'Itens de complemento encontrados',
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao buscar itens de complemento por produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar item de complemento
const deletarItemComplemento = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM itens_complementos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de complemento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item de complemento deletado com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao deletar item de complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar todos os itens de uma categoria
const deletarItensPorCategoria = async (req, res) => {
  const { categoria_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM itens_complementos WHERE categoria_id = $1 RETURNING *',
      [categoria_id]
    );

    res.status(200).json({
      success: true,
      message: `${result.rows.length} itens de complemento deletados com sucesso`,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao deletar itens de complemento por categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export {
  criarItemComplemento,
  criarMultiplosItensComplemento,
  buscarItensPorCategoria,
  buscarItensPorProduto,
  deletarItemComplemento,
  deletarItensPorCategoria
};
