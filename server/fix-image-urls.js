// Script para corrigir URLs inconsistentes no banco de dados
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const fixImageUrls = async () => {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    
    // Testar conexão
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Banco conectado em:', result.rows[0].now);
    
    // Verificar categorias com URLs inconsistentes
    console.log('\n📊 Verificando URLs das imagens...');
    const categorias = await pool.query('SELECT id, nome, imagem_url FROM categorias WHERE imagem_url IS NOT NULL ORDER BY id');
    
    if (categorias.rows.length === 0) {
      console.log('❌ Nenhuma categoria com imagem encontrada');
      return;
    }
    
    console.log(`✅ ${categorias.rows.length} categorias com imagem encontradas`);
    
    // Analisar e corrigir URLs
    for (const categoria of categorias.rows) {
      console.log(`\n📁 Categoria ID ${categoria.id}: ${categoria.nome}`);
      console.log(`🖼️ Imagem URL atual: ${categoria.imagem_url}`);
      
      let novaUrl = categoria.imagem_url;
      let precisaCorrigir = false;
      
      // Verificar se é uma URL completa válida
      if (categoria.imagem_url.startsWith('https://filazero-sistema-de-gestao.onrender.com/uploads/')) {
        console.log('✅ URL de produção válida');
      } else if (categoria.imagem_url.startsWith('/uploads/')) {
        console.log('✅ Caminho relativo válido');
      } else if (categoria.imagem_url.includes('https://filazero-sistema-de-gestao.onrender.comhttps://')) {
        console.log('❌ URL duplicada detectada! Corrigindo...');
        novaUrl = categoria.imagem_url.replace('https://filazero-sistema-de-gestao.onrender.comhttps://', 'https://');
        precisaCorrigir = true;
      } else {
        console.log('⚠️ Formato de URL não reconhecido');
      }
      
      // Corrigir se necessário
      if (precisaCorrigir) {
        try {
          await pool.query('UPDATE categorias SET imagem_url = $1 WHERE id = $2', [novaUrl, categoria.id]);
          console.log(`✅ URL corrigida para: ${novaUrl}`);
        } catch (error) {
          console.error(`❌ Erro ao corrigir URL da categoria ${categoria.id}:`, error.message);
        }
      }
    }
    
    // Verificar resultado final
    console.log('\n📈 Verificação final das URLs...');
    const categoriasFinais = await pool.query('SELECT id, nome, imagem_url FROM categorias WHERE imagem_url IS NOT NULL ORDER BY id');
    
    categoriasFinais.rows.forEach(categoria => {
      console.log(`ID ${categoria.id}: ${categoria.nome} - ${categoria.imagem_url}`);
    });
    
    console.log('\n✅ Processo de correção concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir URLs:', error);
  } finally {
    await pool.end();
  }
};

fixImageUrls();
