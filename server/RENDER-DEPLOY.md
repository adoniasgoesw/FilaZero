# 🚀 Deploy no Render.com - FilaZero

## 📋 Configuração no Render

### 1. Variáveis de Ambiente
Configure estas variáveis no painel do Render:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_KxuMZeiFGN08@ep-cold-breeze-acd9y85u-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Configurações do Serviço

#### **Build Command:**
```bash
npm install
```

#### **Start Command:**
```bash
npm start
```

#### **Environment:**
- **Node**: 18.x ou superior
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Estrutura de Arquivos
Certifique-se de que o repositório tenha:

```
server/
├── server.js              # Servidor de produção
├── package.json           # Dependências
├── controllers/           # Controllers da API
├── routes/               # Rotas da API
├── config/               # Configurações
└── .gitignore            # Arquivos ignorados
```

## 🔧 Solução para Erro de bcrypt

### Problema:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'bcrypt'
```

### Solução:
1. **Verificar package.json** - deve ter `bcryptjs` (não `bcrypt`)
2. **Reinstalar dependências** no Render
3. **Verificar build logs** para erros de instalação

### Dependências Corretas:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3"
  }
}
```

## 🚨 Troubleshooting

### Erro de bcrypt:
1. **Verificar package.json** - deve ter `bcryptjs`
2. **Reinstalar dependências**:
   ```bash
   npm install
   ```
3. **Verificar build logs** no Render

### Erro de CORS:
1. **Verificar configuração CORS** no `server.js`
2. **Confirmar domínios permitidos**:
   - https://filazero.netlify.app
   - https://filazero-sistema-de-gestao.onrender.com

### Erro de Banco:
1. **Verificar DATABASE_URL** nas variáveis de ambiente
2. **Confirmar conectividade** com Neon.tech
3. **Verificar logs** de conexão

## 📊 Monitoramento

### Logs Importantes:
- **Build logs** - verificar instalação de dependências
- **Runtime logs** - verificar conexão com banco
- **Error logs** - verificar erros de execução

### Endpoints de Teste:
- **Health Check**: `GET /api/health`
- **API Info**: `GET /`
- **Login**: `POST /api/login`

## 🔄 Deploy Automático

### Configuração:
1. **Conectar repositório** GitHub/GitLab
2. **Branch**: `main` ou `master`
3. **Auto-deploy**: ✅ Ativado
4. **Build on push**: ✅ Ativado

### Processo:
1. **Push** para branch principal
2. **Render detecta** mudanças
3. **Executa build** automaticamente
4. **Deploy** da nova versão

## 📝 Checklist de Deploy

- [ ] **Variáveis de ambiente** configuradas
- [ ] **package.json** com dependências corretas
- [ ] **server.js** configurado para produção
- [ ] **CORS** configurado corretamente
- [ ] **DATABASE_URL** válida
- [ ] **Build Command** correto
- [ ] **Start Command** correto
- [ ] **Node version** compatível
