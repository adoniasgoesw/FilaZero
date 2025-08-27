// server/server.js - Servidor de Produção
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Multer movido para middleware dedicado
import AuthRoutes from './routes/AuthRoutes.js';
import pool from './config/db.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS para produção
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (como mobile apps)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://filazero.netlify.app',
      'https://filazero-sistema-de-gestao.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 Origin bloqueada:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'User-Agent',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middlewares
app.use(cors(corsOptions));

// Middleware adicional para CORS (backup)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://filazero.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuração do Multer movida para middleware dedicado
// para evitar conflitos com as rotas

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar pasta de uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('📁 Servindo arquivos estáticos de:', uploadsPath);

// Garantir que a pasta uploads existe
import fs from 'fs';
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Pasta uploads criada:', uploadsPath);
} else {
  console.log('✅ Pasta uploads já existe:', uploadsPath);
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
    console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não está configurada!');
      return;
    }
    
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
      allowedOrigins: ['https://filazero.netlify.app', 'https://filazero-sistema-de-gestao.onrender.com'],
      credentials: true
    },
    headers: req.headers,
    origin: req.get('Origin')
  });
});

// Rota específica para testar categorias
app.post('/api/categorias/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de categorias funcionando',
    timestamp: new Date().toISOString(),
    body: req.body,
    headers: req.headers
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
  console.error('Origin:', req.get('Origin'));
  
  // Se for erro de CORS
  if (err.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado pelo CORS',
      origin: req.get('Origin'),
      allowedOrigins: ['https://filazero.netlify.app', 'https://filazero-sistema-de-gestao.onrender.com']
    });
  }
  
  // Tratar erro específico "Unexpected end of form"
  if (err.message === 'Unexpected end of form') {
    return res.status(400).json({
      success: false,
      message: 'Erro no envio do formulário. Verifique se todos os campos estão preenchidos corretamente e tente novamente.'
    });
  }
  
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
