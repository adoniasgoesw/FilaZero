// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AuthRoutes from './routes/AuthRoutes.js';
import pool from './config/db.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

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
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
});
