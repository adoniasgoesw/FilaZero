// server/config/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const { Pool } = pkg;

// Verificar se a DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida no arquivo .env');
}

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000,
  // Forçar uso da URL fornecida
  host: undefined,
  port: undefined,
  database: undefined,
  user: undefined,
  password: undefined
});

// Log da configuração
console.log('🔧 Configuração do banco carregada');
console.log('🌐 DATABASE_URL completa:', process.env.DATABASE_URL);
console.log('🌐 Host extraído:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Não definido');
console.log('🔧 Pool configurado com connectionString');

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

export default pool;
