// server/controllers/complementos.js
import pool from '../config/db.js';

// Criar complemento
export const criarComplemento = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { nome, valor_venda, valor_custo, estabelecimento_id } = req.body;
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Validações básicas
    if (!nome || !estabelecimento_id) {
      return res.status(400).json({
        success: false,
        message: 'Nome e estabelecimento_id são obrigatórios'
      });
    }

    // Inserir complemento
    const query = `
      INSERT INTO complementos (nome, valor_venda, valor_custo, imagem_url, estabelecimento_id, status, criado_em)
      VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [nome, valor_venda || 0, valor_custo || 0, imagem_url, estabelecimento_id];
    
    const result = await client.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Complemento criado com sucesso',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao criar complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

// Buscar complementos por estabelecimento
export const buscarComplementosPorEstabelecimento = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { estabelecimento_id } = req.params;
    
    const query = `
      SELECT id, nome, valor_venda, valor_custo, imagem_url, status, criado_em
      FROM complementos 
      WHERE estabelecimento_id = $1 
      ORDER BY nome ASC
    `;
    
    const result = await client.query(query, [estabelecimento_id]);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Erro ao buscar complementos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

// Atualizar complemento
export const atualizarComplemento = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { nome, valor_venda, valor_custo } = req.body;
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Validações básicas
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    // Verificar se o complemento existe
    const checkQuery = 'SELECT * FROM complementos WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    // Atualizar complemento
    let query, values;
    
    if (imagem_url) {
      // Se há nova imagem
      query = `
        UPDATE complementos 
        SET nome = $1, valor_venda = $2, valor_custo = $3, imagem_url = $4
        WHERE id = $5
        RETURNING *
      `;
      values = [nome, valor_venda || 0, valor_custo || 0, imagem_url, id];
    } else {
      // Se não há nova imagem
      query = `
        UPDATE complementos 
        SET nome = $1, valor_venda = $2, valor_custo = $3
        WHERE id = $4
        RETURNING *
      `;
      values = [nome, valor_venda || 0, valor_custo || 0, id];
    }
    
    const result = await client.query(query, values);
    
    res.json({
      success: true,
      message: 'Complemento atualizado com sucesso',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao atualizar complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

// Atualizar status do complemento
export const atualizarStatusComplemento = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Verificar se o complemento existe
    const checkQuery = 'SELECT * FROM complementos WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    // Atualizar status
    const query = `
      UPDATE complementos 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [status, id]);
    
    res.json({
      success: true,
      message: 'Status do complemento atualizado com sucesso',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao atualizar status do complemento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  } finally {
    client.release();
  }
};

// Deletar complemento
export const deletarComplemento = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // Verificar se o complemento existe
    const checkQuery = 'SELECT * FROM complementos WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complemento não encontrado'
      });
    }

    // Deletar complemento
    const query = 'DELETE FROM complementos WHERE id = $1';
    await client.query(query, [id]);
    
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
  } finally {
    client.release();
  }
};
