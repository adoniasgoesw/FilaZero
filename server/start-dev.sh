#!/bin/bash

echo "🚀 Iniciando servidor de desenvolvimento FilaZero..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o arquivo .env.dev existe
if [ ! -f ".env.dev" ]; then
    echo "⚠️ Arquivo .env.dev não encontrado. Criando arquivo de exemplo..."
    cp env.dev .env.dev
    echo "📝 Por favor, edite o arquivo .env.dev com suas configurações de banco de dados."
fi

echo "🌍 Iniciando servidor na porta 3001..."
echo "📱 Frontend deve estar rodando em http://localhost:5173"
echo "🔗 API estará disponível em http://localhost:3001"
echo ""

# Iniciar o servidor
npm run dev
