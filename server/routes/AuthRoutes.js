// server/routes/AuthRoutes.js
import express from 'express';

import { login } from '../controllers/login.js';
import { getUserProfile } from '../controllers/user.js';
import {
  criarCategoria,
  buscarCategoriasPorEstabelecimento,
  deletarCategoria
} from '../controllers/categorias.js';


const router = express.Router();

// Rota de login
router.post('/login', login);

// Rota para buscar perfil do usuário
router.get('/user/:userId/:estabelecimentoId', getUserProfile);

// Rotas de Categorias
router.post('/categorias', criarCategoria);
router.get('/categorias/estabelecimento/:estabelecimento_id', buscarCategoriasPorEstabelecimento);
router.delete('/categorias/:id', deletarCategoria);





export default router;
