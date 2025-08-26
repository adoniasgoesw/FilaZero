// server/server.js - Servidor de Produção
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
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
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'User-Agent'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Configurar pasta de uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Garantir que a pasta uploads existe
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('✅ Pasta uploads criada');
}

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
  console.error('URL da requisição:', req.originalUrl);
  console.error('Método:', req.method);
  console.error('Headers:', req.headers);
  console.error('User-Agent:', req.get('User-Agent'));
  
  // Log detalhado para debug em produção
  console.error('Erro completo:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    statusCode: err.statusCode
  });
  
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
  console.log(`📁 Pasta de uploads: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔒 CORS configurado para produção`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'production'}`);
});
