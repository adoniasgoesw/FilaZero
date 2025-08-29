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
import { 
  criarComplemento, 
  buscarComplementosPorEstabelecimento, 
  atualizarComplemento, 
  atualizarStatusComplemento, 
  deletarComplemento 
} from '../controllers/complementos.js';
import { 
  criarCategoriaComplemento, 
  listarCategoriasPorProduto, 
  atualizarCategoriaComplemento,
  atualizarStatusCategoriaComplemento,
  deletarCategoriaComplemento,
  atualizarProdutoIdCategorias
} from '../controllers/categoriaComplementos.js';
import {
  buscarPerfilUsuario,
  atualizarPerfilUsuario,
  buscarUsuariosPorEstabelecimento,
  atualizarStatusUsuario
} from '../controllers/user.js';
import { upload, handleMulterError, validateUpload, uploadToCloudinary } from '../middlewares/uploadMiddleware.js';
import { 
  cacheRoute, 
  invalidateCache, 
  cacheListings, 
  clearCache, 
  getCacheStats 
} from '../middlewares/cacheMiddleware.js';

const router = express.Router();

// Rota de login
router.post('/login', login);

// Rotas de usuário
router.get('/usuarios/:userId/perfil', 
  cacheRoute('user:profile', 600), // Cache de 10 minutos
  buscarPerfilUsuario
);

router.put('/usuarios/:userId/perfil', 
  invalidateCache(['user:profile']), // Invalidar cache do perfil
  atualizarPerfilUsuario
);

router.get('/usuarios/estabelecimento/:estabelecimento_id', 
  cacheListings('users', 300), // Cache de 5 minutos
  buscarUsuariosPorEstabelecimento
);

router.put('/usuarios/:userId/status', 
  invalidateCache(['user:profile', 'users']), // Invalidar caches relacionados
  atualizarStatusUsuario
);

// Rotas de categorias
router.get('/categorias/estabelecimento/:estabelecimento_id', 
  cacheListings('categorias', 600), // Cache de 10 minutos
  buscarCategoriasPorEstabelecimento
);

router.post('/categorias', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['categorias']), // Invalidar cache de categorias
  criarCategoria
);

router.put('/categorias/:id', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['categorias']), // Invalidar cache de categorias
  atualizarCategoria
);

router.put('/categorias/:id/status', 
  invalidateCache(['categorias']), // Invalidar cache de categorias
  atualizarStatusCategoria
);

router.delete('/categorias/:id', 
  invalidateCache(['categorias']), // Invalidar cache de categorias
  deletarCategoria
);

// Rotas de produtos
router.get('/produtos/estabelecimento/:estabelecimento_id', 
  cacheListings('produtos', 600), // Cache de 10 minutos
  buscarProdutosPorEstabelecimento
);

router.post('/produtos', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['produtos']), // Invalidar cache de produtos
  criarProduto
);

router.put('/produtos/:id', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['produtos']), // Invalidar cache de produtos
  atualizarProduto
);

router.put('/produtos/:id/status', 
  invalidateCache(['produtos']), // Invalidar cache de produtos
  atualizarStatusProduto
);

router.delete('/produtos/:id', 
  invalidateCache(['produtos']), // Invalidar cache de produtos
  deletarProduto
);

// Rotas de complementos
router.get('/complementos/estabelecimento/:estabelecimento_id', 
  cacheListings('complementos', 600), // Cache de 10 minutos
  buscarComplementosPorEstabelecimento
);

router.post('/complementos', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['complementos']), // Invalidar cache de complementos
  criarComplemento
);

router.put('/complementos/:id', 
  upload.single('imagem'), 
  handleMulterError, 
  uploadToCloudinary, 
  validateUpload, 
  invalidateCache(['complementos']), // Invalidar cache de complementos
  atualizarComplemento
);

router.put('/complementos/:id/status', 
  invalidateCache(['complementos']), // Invalidar cache de complementos
  atualizarStatusComplemento
);

router.delete('/complementos/:id', 
  invalidateCache(['complementos']), // Invalidar cache de complementos
  deletarComplemento
);

// Rotas de categorias de complementos
router.post('/categorias-complementos', 
  invalidateCache(['categorias-complementos']), // Invalidar cache
  criarCategoriaComplemento
);

router.get('/categorias-complementos/produto/:produtoId', 
  cacheRoute('categorias-complementos', 300), // Cache de 5 minutos
  listarCategoriasPorProduto
);

router.put('/categorias-complementos/atualizar-produto-id', 
  invalidateCache(['categorias-complementos', 'produtos']), // Invalidar cache relacionado
  atualizarProdutoIdCategorias
);

router.put('/categorias-complementos/:id', 
  invalidateCache(['categorias-complementos']), // Invalidar cache
  atualizarCategoriaComplemento
);

router.put('/categorias-complementos/:id/status', 
  invalidateCache(['categorias-complementos']), // Invalidar cache
  atualizarStatusCategoriaComplemento
);

router.delete('/categorias-complementos/:id', 
  invalidateCache(['categorias-complementos']), // Invalidar cache
  deletarCategoriaComplemento
);

// Rotas de administração do cache
router.post('/cache/clear', clearCache); // Limpar todo o cache
router.get('/cache/stats', getCacheStats); // Estatísticas do cache

export default router;
