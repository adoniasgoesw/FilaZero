// server/routes/AuthRoutes.js
import express from 'express';
import { upload, handleMulterError, validateUpload } from '../middlewares/uploadMiddleware.js';

import { login } from '../controllers/login.js';
import { getUserProfile } from '../controllers/user.js';
import {
  criarCategoria,
  buscarCategoriasPorEstabelecimento,
  atualizarCategoria,
  atualizarStatusCategoria,
  deletarCategoria
} from '../controllers/categorias.js';

const router = express.Router();

// Rota de login
router.post('/login', login);

// Rota para buscar perfil do usuário
router.get('/user/:userId/:estabelecimentoId', getUserProfile);

// Rotas de Categorias com middleware de upload robusto
router.post('/categorias', upload.single('imagem'), handleMulterError, validateUpload, criarCategoria);
router.get('/categorias/estabelecimento/:estabelecimento_id', buscarCategoriasPorEstabelecimento);
router.put('/categorias/:id', upload.single('imagem'), handleMulterError, validateUpload, atualizarCategoria);
router.put('/categorias/:id/status', atualizarStatusCategoria);
router.delete('/categorias/:id', deletarCategoria);

export default router;
