import pool from '../config/db.js';

// Cadastrar novo produto
const criarProduto = async (req, res) => {
  try {
    console.log('📝 Iniciando criação de produto...');
    console.log('📁 Arquivo recebido:', req.file);
    console.log('📋 Body recebido:', req.body);
    console.log('🔍 Headers:', req.headers);
    console.log('🌐 URL:', req.originalUrl);
    console.log('📡 Método:', req.method);
    console.log('🌍 Ambiente:', process.env.NODE_ENV);
    console.log('🔑 Content-Type:', req.get('Content-Type'));
    console.log('📦 FormData keys:', Object.keys(req.body));
    
    // Verificar se o body está vazio ou malformado
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Body vazio ou malformado');
      return res.status(400).json({
        success: false,
        message: 'Dados do formulário não recebidos corretamente'
      });
    }
    
    const {
      estabelecimento_id,
      nome,
      descricao,
      categoria_id,
      valor_venda,
      valor_custo,
      habilitar_estoque,
      estoque_quantidade,
      habilitar_tempo_preparo,
      tempo_preparo,
      status = true
    } = req.body;

    // Verificar se a imagem foi enviada
    let imagem_url = null;
    
    if (req.file) {
      // Em produção (Render), usar URL completa
      const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';
      console.log('🌍 Ambiente detectado no backend:', isProduction ? 'Produção' : 'Desenvolvimento');
      console.log('🔑 NODE_ENV:', process.env.NODE_ENV);
      console.log('📁 Arquivo recebido:', req.file.filename);
      
      if (isProduction) {
        imagem_url = `https://filazero-sistema-de-gestao.onrender.com/uploads/${req.file.filename}`;
      } else {
        imagem_url = `/uploads/${req.file.filename}`;
      }
      
      // Verificar se a URL não está duplicada
      if (imagem_url.includes('https://filazero-sistema-de-gestao.onrender.comhttps://')) {
        console.error('❌ ERRO: URL duplicada detectada!');
        imagem_url = imagem_url.replace('https://filazero-sistema-de-gestao.onrender.comhttps://', 'https://');
        console.log('🔧 URL corrigida:', imagem_url);
      }
      
      console.log('🖼️ Imagem URL salva:', imagem_url);
    }

    // Validar campos obrigatórios
    if (!estabelecimento_id || !nome || !categoria_id) {
      console.log('❌ Validação falhou:', { estabelecimento_id, nome, categoria_id });
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID, nome e categoria são obrigatórios',
        received: { estabelecimento_id, nome, categoria_id },
        body: req.body
      });
    }

    // Verificar se já existe produto com o mesmo nome no estabelecimento
    const produtoExistente = await pool.query(
      'SELECT id FROM produtos WHERE nome = $1 AND estabelecimento_id = $2',
      [nome, estabelecimento_id]
    );

    if (produtoExistente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um produto com este nome neste estabelecimento'
      });
    }

    // Converter valores booleanos
    const habilitarEstoque = habilitar_estoque === 'true' || habilitar_estoque === true;
    const habilitarTempoPreparo = habilitar_tempo_preparo === 'true' || habilitar_tempo_preparo === true;
    const statusBoolean = status === 'true' || status === true;

    // Inserir novo produto usando os nomes corretos das colunas
    const novoProduto = await pool.query(
      `INSERT INTO produtos (
        estabelecimento_id, 
        nome, 
        descricao, 
        categoria_id,
        imagem_url, 
        valor_venda,
        valor_custo,
        habilita_estoque,
        estoque_qtd,
        habilita_tempo_preparo,
        tempo_preparo_min,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        estabelecimento_id, 
        nome, 
        descricao, 
        categoria_id,
        imagem_url, 
        valor_venda || null,
        valor_custo || null,
        habilitarEstoque,
        habilitarEstoque ? (estoque_quantidade || 0) : 0,
        habilitarTempoPreparo,
        habilitarTempoPreparo ? (tempo_preparo || 0) : 0,
        statusBoolean
      ]
    );

    console.log('✅ Produto criado com sucesso:', novoProduto.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: novoProduto.rows[0]
    });

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    
    // Log detalhado para debug
    console.error('🔍 Detalhes do erro:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Buscar produtos por estabelecimento
const buscarProdutosPorEstabelecimento = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;

    const produtos = await pool.query(
      `SELECT p.*, c.nome as categoria_nome 
       FROM produtos p 
       LEFT JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.estabelecimento_id = $1 
       ORDER BY p.nome`,
      [estabelecimento_id]
    );

    res.json({
      success: true,
      data: produtos.rows
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar produto
const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      estabelecimento_id, 
      descricao, 
      categoria_id,
      valor_venda,
      valor_custo,
      habilitar_estoque,
      estoque_quantidade,
      habilitar_tempo_preparo,
      tempo_preparo
    } = req.body;
    
    console.log('✏️ Iniciando atualização do produto:', id);
    console.log('📋 Dados recebidos:', { 
      nome, 
      estabelecimento_id, 
      descricao, 
      categoria_id,
      valor_venda,
      valor_custo,
      habilitar_estoque,
      estoque_quantidade,
      habilitar_tempo_preparo,
      tempo_preparo
    });
    console.log('📁 Arquivo recebido:', req.file);
    
    // Verificar se o produto existe
    const produtoExistente = await pool.query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );
    
    if (produtoExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Verificar se já existe outro produto com o mesmo nome no estabelecimento
    if (nome && nome !== produtoExistente.rows[0].nome) {
      const produtoComMesmoNome = await pool.query(
        'SELECT id FROM produtos WHERE nome = $1 AND estabelecimento_id = $2 AND id != $3',
        [nome, estabelecimento_id, id]
      );
      
      if (produtoComMesmoNome.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um produto com este nome neste estabelecimento'
        });
      }
    }
    
    // Preparar dados para atualização
    let imagem_url = produtoExistente.rows[0].imagem_url;
    
    if (req.file) {
      // Em produção (Render), usar URL completa
      const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';
      
      if (isProduction) {
        imagem_url = `https://filazero-sistema-de-gestao.onrender.com/uploads/${req.file.filename}`;
      } else {
        imagem_url = `/uploads/${req.file.filename}`;
      }
      
      console.log('🖼️ Nova imagem URL:', imagem_url);
    }
    
    // Converter valores booleanos
    const habilitarEstoque = habilitar_estoque === 'true' || habilitar_estoque === true;
    const habilitarTempoPreparo = habilitar_tempo_preparo === 'true' || habilitar_tempo_preparo === true;
    
    // Preparar campos para atualização usando os nomes corretos das colunas
    const camposAtualizados = {
      nome: nome || produtoExistente.rows[0].nome,
      descricao: descricao !== undefined ? descricao : produtoExistente.rows[0].descricao,
      categoria_id: categoria_id || produtoExistente.rows[0].categoria_id,
      valor_venda: valor_venda !== undefined ? valor_venda : produtoExistente.rows[0].valor_venda,
      valor_custo: valor_custo !== undefined ? valor_custo : produtoExistente.rows[0].valor_custo,
      habilita_estoque: habilitarEstoque,
      estoque_qtd: habilitarEstoque ? (estoque_quantidade || 0) : 0,
      habilita_tempo_preparo: habilitarTempoPreparo,
      tempo_preparo_min: habilitarTempoPreparo ? (tempo_preparo || 0) : 0,
      imagem_url: imagem_url
    };
    
    console.log('🔧 Campos que serão atualizados:', camposAtualizados);
    
    // Atualizar produto usando os nomes corretos das colunas
    const produtoAtualizado = await pool.query(
      `UPDATE produtos 
       SET nome = $1, 
           descricao = $2,
           categoria_id = $3,
           valor_venda = $4,
           valor_custo = $5,
           habilita_estoque = $6,
           estoque_qtd = $7,
           habilita_tempo_preparo = $8,
           tempo_preparo_min = $9,
           imagem_url = $10
       WHERE id = $11 
       RETURNING *`,
      [
        camposAtualizados.nome,
        camposAtualizados.descricao,
        camposAtualizados.categoria_id,
        camposAtualizados.valor_venda,
        camposAtualizados.valor_custo,
        camposAtualizados.habilita_estoque,
        camposAtualizados.estoque_qtd,
        camposAtualizados.habilita_tempo_preparo,
        camposAtualizados.tempo_preparo_min,
        camposAtualizados.imagem_url,
        id
      ]
    );
    
    console.log('✅ Produto atualizado com sucesso:', produtoAtualizado.rows[0]);
    
    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produtoAtualizado.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    console.error('🔍 Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar status do produto
const atualizarStatusProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 Iniciando atualização de status do produto:', id);
    console.log('📊 Novo status recebido:', status);
    console.log('📋 Tipo do status:', typeof status);
    console.log('🔍 Body completo:', req.body);
    
    // Validar se o status foi enviado
    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório'
      });
    }
    
    // Converter para boolean se necessário
    let statusBoolean = status;
    if (typeof status === 'string') {
      if (status.toLowerCase() === 'true' || status === '1') {
        statusBoolean = true;
      } else if (status.toLowerCase() === 'false' || status === '0') {
        statusBoolean = false;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Status deve ser true ou false'
        });
      }
    }
    
    console.log('🔧 Status convertido para boolean:', statusBoolean);
    
    // Verificar se o produto existe
    const produtoExistente = await pool.query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );
    
    if (produtoExistente.rows.length === 0) {
      console.log('❌ Produto não encontrado:', id);
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    console.log('📋 Produto encontrado:', produtoExistente.rows[0]);
    console.log('🔄 Status atual:', produtoExistente.rows[0].status);
    console.log('🔄 Novo status:', statusBoolean);
    
    // Atualizar status
    const produtoAtualizado = await pool.query(
      `UPDATE produtos 
       SET status = $1
       WHERE id = $2 
       RETURNING *`,
      [statusBoolean, id]
    );
    
    console.log('✅ Status do produto atualizado com sucesso:', produtoAtualizado.rows[0]);
    
    res.json({
      success: true,
      message: 'Status do produto atualizado com sucesso',
      data: produtoAtualizado.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status do produto:', error);
    console.error('🔍 Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Deletar produto
const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Iniciando exclusão do produto:', id);
    
    // Buscar produto para pegar o caminho da imagem
    const produto = await pool.query(
      'SELECT imagem_url FROM produtos WHERE id = $1',
      [id]
    );
    
    if (produto.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    // Deletar produto do banco
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    
    // Se tinha imagem, deletar arquivo
    if (produto.rows[0].imagem_url) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const imagePath = path.join(__dirname, '..', produto.rows[0].imagem_url.replace(/^\/uploads\//, 'uploads/'));
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Arquivo de imagem deletado:', imagePath);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao deletar arquivo de imagem:', error.message);
      }
    }
    
    console.log('✅ Produto deletado com sucesso');
    
    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export {
  criarProduto,
  buscarProdutosPorEstabelecimento,
  atualizarProduto,
  atualizarStatusProduto,
  deletarProduto
};
