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
  origin: NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://filazero.com'
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar pasta de uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de segurança para produção
if (NODE_ENV === 'production') {
  // Rate limiting
  app.use((req, res, next) => {
    // Implementar rate limiting aqui se necessário
    next();
  });
  
  // Headers de segurança
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
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
  
  // Se for erro do Multer (upload de arquivo)
  if (err instanceof multer.MulterError) {
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
  }
  
  // Se for erro de validação de arquivo
  if (err.message === 'Apenas imagens são permitidas!') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
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
