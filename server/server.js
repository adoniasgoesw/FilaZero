// server/server.js - Servidor de Produção
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AuthRoutes from './routes/AuthRoutes.js';
import pool from './config/db.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS para produção
const corsOptions = {
  origin: [
    'https://filazero.netlify.app',
    'https://filazero-sistema-de-gestao.onrender.com',
    'http://localhost:5173', // Para desenvolvimento local
    'http://localhost:3000'  // Para desenvolvimento local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar pasta de uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Headers de segurança
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Teste de conexão com o banco
const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Tentando conectar ao banco de produção...');
    console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    console.log('🎯 Conexão de produção estabelecida com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco de produção:', err.message);
    console.error('🔍 Detalhes do erro:', err);
    console.error('🔍 Verifique se a DATABASE_URL está correta no arquivo .env');
    console.error('🔍 Verifique se o banco Neon.tech está acessível');
  }
};

testDatabaseConnection();

// Rotas
app.use('/api', AuthRoutes);

// Rota de teste de produção
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API de produção funcionando!', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });
});

// Rota raiz para verificar se está funcionando
app.get('/', (req, res) => {
  res.json({
    message: 'FilaZero API de Produção',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      login: '/api/login'
    }
  });
});

// Middleware de erro para produção
app.use((err, req, res, next) => {
  console.error('Erro de produção:', err);
  
  // Se for erro do Multer (upload de arquivo)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 5MB'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de arquivo inesperado'
    });
  }
  
  // Se for erro de validação de arquivo
  if (err.message === 'Apenas imagens são permitidas!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Não expor detalhes internos em produção
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor de produção
app.listen(PORT, () => {
  console.log(`🚀 Servidor de PRODUÇÃO rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: https://filazero-sistema-de-gestao.onrender.com/api`);
  console.log(`🌐 Frontend: https://filazero.netlify.app`);
  console.log(`🔒 CORS configurado para produção`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'production'}`);
});
