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
