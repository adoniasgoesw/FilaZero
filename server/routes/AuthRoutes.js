// server/routes/AuthRoutes.js
import express from 'express';
import { login } from '../controllers/login.js';
import { getUserProfile } from '../controllers/user.js';
import {
  criarCategoria,
  buscarCategoriasPorEstabelecimento,
  buscarCategoriaPorId,
  atualizarCategoria,
  deletarCategoria
} from '../controllers/categorias.js';
import { uploadMiddleware } from '../config/upload.js';

const router = express.Router();

// Rota de login
router.post('/login', login);

// Rota para buscar perfil do usuário
router.get('/user/:userId/:estabelecimentoId', getUserProfile);

// Rotas de Categorias
router.post('/categorias', uploadMiddleware('imagem'), criarCategoria);
router.get('/categorias/estabelecimento/:estabelecimento_id', buscarCategoriasPorEstabelecimento);
router.put('/categorias/:id/status', atualizarCategoria); // Rota para alterar apenas status (DEVE VIR ANTES)
router.get('/categorias/:id', buscarCategoriaPorId);
router.put('/categorias/:id', uploadMiddleware('imagem'), atualizarCategoria);
router.delete('/categorias/:id', deletarCategoria);

export default router;
