import pool from '../config/db.js';

// Cadastrar nova categoria
const criarCategoria = async (req, res) => {
  try {
    console.log('📝 Iniciando criação de categoria...');
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
      cor,
      icone,
      status = true
    } = req.body;

    // Verificar se a imagem foi enviada
    let imagem_url = null;
    
    if (req.file && req.file.cloudinary) {
      // Usar URL do Cloudinary
      imagem_url = req.file.cloudinary.url;
      console.log('☁️ Imagem URL do Cloudinary:', imagem_url);
    } else if (req.file) {
      console.log('⚠️ Arquivo recebido mas sem informações do Cloudinary');
    }

    // Validar campos obrigatórios
    if (!estabelecimento_id || !nome) {
      console.log('❌ Validação falhou:', { estabelecimento_id, nome });
      return res.status(400).json({
        success: false,
        message: 'Estabelecimento ID e nome são obrigatórios',
        received: { estabelecimento_id, nome },
        body: req.body
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

    console.log('✅ Categoria criada com sucesso:', novaCategoria.rows[0]);
    
    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso!',
      data: novaCategoria.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar categoria',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
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

// Atualizar categoria
const atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, estabelecimento_id, descricao, cor, icone } = req.body;
    
    console.log('✏️ Iniciando atualização da categoria:', id);
    console.log('📋 Dados recebidos:', { nome, estabelecimento_id, descricao, cor, icone });
    console.log('📁 Arquivo recebido:', req.file);
    
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
    
    // Verificar se já existe outra categoria com o mesmo nome no estabelecimento
    if (nome && nome !== categoriaExistente.rows[0].nome) {
      const categoriaComMesmoNome = await pool.query(
        'SELECT id FROM categorias WHERE nome = $1 AND estabelecimento_id = $2 AND id != $3',
        [nome, estabelecimento_id, id]
      );
      
      if (categoriaComMesmoNome.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma categoria com este nome neste estabelecimento'
        });
      }
    }
    
    // Preparar dados para atualização
    let imagem_url = categoriaExistente.rows[0].imagem_url;
    
    if (req.file && req.file.cloudinary) {
      imagem_url = req.file.cloudinary.url;
      console.log('☁️ Nova imagem URL do Cloudinary:', imagem_url);
    } else if (req.file) {
      console.log('⚠️ Arquivo recebido mas sem informações do Cloudinary para atualização');
    }
    
    // Preparar campos para atualização
    const camposAtualizados = {
      nome: nome || categoriaExistente.rows[0].nome,
      descricao: descricao !== undefined ? descricao : categoriaExistente.rows[0].descricao,
      cor: cor !== undefined ? cor : categoriaExistente.rows[0].cor,
      icone: icone !== undefined ? icone : categoriaExistente.rows[0].icone,
      imagem_url: imagem_url
    };
    
    console.log('🔧 Campos que serão atualizados:', camposAtualizados);
    
    // Atualizar categoria
    const categoriaAtualizada = await pool.query(
      `UPDATE categorias 
       SET nome = $1, 
           descricao = $2,
           cor = $3,
           icone = $4,
           imagem_url = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [
        camposAtualizados.nome,
        camposAtualizados.descricao,
        camposAtualizados.cor,
        camposAtualizados.icone,
        camposAtualizados.imagem_url,
        id
      ]
    );
    
    console.log('✅ Categoria atualizada com sucesso:', categoriaAtualizada.rows[0]);
    
    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoriaAtualizada.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar categoria:', error);
    console.error('🔍 Stack trace:', error.stack);
    
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
    
    console.log('🔄 Iniciando atualização de status da categoria:', id);
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
    
    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );
    
    if (categoriaExistente.rows.length === 0) {
      console.log('❌ Categoria não encontrada:', id);
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    console.log('📋 Categoria encontrada:', categoriaExistente.rows[0]);
    console.log('🔄 Status atual:', categoriaExistente.rows[0].status);
    console.log('🔄 Novo status:', statusBoolean);
    
    // Atualizar status
    const categoriaAtualizada = await pool.query(
      `UPDATE categorias 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [statusBoolean, id]
    );
    
    console.log('✅ Status da categoria atualizado com sucesso:', categoriaAtualizada.rows[0]);
    
    res.json({
      success: true,
      message: 'Status da categoria atualizado com sucesso',
      data: categoriaAtualizada.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status da categoria:', error);
    console.error('🔍 Stack trace:', error.stack);
    
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
    
    console.log('🗑️ Iniciando exclusão da categoria:', id);
    
    // Buscar categoria para pegar o caminho da imagem
    const categoria = await pool.query(
      'SELECT imagem_url FROM categorias WHERE id = $1',
      [id]
    );
    
    if (categoria.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }
    
    // Deletar categoria do banco
    await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
    
    // Se tinha imagem, deletar arquivo
    if (categoria.rows[0].imagem_url) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const imagePath = path.join(__dirname, '..', categoria.rows[0].imagem_url.replace(/^\/uploads\//, 'uploads/'));
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Arquivo de imagem deletado:', imagePath);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao deletar arquivo de imagem:', error.message);
      }
    }
    
    console.log('✅ Categoria deletada com sucesso');
    
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
  atualizarCategoria,
  atualizarStatusCategoria,
  deletarCategoria
};
