# ☁️ Configuração do Cloudinary - FilaZero

## 🔍 **Problema Identificado**

O **Render.com** é um serviço de hospedagem que **não persiste arquivos** entre os deploys. Quando você faz um novo deploy, todos os arquivos na pasta `uploads/` são perdidos, causando o erro 404 nas imagens.

## 🚀 **Solução: Cloudinary**

O **Cloudinary** é um serviço de hospedagem de imagens gratuito que resolve este problema:
- ✅ **URLs persistentes** - nunca mudam
- ✅ **Gratuito** para uso básico
- ✅ **Integração fácil** com Node.js
- ✅ **CDN global** para melhor performance

## 📋 **Passos para Configuração**

### 1. Criar Conta no Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Clique em **"Sign Up For Free"**
3. Preencha os dados e confirme o email
4. Faça login na sua conta

### 2. Obter Credenciais

1. No dashboard, vá para **"Settings"** → **"Access Keys"**
2. Anote as seguintes informações:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configurar Variáveis de Ambiente

No painel do **Render.com**, adicione estas variáveis:

```bash
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

### 4. Deploy da Nova Versão

1. Faça commit das mudanças
2. Push para o repositório
3. O Render fará deploy automático
4. As novas imagens serão salvas no Cloudinary

## 🔧 **Como Funciona Agora**

### **Antes (Problema):**
```
1. Usuário faz upload → Imagem salva em /uploads/
2. Deploy no Render → Pasta /uploads/ é perdida
3. URLs no banco apontam para arquivos inexistentes
4. Erro 404 nas imagens
```

### **Depois (Solução):**
```
1. Usuário faz upload → Imagem enviada para Cloudinary
2. Cloudinary retorna URL persistente
3. URL salva no banco de dados
4. Imagens sempre funcionam, mesmo após deploy
```

## 📊 **Estrutura das URLs**

### **Antes:**
```
https://filazero-sistema-de-gestao.onrender.com/uploads/categoria-123.jpg
```

### **Depois:**
```
https://res.cloudinary.com/seu_cloud_name/image/upload/v1234567890/filazero/categoria-123.jpg
```

## 🚨 **Importante**

- **Imagens antigas** ainda não funcionarão (estão com URLs antigas)
- **Novas imagens** funcionarão perfeitamente
- Para **migrar imagens antigas**, será necessário re-upload

## 💰 **Custos**

- **Plano gratuito**: 25GB de armazenamento, 25GB de banda/mês
- **Suficiente** para a maioria dos estabelecimentos
- **Sem custos ocultos** ou surpresas

## 🔄 **Migração de Imagens Antigas**

Se quiser migrar as imagens antigas:

1. **Backup** das imagens atuais
2. **Re-upload** de cada imagem
3. **Atualização** dos registros no banco

## 📞 **Suporte**

- **Cloudinary**: [Documentação oficial](https://cloudinary.com/documentation)
- **FilaZero**: Abrir issue no repositório

---

**✅ Com esta solução, suas imagens nunca mais darão erro 404!**
