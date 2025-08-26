# 🔧 Guia de Solução de Problemas - Upload de Imagens

## 🚨 Problema Identificado
**Erro ao cadastrar categoria com imagem no celular, mas funciona no computador**

## 🔍 Possíveis Causas

### 1. **Problema de Caminhos (Mais Provável)**
- Em produção, caminhos relativos podem não funcionar
- Pasta `uploads` pode não existir ou não ter permissões
- Diferença entre ambiente de desenvolvimento e produção

### 2. **Problema de Permissões**
- Pasta `uploads` sem permissões de escrita
- Usuário do servidor sem acesso à pasta

### 3. **Problema de Configuração do Multer**
- Configuração incorreta para ambiente de produção
- Middleware não configurado corretamente

### 4. **Problema de CORS/Headers**
- Headers incorretos para dispositivos móveis
- Problema de Content-Type

## ✅ Soluções Implementadas

### 1. **Configuração de Upload Centralizada**
- Criado `server/config/upload.js` com configuração robusta
- Uso de caminhos absolutos em vez de relativos
- Verificação automática da pasta `uploads`

### 2. **Inicialização Automática**
- Script `server/init-uploads.js` cria pasta automaticamente
- Verificação de permissões na inicialização
- Logs detalhados para debug

### 3. **Middleware de Upload Melhorado**
- Tratamento de erros específicos para dispositivos móveis
- Logs detalhados incluindo User-Agent
- Validação robusta de arquivos

### 4. **Configuração de Produção**
- Arquivo `server/config/production.js` com configurações específicas
- Validação de ambiente na inicialização
- Headers de segurança configurados

## 🧪 Como Testar

### 1. **Teste Local (Desenvolvimento)**
```bash
cd server
npm run dev
```
- Verificar se pasta `uploads` foi criada
- Testar upload de imagem
- Verificar logs no console

### 2. **Teste de Produção**
```bash
cd server
npm start
```
- Verificar se pasta `uploads` foi criada
- Verificar permissões da pasta
- Testar upload de imagem

### 3. **Verificação de Logs**
```bash
# Procurar por mensagens de erro
grep -r "❌" logs/
grep -r "Erro" logs/
```

## 🔧 Comandos de Debug

### 1. **Verificar Pasta Uploads**
```bash
ls -la server/uploads/
```

### 2. **Verificar Permissões**
```bash
ls -ld server/uploads/
```

### 3. **Verificar Logs do Servidor**
```bash
# Se usando PM2
pm2 logs

# Se usando Docker
docker logs container_name

# Se usando Render/Heroku
# Verificar logs na plataforma
```

## 🚀 Deploy e Configuração

### 1. **Variáveis de Ambiente Obrigatórias**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=3001
```

### 2. **Pasta Uploads**
- Deve ser criada automaticamente
- Deve ter permissões de leitura/escrita
- Deve persistir entre restarts

### 3. **Configuração de CORS**
```javascript
// Permitir apenas origens confiáveis
corsOrigins: [
  'https://filazero.netlify.app',
  'https://filazero-sistema-de-gestao.onrender.com'
]
```

## 📱 Problemas Específicos de Dispositivos Móveis

### 1. **User-Agent Detection**
- Logs agora incluem detecção de dispositivo móvel
- Diferentes tratamentos para mobile/desktop

### 2. **Headers de Upload**
- Content-Type deve ser `multipart/form-data`
- Verificar se frontend está enviando corretamente

### 3. **Tamanho de Arquivo**
- Limite configurado para 5MB
- Verificar se arquivo não excede limite

## 🆘 Se o Problema Persistir

### 1. **Verificar Logs do Servidor**
- Procurar por erros específicos
- Verificar se pasta `uploads` foi criada
- Verificar permissões

### 2. **Testar Upload Simples**
```bash
curl -X POST \
  -F "imagem=@teste.jpg" \
  -F "estabelecimento_id=1" \
  -F "nome=Teste" \
  http://localhost:3001/api/categorias
```

### 3. **Verificar Configuração de Produção**
- Arquivo `.env` configurado corretamente
- Variáveis de ambiente definidas
- Pasta `uploads` acessível

## 📞 Suporte
Se o problema persistir, fornecer:
1. Logs completos do servidor
2. User-Agent do dispositivo
3. Tamanho e tipo do arquivo
4. Erro específico retornado pela API
