import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple status route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 FilaZero Backend - Ambiente de Produção',
    environment: 'production',
    timestamp: new Date().toISOString(),
    status: 'running'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API FilaZero funcionando!',
    environment: 'production',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor de produção rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: Produção`);
  console.log(`✅ Servidor iniciado com sucesso!`);
});

export default app;
