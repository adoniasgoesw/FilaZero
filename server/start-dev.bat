@echo off
echo 🚀 Iniciando servidor de desenvolvimento FilaZero...

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

REM Verificar se o arquivo .env.dev existe
if not exist ".env.dev" (
    echo ⚠️ Arquivo .env.dev não encontrado. Criando arquivo de exemplo...
    copy env.dev .env.dev
    echo 📝 Por favor, edite o arquivo .env.dev com suas configurações de banco de dados.
)

echo 🌍 Iniciando servidor na porta 3001...
echo 📱 Frontend deve estar rodando em http://localhost:5173
echo 🔗 API estará disponível em http://localhost:3001
echo.

REM Iniciar o servidor
npm run dev

pause
