# 🚀 Deploy em Produção - FilaZero

## 📋 Configuração de Ambiente

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do servidor com:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_KxuMZeiFGN08@ep-cold-breeze-acd9y85u-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Scripts Disponíveis

```bash
# Desenvolvimento local
npm run dev          # Usa index.js com nodemon

# Produção
npm start           # Usa server.js (configurado para produção)
npm run prod        # Alternativa para produção
```

## 🌐 URLs de Produção

- **Frontend**: https://filazero.netlify.app
- **Backend**: https://filazero-sistema-de-gestao.onrender.com
- **API Health**: https://filazero-sistema-de-gestao.onrender.com/api/health

## 🔒 Configurações CORS

O servidor de produção está configurado para aceitar requisições de:

- ✅ https://filazero.netlify.app
- ✅ https://filazero-sistema-de-gestao.onrender.com
- ✅ http://localhost:5173 (desenvolvimento)
- ✅ http://localhost:3000 (desenvolvimento)

## 📡 Rotas Disponíveis

### Autenticação
- `POST /api/login` - Login de usuário

### Sistema
- `GET /api/health` - Status da API
- `GET /` - Informações da API

## 🛡️ Segurança

- Headers de segurança configurados
- CORS restrito aos domínios permitidos
- Rate limiting (configurável)
- Validação de entrada

## 🔍 Testando em Produção

### 1. Verificar Status da API
```bash
curl https://filazero-sistema-de-gestao.onrender.com/api/health
```

### 2. Testar Login
```bash
curl -X POST https://filazero-sistema-de-gestao.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901","senha":"senha123"}'
```

## 📊 Monitoramento

- Logs de conexão com banco
- Status de CORS
- Headers de segurança
- Tratamento de erros

## 🚨 Troubleshooting

### Erro de CORS
- Verificar se o domínio está na lista de origens permitidas
- Confirmar se o frontend está usando a URL correta da API

### Erro de Banco
- Verificar se a DATABASE_URL está correta
- Confirmar se o Neon.tech está acessível
- Verificar logs de conexão

### Porta em Uso
- O Render.com define a porta automaticamente
- Usar `process.env.PORT` para compatibilidade
