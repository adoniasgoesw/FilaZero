# 🔧 FilaZero - Guia de Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. **Erro de CORS: "Access to fetch blocked by CORS policy"**

**Sintoma:**
```
Access to fetch at 'http://localhost:3001/api/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:** O servidor backend não está rodando ou não está configurado corretamente.

**Solução:**
1. **Iniciar o servidor de desenvolvimento:**
   ```bash
   # No diretório server/
   npm run dev
   ```

2. **Verificar se o servidor está rodando:**
   - Abra http://localhost:3001 no navegador
   - Deve mostrar: "🚀 FilaZero Backend - Ambiente de Desenvolvimento"

3. **Verificar configuração CORS:**
   - O servidor deve estar configurado para aceitar `http://localhost:5173`

### 2. **Erro: "Cannot read properties of undefined (reading 'token')"**

**Sintoma:**
```
Cannot read properties of undefined (reading 'token')
```

**Causa:** A resposta da API não tem a estrutura esperada pelo frontend.

**Estrutura esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "usuario": { ... },
    "token": "jwt_token_aqui"
  }
}
```

**Solução:**
1. **Verificar se o backend está retornando a estrutura correta**
2. **Verificar se o banco de dados está configurado**
3. **Verificar se as tabelas `usuarios` e `estabelecimentos` existem**

### 3. **Servidor não inicia**

**Sintoma:**
```
Error: Cannot find module './routes/AuthRoute.js'
```

**Causa:** Arquivo de rotas não encontrado ou import incorreto.

**Solução:**
1. **Verificar se o arquivo existe:**
   ```bash
   ls server/routes/
   # Deve mostrar: AuthRoute.js
   ```

2. **Verificar import no server.js:**
   ```javascript
   import AuthRoutes from './routes/AuthRoute.js';
   ```

### 4. **Erro de conexão com banco de dados**

**Sintoma:**
```
❌ DATABASE_URL não está configurada!
```

**Causa:** Variáveis de ambiente não configuradas.

**Solução:**
1. **Criar arquivo .env.dev:**
   ```bash
   cp env.dev .env.dev
   ```

2. **Editar .env.dev com suas credenciais:**
   ```env
   DATABASE_URL=postgresql://usuario:senha@host:porta/banco
   JWT_SECRET=sua_chave_secreta
   ```

## 🚀 **Passos para Resolver o Problema de Login**

### **Passo 1: Verificar Estrutura do Projeto**
```bash
server/
├── routes/
│   └── AuthRoute.js          # ✅ Deve existir
├── config/
│   └── db.js                 # ✅ Deve existir
├── .env.dev                  # ✅ Deve existir
└── package.json              # ✅ Deve ter scripts corretos
```

### **Passo 2: Iniciar o Servidor Backend**
```bash
# No diretório server/
npm run dev
```

**Saída esperada:**
```
🚀 Servidor rodando em http://localhost:3001
🌍 Ambiente: Desenvolvimento
📊 Testando conexão com banco de dados...
✅ Conectado ao banco de dados Neon
```

### **Passo 3: Testar a API**
```bash
# Testar se o servidor está funcionando
curl http://localhost:3001

# Testar endpoint de login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678900","senha":"senha123"}'
```

### **Passo 4: Verificar Frontend**
1. **Frontend deve estar rodando em:** http://localhost:5173
2. **API deve estar rodando em:** http://localhost:3001
3. **Verificar se não há conflito de portas**

## 🔍 **Debug e Logs**

### **Verificar Logs do Servidor**
```bash
# No terminal onde o servidor está rodando
# Deve mostrar logs de cada requisição
```

### **Verificar Console do Navegador**
1. Abra DevTools (F12)
2. Vá para Console
3. Tente fazer login e veja os erros

### **Verificar Network Tab**
1. Abra DevTools (F12)
2. Vá para Network
3. Tente fazer login e veja a requisição

## 📋 **Checklist de Verificação**

- [ ] Servidor backend está rodando na porta 3001
- [ ] Frontend está rodando na porta 5173
- [ ] Arquivo .env.dev existe e está configurado
- [ ] Banco de dados está acessível
- [ ] Tabelas `usuarios` e `estabelecimentos` existem
- [ ] Usuário de teste existe no banco
- [ ] CORS está configurado corretamente
- [ ] Rotas estão funcionando

## 🆘 **Se Nada Funcionar**

1. **Reiniciar tudo:**
   ```bash
   # Parar todos os processos
   # Fechar todos os terminais
   # Abrir novos terminais
   ```

2. **Verificar portas em uso:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   netstat -ano | findstr :5173
   
   # Linux/Mac
   lsof -i :3001
   lsof -i :5173
   ```

3. **Limpar cache:**
   ```bash
   # No diretório server/
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Verificar versão do Node.js:**
   ```bash
   node --version
   # Deve ser >= 18.0.0
   ```
