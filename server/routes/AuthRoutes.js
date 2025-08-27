// server/routes/AuthRoutes.js
import express from 'express';
import { login } from '../controllers/login.js';
import { 
  criarCategoria, 
  buscarCategoriasPorEstabelecimento, 
  atualizarCategoria, 
  atualizarStatusCategoria, 
  deletarCategoria 
} from '../controllers/categorias.js';
import { 
  criarProduto, 
  buscarProdutosPorEstabelecimento, 
  atualizarProduto, 
  atualizarStatusProduto, 
  deletarProduto 
} from '../controllers/produtos.js';
import { upload, handleMulterError, validateUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Rota de login
router.post('/login', login);

// Rotas de categorias
router.get('/categorias/estabelecimento/:estabelecimento_id', buscarCategoriasPorEstabelecimento);
router.post('/categorias', upload.single('imagem'), handleMulterError, validateUpload, criarCategoria);
router.put('/categorias/:id', upload.single('imagem'), handleMulterError, validateUpload, atualizarCategoria);
router.put('/categorias/:id/status', atualizarStatusCategoria);
router.delete('/categorias/:id', deletarCategoria);

// Rotas de produtos
router.get('/produtos/estabelecimento/:estabelecimento_id', buscarProdutosPorEstabelecimento);
router.post('/produtos', upload.single('imagem'), handleMulterError, validateUpload, criarProduto);
router.put('/produtos/:id', upload.single('imagem'), handleMulterError, validateUpload, atualizarProduto);
router.put('/produtos/:id/status', atualizarStatusProduto);
router.delete('/produtos/:id', deletarProduto);

export default router;
