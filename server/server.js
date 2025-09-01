import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import authRoutes from './routes/authroutes.js';
import categoriasRoutes from './routes/categoriasroutes.js';

// Carrega variáveis de ambiente para produção
dotenv.config({ path: '.env.prod' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: [
    'https://filazero.netlify.app', // Frontend produção
    'https://filazero-sistema-de-gestao.onrender.com', // Backend produção
    process.env.FRONTEND_URL // URL dinâmica do frontend
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rotas de autenticação
app.use('/api', authRoutes);

// Rotas de categorias
app.use('/api', categoriasRoutes);

// Middleware de logging para produção
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de teste de conexão com o banco
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'Conexão com banco de dados estabelecida com sucesso!',
        timestamp: new Date().toISOString(),
        environment: 'production',
        database: 'Neon Database'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Falha na conexão com banco de dados' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao testar conexão', 
      error: process.env.NODE_ENV === 'production' ? 'Erro interno' : error.message 
    });
  }
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API FilaZero funcionando!',
    environment: 'production',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'Neon Database'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FilaZero Backend - Ambiente de Produção',
    environment: 'production',
    database: 'Neon Database',
    frontend: 'https://filazero.netlify.app',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros para produção
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? 'Erro interno' : err.message
  });
});

// Rota para páginas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Inicialização do servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor de produção rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: Produção`);
  console.log(`🌐 Frontend: https://filazero.netlify.app`);
  console.log(`📊 Testando conexão com banco de dados...`);
  
  // Testa conexão com banco ao iniciar
  await testConnection();
});

export default app;
