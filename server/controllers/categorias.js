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
    
    if (req.file) {
      // Em produção (Render), usar URL completa
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        imagem_url = `https://filazero-sistema-de-gestao.onrender.com/uploads/${req.file.filename}`;
      } else {
        imagem_url = `/uploads/${req.file.filename}`;
      }
      console.log('🖼️ Imagem URL:', imagem_url);
      console.log('🌍 Ambiente:', isProduction ? 'Produção' : 'Desenvolvimento');
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

export {
  criarCategoria,
  buscarCategoriasPorEstabelecimento
};
