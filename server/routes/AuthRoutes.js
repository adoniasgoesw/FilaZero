import express from 'express';
import loginController from '../controllers/login.js';

const router = express.Router();

// Rota de login
router.post('/login', loginController.login);

// Rota para obter dados do usuário logado (requer autenticação)
router.get('/usuario', loginController.verificarToken, loginController.getUsuarioLogado);

export default router;
