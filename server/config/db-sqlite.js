import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de banco SQLite
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Configuração do banco SQLite
let db = null;

// Função para inicializar o banco
export const initDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Conectado ao banco SQLite local');
    
    // Criar tabelas necessárias
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar com SQLite:', error);
    throw error;
  }
};

// Função para criar tabelas
const createTables = async () => {
  try {
    // Tabela estabelecimentos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS estabelecimentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cnpj TEXT UNIQUE,
        setor TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela usuarios
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estabelecimento_id INTEGER,
        nome_completo TEXT NOT NULL,
        email TEXT UNIQUE,
        whatsapp TEXT,
        cpf TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        cargo TEXT DEFAULT 'funcionario',
        status BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
      )
    `);

    // Tabela pontos_atendimento
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pontos_atendimento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estabelecimento_id INTEGER NOT NULL,
        atendimento_mesas BOOLEAN DEFAULT 1,
        atendimento_comandas BOOLEAN DEFAULT 0,
        quantidade_mesas INTEGER DEFAULT 4,
        quantidade_comandas INTEGER DEFAULT 0,
        prefixo_comanda TEXT DEFAULT '',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
      )
    `);

    // Tabela categorias
    await db.exec(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estabelecimento_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT,
        imagem_url TEXT,
        ativa BOOLEAN DEFAULT 1,
        ordem INTEGER DEFAULT 0,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id)
      )
    `);

    // Tabela produtos
    await db.exec(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estabelecimento_id INTEGER NOT NULL,
        categoria_id INTEGER,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        imagem_url TEXT,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id),
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      )
    `);

    // Inserir dados de exemplo se não existirem
    await insertSampleData();

    console.log('✅ Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
};

// Função para inserir dados de exemplo
const insertSampleData = async () => {
  try {
    // Verificar se já existem dados
    const estabelecimentoCount = await db.get('SELECT COUNT(*) as count FROM estabelecimentos');
    if (estabelecimentoCount.count > 0) {
      console.log('📊 Dados de exemplo já existem');
      return;
    }

    // Inserir estabelecimento de exemplo
    const estabelecimento = await db.run(`
      INSERT INTO estabelecimentos (nome, cnpj, setor) 
      VALUES (?, ?, ?)
    `, ['Restaurante Exemplo', '12345678000199', 'Alimentação']);

    const estabelecimentoId = estabelecimento.lastID;

    // Inserir usuário de exemplo (senha: 123456)
    const bcrypt = await import('bcrypt');
    const senhaHash = await bcrypt.default.hash('123456', 10);
    
    await db.run(`
      INSERT INTO usuarios (estabelecimento_id, nome_completo, email, cpf, senha, cargo) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [estabelecimentoId, 'Admin Sistema', 'admin@exemplo.com', '12345678900', senhaHash, 'admin']);

    // Inserir pontos de atendimento
    await db.run(`
      INSERT INTO pontos_atendimento (estabelecimento_id, atendimento_mesas, quantidade_mesas) 
      VALUES (?, ?, ?)
    `, [estabelecimentoId, 1, 4]);

    // Inserir categorias de exemplo
    await db.run(`
      INSERT INTO categorias (estabelecimento_id, nome, descricao) 
      VALUES (?, ?, ?)
    `, [estabelecimentoId, 'Pizzas', 'Pizzas tradicionais e especiais']);

    await db.run(`
      INSERT INTO categorias (estabelecimento_id, nome, descricao) 
      VALUES (?, ?, ?)
    `, [estabelecimentoId, 'Bebidas', 'Refrigerantes, sucos e cervejas']);

    console.log('✅ Dados de exemplo inseridos com sucesso');
    console.log('👤 Usuário de teste: CPF: 12345678900, Senha: 123456');
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
};

// Função para executar queries
export const query = async (text, params = []) => {
  if (!db) {
    throw new Error('Banco de dados não inicializado');
  }
  
  try {
    // Converter query PostgreSQL para SQLite
    const sqliteQuery = text
      .replace(/\$(\d+)/g, '?') // Substituir $1, $2, etc. por ?
      .replace(/RETURNING \*/g, '') // Remover RETURNING * do SQLite
      .replace(/BOOLEAN/g, 'INTEGER') // Converter BOOLEAN para INTEGER
      .replace(/DECIMAL\(\d+,\d+\)/g, 'REAL'); // Converter DECIMAL para REAL

    const result = await db.all(sqliteQuery, params);
    return { rows: result };
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Função para obter cliente do banco
export const getClient = () => {
  if (!db) {
    throw new Error('Banco de dados não inicializado');
  }
  return db;
};

// Função para verificar saúde da conexão
export const checkConnectionHealth = async () => {
  try {
    await db.get('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Conexão com banco não está saudável:', error.message);
    return false;
  }
};

// Função para fechar o banco
export const closeDatabase = async () => {
  if (db) {
    await db.close();
    console.log('✅ Banco SQLite fechado');
  }
};

// Graceful shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

export { db };
export default db;
