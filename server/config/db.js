import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer uma conexão
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
export const query = (text, params) => pool.query(text, params);

// Função para obter cliente do pool
export const getClient = () => pool.connect();

export default pool;





