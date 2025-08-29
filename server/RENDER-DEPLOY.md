# 🚀 Deploy no Render.com - FilaZero

## 📋 Configuração no Render

### 1. Variáveis de Ambiente
Configure estas variáveis no painel do Render:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_KxuMZeiFGN08@ep-cold-breeze-acd9y85u-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# 🔥 NOVO: Cloudinary Configuration (OBRIGATÓRIO)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# ⚡ NOVO: Redis Configuration (OPCIONAL - para cache persistente)
REDIS_URL=redis://username:password@host:port
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
├── package.json           # Dependências (incluindo cloudinary e redis)
├── controllers/           # Controllers da API
├── routes/               # Rotas da API
├── config/               # Configurações (incluindo cloudinary.js e cache.js)
├── middlewares/          # Middlewares (incluindo uploadMiddleware.js e cacheMiddleware.js)
└── .gitignore            # Arquivos ignorados
```

## ☁️ Configuração do Cloudinary (OBRIGATÓRIO)

### **Por que Cloudinary?**
O Render.com **não persiste arquivos** entre deploys. Sem o Cloudinary, suas imagens darão erro 404 após cada deploy.

### **Passos:**
1. **Criar conta** em [cloudinary.com](https://cloudinary.com)
2. **Obter credenciais** em Settings → Access Keys
3. **Configurar variáveis** no Render (acima)
4. **Fazer deploy** da nova versão

### **Documentação Completa:**
Veja [CLOUDINARY-SETUP.md](./CLOUDINARY-SETUP.md) para instruções detalhadas.

## ⚡ Sistema de Cache (NOVO)

### **Por que Cache?**
Resolver o problema de **latência** entre o Render (backend) e o Neon (banco de dados):
- **Antes**: 2-3 segundos de delay
- **Depois**: 10-50 milissegundos (instantâneo)

### **Como Funciona:**
1. **Primeira requisição**: Busca no banco e salva no cache
2. **Requisições seguintes**: Servidas instantaneamente do cache
3. **Alterações**: Cache invalidado automaticamente

### **Configuração:**
- **Cache em memória**: Funciona automaticamente
- **Redis (opcional)**: Para persistência entre deploys

### **Documentação Completa:**
Veja [CACHE-SYSTEM.md](./CACHE-SYSTEM.md) para instruções detalhadas.

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
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10"
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
   - http://localhost:5173
   - http://localhost:3000

### Erro de Banco:
1. **Verificar DATABASE_URL** nas variáveis de ambiente
2. **Confirmar conectividade** com Neon.tech
3. **Verificar logs** de conexão

### Erro de Imagens (404):
1. **Verificar Cloudinary** - variáveis configuradas?
2. **Verificar logs** de upload
3. **Confirmar** que nova versão foi deployada

### Cache não funcionando:
1. **Verificar logs** de cache
2. **Confirmar** middlewares aplicados
3. **Testar** endpoints de cache:
   - `GET /api/cache/stats`
   - `POST /api/cache/clear`

## 📊 Monitoramento

### Logs Importantes:
- **Build logs** - verificar instalação de dependências
- **Runtime logs** - verificar conexão com banco, Cloudinary e cache
- **Error logs** - verificar erros de execução
- **Cache logs** - verificar performance do cache

### Endpoints de Teste:
- **Health Check**: `GET /api/health`
- **API Info**: `GET /`
- **Login**: `POST /api/login`
- **Cache Stats**: `GET /api/cache/stats`
- **Clear Cache**: `POST /api/cache/clear`

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
- [ ] **Cloudinary configurado** (OBRIGATÓRIO)
- [ ] **Redis configurado** (OPCIONAL - para cache persistente)
- [ ] **package.json** com dependências corretas
- [ ] **server.js** configurado para produção
- [ ] **CORS** configurado corretamente
- [ ] **DATABASE_URL** válida
- [ ] **Build Command** correto
- [ ] **Start Command** correto
- [ ] **Node version** compatível

## 🚨 **IMPORTANTE: Configurações Obrigatórias**

### **Cloudinary é OBRIGATÓRIO**
**Sem o Cloudinary configurado, suas imagens NÃO funcionarão em produção!**

### **Cache funciona automaticamente**
**O sistema de cache funciona mesmo sem Redis configurado (usando apenas memória)**

## 📚 **Documentação Completa**

- **Cloudinary**: [CLOUDINARY-SETUP.md](./CLOUDINARY-SETUP.md)
- **Cache**: [CACHE-SYSTEM.md](./CACHE-SYSTEM.md)
- **Deploy**: Este arquivo

---

**✅ Com estas configurações, seu sistema terá imagens funcionando e resposta instantânea!**
