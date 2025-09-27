# Migração de Domínio - FilaZero

## Problema Resolvido
- **Domínio antigo:** `filazero.netlify.app`
- **Domínio novo:** `filazeroapp.online`
- **Erro:** CORS policy bloqueando requisições do novo domínio

## Configurações Atualizadas

### 1. Servidor (Backend)
- ✅ **server/server.js**: Adicionado `https://filazeroapp.online` e `https://www.filazeroapp.online` ao CORS
- ✅ **server/env.prod**: Atualizado `FRONTEND_URL` para o novo domínio
- ✅ **server/DEPLOYMENT.md**: Documentação atualizada

### 2. Cliente (Frontend)
- ✅ **client/env.example**: Atualizado `VITE_FRONTEND_URL_PROD`
- ✅ **client/netlify.toml**: Configuração do Netlify criada
- ✅ **client/public/_redirects**: Redirecionamentos atualizados
- ✅ **client/env.production.example**: Variáveis de ambiente para produção
- ✅ **client/netlify-env.example**: Variáveis para configurar no Netlify

## Próximos Passos

### 1. Configurar no Netlify
1. Acesse o dashboard do Netlify
2. Vá em **Site Settings** > **Environment Variables**
3. Configure as seguintes variáveis:
   ```
   VITE_API_URL=https://filazero-sistema-de-gestao.onrender.com/api
   VITE_FRONTEND_URL=https://filazeroapp.online
   VITE_APP_NAME=FilaZero
   VITE_APP_VERSION=1.0.0
   ```

### 2. Configurar Domínio Personalizado
1. No Netlify, vá em **Domain Management**
2. Adicione `filazeroapp.online` como domínio personalizado
3. Configure os DNS records conforme instruções do Netlify

### 3. Deploy
1. Faça commit das alterações
2. Faça push para o repositório
3. O Netlify fará o deploy automaticamente

## Verificação
Após o deploy, teste:
- ✅ Login funciona sem erro de CORS
- ✅ Todas as requisições para a API funcionam
- ✅ O domínio `filazeroapp.online` está funcionando

## Arquivos Modificados
- `server/server.js` - CORS configuration
- `server/env.prod` - Environment variables
- `server/DEPLOYMENT.md` - Documentation
- `client/env.example` - Frontend environment
- `client/netlify.toml` - Netlify configuration
- `client/public/_redirects` - Redirects
- `client/env.production.example` - Production env example
- `client/netlify-env.example` - Netlify env example

