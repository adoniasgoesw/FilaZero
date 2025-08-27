// Script para verificar o banco de dados e as URLs das imagens
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    // Testar conexão
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    
    // Verificar estrutura da tabela categorias
    console.log('\n📊 Verificando estrutura da tabela categorias...');
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categorias' 
      ORDER BY ordinal_position
    `);
    
    console.log('🏗️ Estrutura da tabela:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar tabela categorias
    console.log('\n📊 Verificando dados da tabela categorias...');
    const categorias = await pool.query('SELECT id, nome, imagem_url FROM categorias ORDER BY id');
    
    if (categorias.rows.length === 0) {
      console.log('❌ Nenhuma categoria encontrada');
      return;
    }
    
    console.log(`✅ ${categorias.rows.length} categorias encontradas`);
    
    // Analisar URLs das imagens
    categorias.rows.forEach(categoria => {
      console.log(`\n📁 Categoria ID ${categoria.id}: ${categoria.nome}`);
      console.log(`🖼️ Imagem URL: ${categoria.imagem_url || 'Nenhuma'}`);
      
      if (categoria.imagem_url) {
        // Verificar tipo de URL
        if (categoria.imagem_url.includes('https://filazero-sistema-de-gestao.onrender.comhttps://')) {
          console.log('❌ PROBLEMA: URL duplicada detectada!');
        } else if (categoria.imagem_url.startsWith('https://filazero-sistema-de-gestao.onrender.com/uploads/')) {
          console.log('✅ URL de produção válida');
        } else if (categoria.imagem_url.startsWith('/uploads/')) {
          console.log('✅ Caminho relativo válido');
        } else {
          console.log('⚠️ Formato de URL não reconhecido');
        }
      }
    });
    
    // Contar tipos de URL
    const urlTypes = categorias.rows.reduce((acc, cat) => {
      if (!cat.imagem_url) {
        acc.semImagem++;
      } else if (cat.imagem_url.includes('https://filazero-sistema-de-gestao.onrender.comhttps://')) {
        acc.duplicada++;
      } else if (cat.imagem_url.startsWith('https://filazero-sistema-de-gestao.onrender.com/uploads/')) {
        acc.producao++;
      } else if (cat.imagem_url.startsWith('/uploads/')) {
        acc.relativo++;
      } else {
        acc.outro++;
      }
      return acc;
    }, { semImagem: 0, duplicada: 0, producao: 0, relativo: 0, outro: 0 });
    
    console.log('\n📈 Resumo das URLs:');
    console.log(`🖼️ Sem imagem: ${urlTypes.semImagem}`);
    console.log(`❌ URLs duplicadas: ${urlTypes.duplicada}`);
    console.log(`✅ URLs de produção: ${urlTypes.producao}`);
    console.log(`✅ Caminhos relativos: ${urlTypes.relativo}`);
    console.log(`⚠️ Outros formatos: ${urlTypes.outro}`);
    
    // Se houver URLs duplicadas, mostrar como corrigir
    if (urlTypes.duplicada > 0) {
      console.log('\n🔧 Para corrigir URLs duplicadas, execute:');
      console.log(`UPDATE categorias SET imagem_url = REPLACE(imagem_url, 'https://filazero-sistema-de-gestao.onrender.comhttps://', 'https://') WHERE imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.comhttps://%';`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await pool.end();
  }
};

checkDatabase();
