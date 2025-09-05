# 🚀 FilaZero Backend

Backend do sistema FilaZero - Sistema de Gestão para Restaurantes

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL (Neon Database)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório e navegue para a pasta server:**
```bash
cd server
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
   - Copie `env.example` para `.env.dev` e `.env.prod`
   - Configure sua URL do banco Neon Database

## ⚙️ Configuração

### Variáveis de Ambiente

Crie os arquivos `.env.dev` e `.env.prod` com:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=sua_url_do_neon_database
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

### Banco de Dados Neon

1. Acesse [Neon Database](https://neon.tech)
2. Crie um novo projeto
3. Copie a string de conexão
4. Cole no `DATABASE_URL`

## 🚀 Execução

### Desenvolvimento (Local)
```bash
npm run dev
```
- Usa `index.js`
- Porta: 3001
- Ambiente: desenvolvimento
- Banco: Neon Database

### Produção (Netlify/Render)
```bash
npm start
```
- Usa `server.js`
- Porta: 3001 (ou variável de ambiente)
- Ambiente: produção
- Banco: Neon Database

## 📡 Endpoints da API

### Teste de Conexão
- `GET /api/test-db` - Testa conexão com banco
- `GET /api/status` - Status da API

### Gestão
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

- `GET /api/categorias` - Listar categorias
- `POST /api/categorias` - Criar categoria
- `PUT /api/categorias/:id` - Atualizar categoria
- `DELETE /api/categorias/:id` - Deletar categoria

- `GET /api/pagamentos` - Listar formas de pagamento
- `POST /api/pagamentos` - Criar forma de pagamento
- `PUT /api/pagamentos/:id` - Atualizar forma de pagamento
- `DELETE /api/pagamentos/:id` - Deletar forma de pagamento

### Caixa
- `POST /api/caixa/abrir` - Abrir caixa
- `POST /api/caixa/fechar` - Fechar caixa
- `GET /api/caixa/status` - Status do caixa
- `GET /api/caixa/historico` - Histórico do caixa

### Configurações
- `GET /api/config` - Obter configurações
- `PUT /api/config` - Atualizar configurações
- `POST /api/config/testar` - Testar configurações

## 🔧 Estrutura do Projeto

```
server/
├── config/
│   └── db.js          # Configuração do banco de dados
├── index.js            # Servidor de desenvolvimento
├── server.js           # Servidor de produção
├── package.json        # Dependências e scripts
├── env.dev             # Variáveis de ambiente (dev)
├── env.prod            # Variáveis de ambiente (prod)
└── README.md           # Este arquivo
```

## 🌐 Ambientes

### Desenvolvimento
- **Arquivo:** `index.js`
- **Porta:** 3001
- **Banco:** Neon Database
- **CORS:** localhost:5173

### Produção
- **Arquivo:** `server.js`
- **Porta:** 3001 (ou variável)
- **Banco:** Neon Database
- **CORS:** filazero.netlify.app

## 📊 Banco de Dados

### Neon Database
- **Tipo:** PostgreSQL
- **Hosting:** Neon.tech
- **SSL:** Automático
- **Pool:** 20 conexões máximas

### Configuração
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🚀 Deploy

### Render
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Build Command: `npm install`
4. Start Command: `npm start`

### Netlify Functions
1. Configure como função serverless
2. Use `server.js` como entry point
3. Configure variáveis de ambiente

## 🔍 Testes

### Teste de Conexão com Banco
```bash
curl http://localhost:3001/api/test-db
```

### Teste de Status da API
```bash
curl http://localhost:3001/api/status
```

## 📝 Logs

### Desenvolvimento
- Logs detalhados
- Erros completos
- Debug ativo

### Produção
- Logs essenciais
- Erros sanitizados
- Performance otimizada

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do servidor
2. Teste a conexão com o banco
3. Verifique as variáveis de ambiente
4. Consulte a documentação da API

---

**FilaZero** - Sistema de Gestão para Restaurantes 🍕🍔🍺










