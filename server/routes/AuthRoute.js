import express from 'express';
import loginController from '../controllers/login.js';
import categoriasController from '../controllers/categorias.js';
import produtosController from '../controllers/produtos.js';
import upload from '../middlewares/cloudinaryUpload.js';
import fetch from 'node-fetch';

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

export default router;
