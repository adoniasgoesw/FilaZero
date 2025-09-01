import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import authRoutes from './routes/AuthRoute.js';

// Carrega variáveis de ambiente para desenvolvimento
dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend local
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Todas as rotas (auth + categorias) em um único arquivo
app.use('/api', authRoutes);

// Rota de teste de conexão com o banco
app.get('/api/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'Conexão com banco de dados estabelecida com sucesso!',
        timestamp: new Date().toISOString(),
        environment: 'development'
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
      error: error.message 
    });
  }
});

// Rota de status da API
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API FilaZero funcionando!',
    environment: 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FilaZero Backend - Ambiente de Desenvolvimento',
    environment: 'development',
    database: 'Neon Database',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
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
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌍 Ambiente: Desenvolvimento`);
  console.log(`📊 Testando conexão com banco de dados...`);
  
  // Testa conexão com banco ao iniciar
  await testConnection();
});

export default app;
