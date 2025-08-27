// server/index.js - Servidor de Desenvolvimento/Teste
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
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://filazero.netlify.app',
    'https://filazero-sistema-de-gestao.netlify.app'
  ],
  credentials: true
}));

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

// Teste de conexão com o banco
const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Tentando conectar ao banco...');
    console.log('🌐 URL do banco:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    console.log('🎯 Conexão estabelecida com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco:', err.message);
    console.error('🔍 Detalhes do erro:', err);
    console.error('🔍 Verifique se a DATABASE_URL está correta no arquivo .env');
    console.error('🔍 Verifique se o banco Neon.tech está acessível');
  }
};

testDatabaseConnection();



// Rotas
app.use('/api', AuthRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Erro genérico
  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;
  
  res.status(statusCode).json({ 
    success: false, 
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor de desenvolvimento
app.listen(PORT, () => {
  console.log(`🚀 Servidor de DESENVOLVIMENTO rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
  console.log(`📁 Pasta de uploads: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔧 Modo desenvolvimento/teste ativado`);
  console.log(`🎯 Para testar: http://localhost:${PORT}/api/health`);
});
