// Script para testar criação de categoria em produção
import pool from './config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testProduction = async () => {
  try {
    console.log('🔍 Testando configuração de produção...');
    
    // Verificar variáveis de ambiente
    console.log('\n🌍 Variáveis de ambiente:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('RENDER:', process.env.RENDER);
    console.log('HOSTNAME:', process.env.HOSTNAME);
    console.log('PORT:', process.env.PORT);
    
    // Verificar pasta uploads
    const uploadsPath = path.join(__dirname, 'uploads');
    console.log('\n📁 Verificando pasta uploads:');
    console.log('Caminho:', uploadsPath);
    
    if (fs.existsSync(uploadsPath)) {
      console.log('✅ Pasta uploads existe');
      const stats = fs.statSync(uploadsPath);
      console.log('Permissões:', stats.mode.toString(8));
      console.log('É diretório:', stats.isDirectory());
      
      // Listar arquivos
      const files = fs.readdirSync(uploadsPath);
      console.log('Arquivos encontrados:', files);
    } else {
      console.log('❌ Pasta uploads não existe');
      
      // Tentar criar
      try {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log('✅ Pasta uploads criada com sucesso');
      } catch (error) {
        console.error('❌ Erro ao criar pasta uploads:', error.message);
      }
    }
    
    // Testar conexão com banco
    console.log('\n🗄️ Testando conexão com banco...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    
    // Verificar tabela categorias
    console.log('\n📊 Verificando tabela categorias...');
    const categorias = await pool.query('SELECT COUNT(*) as total FROM categorias');
    console.log('Total de categorias:', categorias.rows[0].total);
    
    // Verificar estrutura da tabela
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n🏗️ Estrutura da tabela categorias:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Simular detecção de ambiente
    console.log('\n🔍 Simulando detecção de ambiente:');
    const isProduction = process.env.NODE_ENV === 'production' || 
                        process.env.RENDER === 'true' ||
                        process.env.HOSTNAME?.includes('render.com');
    
    console.log('Ambiente detectado:', isProduction ? 'Produção' : 'Desenvolvimento');
    
    if (isProduction) {
      console.log('✅ Configuração de produção detectada');
      console.log('🔗 URLs serão salvas como: https://filazero-sistema-de-gestao.onrender.com/uploads/...');
    } else {
      console.log('⚠️ Configuração de desenvolvimento detectada');
      console.log('🔗 URLs serão salvas como: /uploads/...');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await pool.end();
  }
};

testProduction();
