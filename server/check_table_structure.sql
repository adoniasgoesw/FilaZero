-- Verificar estrutura da tabela categorias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categorias' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'categorias'
);

-- Verificar dados da tabela
SELECT * FROM categorias LIMIT 5;

-- Script para verificar e corrigir URLs duplicadas na tabela categorias
-- Execute este script no seu banco de dados para corrigir o problema

-- 1. Verificar URLs duplicadas
SELECT 
    id,
    nome,
    imagem_url,
    CASE 
        WHEN imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.comhttps://%' 
        THEN 'URL DUPLICADA'
        WHEN imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.com/uploads/%' 
        THEN 'URL CORRETA'
        WHEN imagem_url LIKE '/uploads/%' 
        THEN 'CAMINHO RELATIVO'
        ELSE 'OUTRO FORMATO'
    END as status_url
FROM categorias 
WHERE imagem_url IS NOT NULL
ORDER BY id;

-- 2. Corrigir URLs duplicadas (execute apenas se necessário)
UPDATE categorias 
SET imagem_url = REPLACE(
    imagem_url, 
    'https://filazero-sistema-de-gestao.onrender.comhttps://', 
    'https://'
)
WHERE imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.comhttps://%';

-- 3. Verificar se a correção funcionou
SELECT 
    id,
    nome,
    imagem_url,
    CASE 
        WHEN imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.com/uploads/%' 
        THEN 'URL CORRETA'
        WHEN imagem_url LIKE '/uploads/%' 
        THEN 'CAMINHO RELATIVO'
        ELSE 'OUTRO FORMATO'
    END as status_url
FROM categorias 
WHERE imagem_url IS NOT NULL
ORDER BY id;

-- 4. Contar categorias por tipo de URL
SELECT 
    CASE 
        WHEN imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.com/uploads/%' 
        THEN 'URL COMPLETA (PRODUÇÃO)'
        WHEN imagem_url LIKE '/uploads/%' 
        THEN 'CAMINHO RELATIVO (DEV)'
        WHEN imagem_url IS NULL 
        THEN 'SEM IMAGEM'
        ELSE 'OUTRO FORMATO'
    END as tipo_url,
    COUNT(*) as quantidade
FROM categorias 
GROUP BY 
    CASE 
        WHEN imagem_url LIKE 'https://filazero-sistema-de-gestao.onrender.com/uploads/%' 
        THEN 'URL COMPLETA (PRODUÇÃO)'
        WHEN imagem_url LIKE '/uploads/%' 
        THEN 'CAMINHO RELATIVO (DEV)'
        WHEN imagem_url IS NULL 
        THEN 'SEM IMAGEM'
        ELSE 'OUTRO FORMATO'
    END;
