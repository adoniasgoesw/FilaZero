#!/bin/bash

# Script para instalar dependências do servidor
echo "🔧 Instalando dependências do servidor..."

# Remover node_modules e package-lock.json se existirem
if [ -d "node_modules" ]; then
    echo "🗑️ Removendo node_modules existente..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "🗑️ Removendo package-lock.json existente..."
    rm package-lock.json
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se bcryptjs foi instalado
if [ -d "node_modules/bcryptjs" ]; then
    echo "✅ bcryptjs instalado com sucesso!"
else
    echo "❌ Erro: bcryptjs não foi instalado!"
    exit 1
fi

echo "🎉 Todas as dependências foram instaladas com sucesso!"
echo "🚀 Para iniciar o servidor: npm start"
