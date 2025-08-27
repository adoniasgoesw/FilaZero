// server/routes/AuthRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';

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

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'categoria-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Rota de login
router.post('/login', login);

// Rota para buscar perfil do usuário
router.get('/user/:userId/:estabelecimentoId', getUserProfile);

// Rotas de Categorias
router.post('/categorias', upload.single('imagem'), criarCategoria);
router.get('/categorias/estabelecimento/:estabelecimento_id', buscarCategoriasPorEstabelecimento);
router.put('/categorias/:id', upload.single('imagem'), atualizarCategoria);
router.put('/categorias/:id/status', atualizarStatusCategoria);
router.delete('/categorias/:id', deletarCategoria);





export default router;
