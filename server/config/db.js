import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Ajustes para ambientes serverless (ex.: Neon)
  max: 5, // reduzir conexões simultâneas para evitar timeouts
  min: 0, // não manter conexões mínimas
  idleTimeoutMillis: 10000, // reduzir tempo de idle
  connectionTimeoutMillis: 20000, // aumentar timeout de conexão
  acquireTimeoutMillis: 20000, // timeout para adquirir conexão
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Configurações adicionais para estabilidade
  allowExitOnIdle: true,
  statement_timeout: 30000, // 30 segundos para queries
  query_timeout: 30000, // 30 segundos para queries
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

// Envolve pool.query com retry mais robusto (5 tentativas)
const rawQuery = pool.query.bind(pool);
pool.query = async (text, params) => {
  let attempt = 0;
  let lastErr;
  const maxAttempts = 5;
  
  while (attempt < maxAttempts) {
    try {
      const result = await rawQuery(text, params);
      return result;
    } catch (err) {
      lastErr = err;
      console.error(`❌ Tentativa ${attempt + 1}/${maxAttempts} falhou:`, err.message);
      
      if (!isRetryableError(err)) {
        console.error('❌ Erro não recuperável, parando retry');
        throw err;
      }
      
      attempt += 1;
      if (attempt < maxAttempts) {
        const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // backoff exponencial, max 5s
        console.log(`⏳ Aguardando ${backoff}ms antes da próxima tentativa...`);
        await sleep(backoff);
      }
    }
  }
  
  console.error(`❌ Todas as ${maxAttempts} tentativas falharam`);
  throw lastErr;
};

export const query = (text, params) => pool.query(text, params);

// Função para obter cliente do pool
export const getClient = () => pool.connect();

// Função para verificar saúde da conexão
export const checkConnectionHealth = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Conexão com banco não está saudável:', error.message);
    return false;
  }
};

// Flag para evitar fechamento múltiplo do pool
let poolClosed = false;

// Função para fechar o pool graciosamente
export const closePool = async () => {
  if (poolClosed) {
    console.log('⚠️ Pool já foi fechado, ignorando tentativa de fechamento');
    return;
  }
  
  try {
    poolClosed = true;
    await pool.end();
    console.log('✅ Pool de conexões fechado graciosamente');
  } catch (error) {
    console.error('❌ Erro ao fechar pool:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

export { pool };
export default pool;



















