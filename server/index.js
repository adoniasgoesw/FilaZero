// server/index.js - Servidor de Desenvolvimento/Teste
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import AuthRoutes from './routes/AuthRoutes.js';
import pool from './config/db.js';
import { initializeUploads } from './init-uploads.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middlewares
app.use(cors({
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
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar pasta de uploads para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rota específica para servir imagens de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Configurar headers para imagens
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/' + path.split('.').pop());
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
    }
  }
});

// Rota adicional para debug de uploads
app.get('/api/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log('🔍 Tentando servir arquivo:', filename);
  console.log('📍 Caminho completo:', filePath);
  
  // Verificar se arquivo existe
  if (fs.existsSync(filePath)) {
    console.log('✅ Arquivo encontrado, servindo...');
    res.sendFile(filePath);
  } else {
    console.log('❌ Arquivo não encontrado');
    res.status(404).json({
      success: false,
      message: 'Arquivo não encontrado',
      filename: filename,
      path: filePath
    });
  }
});

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

// Teste de conexão com o banco e inicialização de uploads
const initializeServices = async () => {
  try {
    // Inicializar pasta de uploads
    console.log('📁 Inicializando serviços...');
    const uploadsPath = initializeUploads();
    console.log('✅ Pasta de uploads inicializada:', uploadsPath);
    
    // Testar conexão com o banco
    console.log('🔍 Tentando conectar ao banco...');
    console.log('🌐 URL do banco:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    console.log('🎯 Conexão estabelecida com sucesso!');
    
    console.log('✅ Todos os serviços inicializados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao inicializar serviços:', err.message);
    console.error('🔍 Detalhes do erro:', err);
    if (err.message.includes('uploads')) {
      console.error('🔍 Problema com pasta de uploads - verifique permissões');
    } else {
      console.error('🔍 Verifique se a DATABASE_URL está correta no arquivo .env');
      console.error('🔍 Verifique se o banco Neon.tech está acessível');
    }
  }
};

initializeServices();

// Rotas
app.use('/api', AuthRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Rota para página de teste de imagens
app.get('/test-images', (req, res) => {
  const testHtmlPath = path.join(__dirname, 'test-images.html');
  if (fs.existsSync(testHtmlPath)) {
    res.sendFile(testHtmlPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Página de teste não encontrada'
    });
  }
});

// Rota para testar construção de URLs
app.get('/api/test-urls', (req, res) => {
  try {
    const { buildImageUrl } = await import('./config/images.js');
    
    // Simular diferentes cenários
    const testCases = [
      '/uploads/categoria-123.jpg',
      'https://exemplo.com/imagem.jpg',
      null
    ];
    
    const results = testCases.map(imagePath => {
      try {
        const url = buildImageUrl(imagePath, req);
        return { imagePath, result: url, success: true };
      } catch (error) {
        return { imagePath, result: error.message, success: false };
      }
    });
    
    res.json({
      success: true,
      message: 'Teste de URLs executado',
      results,
      requestInfo: {
        host: req.get('host'),
        userAgent: req.get('User-Agent'),
        protocol: req.protocol
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar URLs',
      error: error.message
    });
  }
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
