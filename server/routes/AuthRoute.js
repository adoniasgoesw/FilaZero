import express from 'express';
import loginController from '../controllers/login.js';
import categoriasController from '../controllers/categorias.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// ===== ROTAS DE AUTENTICAÇÃO =====
// Rota de login
router.post('/login', loginController.login);

// Rota para obter dados do usuário logado (requer autenticação)
router.get('/usuario', loginController.verificarToken, loginController.getUsuarioLogado);

// ===== ROTAS DE CATEGORIAS =====
// Rota para cadastrar categoria (requer autenticação)
router.post('/categorias', loginController.verificarToken, upload.single('imagem'), categoriasController.cadastrar);

// Rota para listar categorias por estabelecimento
router.get('/categorias/:estabelecimento_id', categoriasController.listarPorEstabelecimento);

// Rota para editar categoria (requer autenticação)
router.put('/categorias/:id', loginController.verificarToken, upload.single('imagem'), categoriasController.editar);

// Rota para deletar categoria (requer autenticação)
router.delete('/categorias/:id', loginController.verificarToken, categoriasController.deletar);

export default router;
