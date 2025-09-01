import express from 'express';
import categoriasController from '../controllers/categorias.js';
import loginController from '../controllers/login.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Rota para cadastrar categoria (requer autenticação)
router.post('/categorias', loginController.verificarToken, upload.single('imagem'), categoriasController.cadastrar);

// Rota para listar categorias por estabelecimento
router.get('/categorias/:estabelecimento_id', categoriasController.listarPorEstabelecimento);

export default router;
