import express from 'express';

const router = express.Router();

// ===== ROTAS DE AUTENTICAÇÃO =====
// Rota de login (placeholder)
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint - Implementação pendente',
    timestamp: new Date().toISOString()
  });
});

// Rota para obter dados do usuário logado (placeholder)
router.get('/usuario', (req, res) => {
  res.json({
    success: true,
    message: 'Usuario endpoint - Implementação pendente',
    timestamp: new Date().toISOString()
  });
});

// ===== ROTAS DE CATEGORIAS =====
// Rota para cadastrar categoria (placeholder)
router.post('/categorias', (req, res) => {
  res.json({
    success: true,
    message: 'Categorias endpoint - Implementação pendente',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar categorias por estabelecimento (placeholder)
router.get('/categorias/:estabelecimento_id', (req, res) => {
  res.json({
    success: true,
    message: 'Listar categorias endpoint - Implementação pendente',
    timestamp: new Date().toISOString(),
    estabelecimento_id: req.params.estabelecimento_id
  });
});

export default router;
