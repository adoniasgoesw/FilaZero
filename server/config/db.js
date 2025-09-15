import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Ajustes para ambientes serverless (ex.: Neon)
  max: 10, // limitar conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // aumentar timeout de conexão
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados Neon');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Teste de conexão bem-sucedido:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};

// Função para executar queries
// Pequeno utilitário de retry para erros transitórios de conexão
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetryableError = (err) => {
  if (!err) return false;
  const code = err.code || '';
  const msg = String(err.message || '').toLowerCase();
  return (
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    msg.includes('connection terminated') ||
    msg.includes('timeout') ||
    msg.includes('terminado inesperadamente')
  );
};

// Envolve pool.query com retry leve (3 tentativas)
const rawQuery = pool.query.bind(pool);
pool.query = async (text, params) => {
  let attempt = 0;
  let lastErr;
  while (attempt < 3) {
    try {
      return await rawQuery(text, params);
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err)) throw err;
      attempt += 1;
      const backoff = 200 * attempt;
      await sleep(backoff);
    }
  }
  throw lastErr;
};

export const query = (text, params) => pool.query(text, params);

// Função para obter cliente do pool
export const getClient = () => pool.connect();

export default pool;



















