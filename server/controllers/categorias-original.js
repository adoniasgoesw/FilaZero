import pool from '../config/db.js';
import { getFromCache, setToCache, invalidateCache } from '../utils/cache-memory.js';

// Função auxiliar para buscar categorias do banco
async function buscarCategoriasDoBanco(estabelecimento_id) {
  const query = `
    SELECT 
      id, 
      nome, 
      descricao,
      imagem_url, 
      cor,
      icone,
      status, 
      criado_em,
      updated_at
    FROM categorias 
    WHERE estabelecimento_id = $1
    ORDER BY nome ASC
  `;

  const result = await pool.query(query, [estabelecimento_id]);
  return result.rows;
}

// Função auxiliar para atualizar cache em background
async function atualizarCacheEmBackground(estabelecimento_id, cacheKey) {
  try {
    console.log('🔄 Atualizando cache em background...');
    const categorias = await buscarCategoriasDoBanco(estabelecimento_id);
    await setToCache(cacheKey, categorias, 3);
    console.log('✅ Cache atualizado em background');
  } catch (error) {
    console.error('❌ Erro ao atualizar cache em background:', error);
  }
}

const categoriasController = {
  // Cadastrar nova categoria
  async cadastrar(req, res) {
    try {
      const { nome } = req.body;
      const estabelecimentoId = req.body.estabelecimento_id;
      // Cloudinary retorna a URL completa em req.file.path
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome || !estabelecimentoId) {
        return res.status(400).json({
          success: false,
          message: 'Nome e estabelecimento_id são obrigatórios'
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

      // Inserir nova categoria
      const query = `
        INSERT INTO categorias (
          estabelecimento_id, 
          nome, 
          imagem_url, 
          status, 
          criado_em
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id, nome, imagem_url, status, criado_em
      `;

      const result = await pool.query(query, [
        estabelecimentoId,
        nome,
        imagemUrl,
        true // status ativo
      ]);

      const novaCategoria = result.rows[0];

      // 🗑️ Invalidar cache após criar categoria
      await invalidateCache(`categorias:${estabelecimentoId}`);
      console.log('🗑️ Cache invalidado após criar categoria');

      res.status(201).json({
        success: true,
        message: 'Categoria cadastrada com sucesso',
        data: novaCategoria
      });

    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Listar categorias por estabelecimento (com cache inteligente)
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;
      const cacheKey = `categorias:${estabelecimento_id}`;

      // 🔹 1. Verificar se existem dados no cache
      const cachedData = await getFromCache(cacheKey);
      
      if (cachedData) {
        // ✅ Retorna dados do cache IMEDIATAMENTE (0s de delay)
        console.log('⚡ Categorias carregadas do cache instantaneamente');
        res.status(200).json({
          success: true,
          data: cachedData,
          fromCache: true
        });

        // 🔄 ENQUANTO ISSO: Busca dados atualizados do banco em background
        atualizarCacheEmBackground(estabelecimento_id, cacheKey);
        return;
      }

      // 📭 Cache MISS: Buscar do banco e salvar no cache
      console.log('🔄 Cache MISS - Buscando categorias do banco de dados');
      const categorias = await buscarCategoriasDoBanco(estabelecimento_id);
      
      // Salvar no cache com TTL de 3 segundos
      await setToCache(cacheKey, categorias, 3);

      res.status(200).json({
        success: true,
        data: categorias,
        fromCache: false
      });

    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },


  // Editar categoria
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      // Cloudinary retorna a URL completa em req.file.path
      const imagemUrl = req.file ? req.file.path : null;

      // Validação dos campos obrigatórios
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório'
        });
      }

      // Verificar se a categoria existe e obter estabelecimento_id
      const categoriaCheck = await pool.query(
        'SELECT id, nome, imagem_url, estabelecimento_id FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const estabelecimentoId = categoriaCheck.rows[0].estabelecimento_id;

      // Preparar query de atualização
      let query, values;
      
      if (imagemUrl) {
        // Atualizar nome e imagem
        query = `
          UPDATE categorias 
          SET nome = $1, imagem_url = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING id, nome, imagem_url, status, updated_at
        `;
        values = [nome.trim(), imagemUrl, id];
      } else {
        // Atualizar apenas o nome
        query = `
          UPDATE categorias 
          SET nome = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, nome, imagem_url, status, updated_at
        `;
        values = [nome.trim(), id];
      }

      const result = await pool.query(query, values);
      const categoriaAtualizada = result.rows[0];

      // 🗑️ Invalidar cache após editar categoria
      await invalidateCache(`categorias:${estabelecimentoId}`);
      console.log('🗑️ Cache invalidado após editar categoria');

      res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: categoriaAtualizada
      });

    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Deletar categoria
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a categoria existe e obter estabelecimento_id
      const categoriaCheck = await pool.query(
        'SELECT id, nome, imagem_url, estabelecimento_id FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const categoria = categoriaCheck.rows[0];
      const estabelecimentoId = categoria.estabelecimento_id;

      // Deletar a categoria do banco
      await pool.query('DELETE FROM categorias WHERE id = $1', [id]);

      // 🗑️ Invalidar cache após deletar categoria
      await invalidateCache(`categorias:${estabelecimentoId}`);
      console.log('🗑️ Cache invalidado após deletar categoria');

      res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso',
        data: {
          id: categoria.id,
          nome: categoria.nome
        }
      });

    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Alterar status da categoria
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;

      // Verificar se a categoria existe e obter estabelecimento_id
      const categoriaCheck = await pool.query(
        'SELECT id, nome, status, estabelecimento_id FROM categorias WHERE id = $1',
        [id]
      );

      if (categoriaCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const categoria = categoriaCheck.rows[0];
      const estabelecimentoId = categoria.estabelecimento_id;
      const novoStatus = !categoria.status;

      // Atualizar status da categoria
      const query = `
        UPDATE categorias 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, status, updated_at
      `;

      const result = await pool.query(query, [novoStatus, id]);
      const categoriaAtualizada = result.rows[0];

      // 🗑️ Invalidar cache após alterar status
      await invalidateCache(`categorias:${estabelecimentoId}`);
      console.log('🗑️ Cache invalidado após alterar status da categoria');

      res.status(200).json({
        success: true,
        message: `Categoria ${novoStatus ? 'ativada' : 'desativada'} com sucesso`,
        data: categoriaAtualizada
      });

    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default categoriasController;

