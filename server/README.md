# FilaZero Server

Backend do sistema FilaZero com autenticação e conexão ao PostgreSQL.

## 🚀 Como executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
Crie um arquivo `.env` na raiz do servidor com:
```
DATABASE_URL=postgresql://neondb_owner:npg_KxuMZeiFGN08@ep-cold-breeze-acd9y85u-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
NODE_ENV=development
```

3. **Executar em desenvolvimento:**
```bash
npm run dev
```

4. **Executar em produção:**
```bash
npm start
```

## 📡 Endpoints

- `POST /api/auth/login` - Autenticação de usuário
- `GET /api/health` - Status da API

## 🗄️ Banco de Dados

O sistema conecta ao PostgreSQL via Neon.tech com as tabelas:
- `estabelecimentos` - Dados dos estabelecimentos
- `usuarios` - Usuários do sistema

## 🔐 Autenticação

- Valida CPF e senha
- Verifica se usuário está ativo
- Retorna dados do usuário e estabelecimento
