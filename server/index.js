import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import authRoutes from './routes/AuthRoute.js';

// Carrega variáveis de ambiente para desenvolvimento
dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = 3002;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://filazeroapp.online',
    'https://filazero-sistema-de-gestao.onrender.com'
  ], // Frontend local e produção
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

// Rota para proxy de imagens (evitar CORS)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL parameter is required' 
      });
    }

    // Validar se é uma URL válida
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid URL' 
      });
    }

    // Fazer requisição para a imagem
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        message: 'Failed to fetch image' 
      });
    }

    // Definir headers apropriados
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

    // Pipe da resposta
    response.body.pipe(res);
  } catch (error) {
    console.error('Erro ao fazer proxy da imagem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
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