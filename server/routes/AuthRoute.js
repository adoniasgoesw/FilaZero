import express from 'express';
import loginController from '../controllers/login.js';
import categoriasController from '../controllers/categorias.js';
import produtosController from '../controllers/produtos.js';
import upload from '../middlewares/cloudinaryUpload.js';
import pontosConfigController from '../controllers/pontosConfig.js';
import fetch from 'node-fetch';
import * as atendimentosController from '../controllers/atendimentos.js';
import * as pedidosController from '../controllers/pedidos.js';

const router = express.Router();

// ===== ROTAS DE AUTENTICAÇÃO =====
// Rota de login
router.post('/login', loginController.login);

// Rota para obter dados do usuário logado (requer autenticação)
router.get('/usuario', loginController.verificarToken, loginController.getUsuarioLogado);

// ===== ROTAS DE CATEGORIAS =====
// Rota para cadastrar categoria (requer autenticação)
router.post('/categorias', loginController.verificarToken, upload.single('imagem'), categoriasController.cadastrar);

// Rota para listar categorias por estabelecimento (para dropdown de produtos) - DEVE VIR ANTES da rota genérica
router.get('/categorias-dropdown/:estabelecimento_id', produtosController.listarCategorias);

// Rota para listar categorias por estabelecimento
router.get('/categorias/:estabelecimento_id', categoriasController.listarPorEstabelecimento);

// Rota para editar categoria (requer autenticação)
router.put('/categorias/:id', loginController.verificarToken, upload.single('imagem'), categoriasController.editar);

// Rota para deletar categoria (requer autenticação)
router.delete('/categorias/:id', loginController.verificarToken, categoriasController.deletar);

// Rota para alterar status da categoria (requer autenticação)
router.put('/categorias/:id/status', loginController.verificarToken, categoriasController.alterarStatus);

// ===== ROTAS DE PRODUTOS =====
// Rota para listar produtos por estabelecimento
router.get('/produtos/:estabelecimento_id', produtosController.listarPorEstabelecimento);

// Rota para cadastrar produto (requer autenticação)
router.post('/produtos', loginController.verificarToken, upload.single('imagem'), produtosController.cadastrar);

// Rota para editar produto (requer autenticação)
router.put('/produtos/:id', loginController.verificarToken, upload.single('imagem'), produtosController.editar);

// Rota para deletar produto (requer autenticação)
router.delete('/produtos/:id', loginController.verificarToken, produtosController.deletar);

// Rota para alterar status do produto (requer autenticação)
router.put('/produtos/:id/status', loginController.verificarToken, produtosController.alterarStatus);

// ===== ROTAS DE CONFIGURAÇÃO DE PONTOS DE ATENDIMENTO =====
// Obter configuração por estabelecimento
router.get('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.getConfig);

// Criar configuração (com defaults) caso não exista
router.post('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.createOrEnsureDefaults);

// Atualizar configuração
router.put('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.updateConfig);

// Deletar configuração (opcional)
router.delete('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.deleteConfig);

// Listar pontos com base na configuração
router.get('/pontos-atendimento/:estabelecimento_id', loginController.verificarToken, pontosConfigController.listPoints);

// ===== ROTAS DE ATENDIMENTOS =====
// Tornar ensure e setStatus públicos para permitir salvar sem login no PDV
router.post('/atendimentos/ensure/:estabelecimento_id/:identificador', atendimentosController.ensureAtendimento);
router.put('/atendimentos/:estabelecimento_id/:identificador/nome', loginController.verificarToken, atendimentosController.updateNomePonto);
router.patch('/atendimentos/:estabelecimento_id/:identificador/nome', loginController.verificarToken, atendimentosController.updateNomePonto);
router.get('/atendimentos/:estabelecimento_id/:identificador/status', atendimentosController.getStatus);
router.put('/atendimentos/:estabelecimento_id/:identificador/status', atendimentosController.setStatus);

// ===== ROTAS DE PEDIDOS =====
// Tornar rotas de pedidos públicas para permitir uso sem autenticação no PDV
router.put('/pedidos/:estabelecimento_id/:identificador', pedidosController.upsertPedido);
router.get('/pedidos/:estabelecimento_id/:identificador', pedidosController.getPedido);
router.delete('/pedidos/itens/:item_id', pedidosController.deleteItem);
router.delete('/pedidos/:estabelecimento_id/:identificador', pedidosController.deletePedido);

// Complementos dos itens do pedido
router.post('/pedidos/itens/:item_pedido_id/complementos', pedidosController.addItemComplementos);
router.get('/pedidos/itens/:item_pedido_id/complementos', pedidosController.listItemComplementos);

// ===== ROTAS DE CATEGORIAS DE COMPLEMENTOS =====
// Rota para cadastrar categoria de complementos (requer autenticação)
router.post('/categorias-complementos', loginController.verificarToken, produtosController.cadastrarCategoriaComplemento);

// Rota para listar categorias de complementos por produto
router.get('/categorias-complementos/:produto_id', produtosController.listarCategoriasComplementos);

// Rota para editar categoria de complementos (requer autenticação)
router.put('/categorias-complementos/:id', loginController.verificarToken, produtosController.editarCategoriaComplemento);

// Rota para deletar categoria de complementos (requer autenticação)
router.delete('/categorias-complementos/:id', loginController.verificarToken, produtosController.deletarCategoriaComplemento);

// ===== ROTAS DE COMPLEMENTOS =====
// Rota para cadastrar complemento (requer autenticação)
router.post('/complementos', loginController.verificarToken, produtosController.cadastrarComplemento);

// Rota para listar complementos por estabelecimento
router.get('/complementos/:estabelecimento_id', produtosController.listarComplementos);

// Rota para editar complemento (requer autenticação)
router.put('/complementos/:id', loginController.verificarToken, produtosController.editarComplemento);

// Rota para deletar complemento (requer autenticação)
router.delete('/complementos/:id', loginController.verificarToken, produtosController.deletarComplemento);

// ===== ROTAS DE ITENS COMPLEMENTOS =====
// Rota para salvar complementos em uma categoria
router.post('/itens-complementos', loginController.verificarToken, produtosController.salvarItensComplementos);

// Rota para listar complementos de uma categoria
router.get('/itens-complementos/categoria/:categoria_id', produtosController.listarItensComplementos);

// Rota para deletar um item complemento específico
router.delete('/itens-complementos/:id', loginController.verificarToken, produtosController.deletarItemComplemento);

// ===== ROTA PARA BUSCAR IMAGENS =====
// Rota para buscar sugestões de imagens via Google Custom Search
router.get('/buscar-imagens', async (req, res) => {
  try {
    const query = req.query.q; // palavra-chave do usuário
    
    if (!query || query.trim().length < 2) {
      return res.json({ 
        success: true, 
        imagens: [] 
      });
    }

    const API_KEY = "AIzaSyA6zCjMUOSZJ5ZIB3yjAOxboCMxz7R-H_Q";
    const CSE_ID = "859f0f1be01a14e3c";

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query.trim())}&cx=${CSE_ID}&searchType=image&num=10&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Erro da API do Google:', data.error);
      return res.status(500).json({ 
        success: false, 
        error: "Erro ao buscar imagens" 
      });
    }

    const imagens = data.items?.map(item => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title || '',
      context: item.image?.contextLink || ''
    })) || [];

    res.json({ 
      success: true, 
      imagens 
    });

  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno ao buscar imagens" 
    });
  }
});

// ===== ROTA PARA PROXY DE IMAGENS =====
// Rota para servir imagens através de proxy (evita problemas de CORS)
router.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        error: "URL da imagem é obrigatória" 
      });
    }

    // Fazer fetch da imagem
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return res.status(404).json({ 
        success: false, 
        error: "Imagem não encontrada" 
      });
    }

    // Obter o tipo de conteúdo da imagem
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Definir headers para cache e CORS
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Pipe da resposta da imagem para o cliente
    response.body.pipe(res);

  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno ao carregar imagem" 
    });
  }
});

export default router;
