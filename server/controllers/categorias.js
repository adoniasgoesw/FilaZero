import pool from '../config/db.js';
import path from 'path';
import { buildImageUrl } from '../config/images.js';

// Cadastrar nova categoria
const criarCategoria = async (req, res) => {
  try {
    console.log('📝 Iniciando criação de categoria...');
    console.log('📁 Arquivo recebido:', req.file);
    console.log('📋 Body recebido:', req.body);
    console.log('🔍 Headers:', req.headers);
    console.log('🌐 User-Agent:', req.get('User-Agent'));
    console.log('📱 É dispositivo móvel?', /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent')));
    
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
    console.log('🖼️ Imagem URL:', imagem_url);
    console.log('📁 Caminho completo da imagem:', req.file ? path.join(process.cwd(), 'uploads', req.file.filename) : 'Nenhuma imagem');

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

    // Adicionar URL completa da imagem
    const categoriaComImagem = {
      ...novaCategoria.rows[0],
      imagem_url: construirUrlImagem(novaCategoria.rows[0].imagem_url, req)
    };

    console.log('✅ Categoria criada com sucesso:', categoriaComImagem);
    console.log('🖼️ URL da imagem:', categoriaComImagem.imagem_url);
    
    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoriaComImagem
    });

  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
    console.error('🔍 Detalhes do erro:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Função para construir URL completa da imagem (usando nova configuração)
const construirUrlImagem = (imagem_url, req) => {
  return buildImageUrl(imagem_url, req);
};

// Buscar categorias por estabelecimento
const buscarCategoriasPorEstabelecimento = async (req, res) => {
  try {
    const { estabelecimento_id } = req.params;

    const categorias = await pool.query(
      'SELECT * FROM categorias WHERE estabelecimento_id = $1 ORDER BY nome',
      [estabelecimento_id]
    );

    // Adicionar URLs completas das imagens
    const categoriasComImagens = categorias.rows.map(categoria => ({
      ...categoria,
      imagem_url: construirUrlImagem(categoria.imagem_url, req)
    }));

    console.log('📋 Categorias encontradas:', categoriasComImagens.length);
    console.log('🖼️ URLs das imagens:', categoriasComImagens.map(cat => ({ id: cat.id, nome: cat.nome, imagem_url: cat.imagem_url })));

    res.json({
      success: true,
      data: categoriasComImagens
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

    // Adicionar URL completa da imagem
    const categoriaComImagem = {
      ...categoria.rows[0],
      imagem_url: construirUrlImagem(categoria.rows[0].imagem_url, req)
    };

    console.log('🔍 Categoria encontrada:', { id: categoriaComImagem.id, nome: categoriaComImagem.nome, imagem_url: categoriaComImagem.imagem_url });

    res.json({
      success: true,
      data: categoriaComImagem
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
    console.log('🔗 URL da requisição:', req.originalUrl);
    console.log('📡 Método HTTP:', req.method);
    
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
    
    // Se não foi enviada imagem, não incluir na atualização
    if (!req.file) {
      console.log('📷 Nenhuma imagem enviada, mantendo imagem atual');
    } else {
      console.log('📷 Nova imagem recebida:', req.file.filename);
    }

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

    if (imagem_url !== undefined && req.file) {
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

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const categoriaAtualizada = await pool.query(query, values);
    
    // Adicionar URL completa da imagem
    const categoriaComImagem = {
      ...categoriaAtualizada.rows[0],
      imagem_url: construirUrlImagem(categoriaAtualizada.rows[0].imagem_url, req)
    };
    
    console.log('✅ Categoria atualizada com sucesso:', categoriaComImagem);
    console.log('🔍 Query executada:', query);
    console.log('📊 Valores:', values);
    console.log('🖼️ URL da imagem:', categoriaComImagem.imagem_url);

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoriaComImagem
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

// Deletar categoria (exclusão completa)
const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria existe
    const categoriaExistente = await pool.query(
      'SELECT id, imagem_url FROM categorias WHERE id = $1',
      [id]
    );

    if (categoriaExistente.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    // Deletar arquivo de imagem se existir
    if (categoriaExistente.rows[0].imagem_url) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const imagePath = path.join(__dirname, '..', categoriaExistente.rows[0].imagem_url);
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Arquivo de imagem deletado:', imagePath);
        }
      } catch (fileError) {
        console.warn('⚠️ Erro ao deletar arquivo de imagem:', fileError.message);
      }
    }

    // Deletar categoria do banco de dados
    await pool.query(
      'DELETE FROM categorias WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Categoria excluída permanentemente'
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
  deletarCategoria
};
