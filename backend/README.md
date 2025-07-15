# OiPet Saúde Backend 🚀

API Node.js + Express + TypeScript + MongoDB para o aplicativo OiPet Saúde.

## 🏗️ Tecnologias

- **Node.js** + **Express.js** + **TypeScript**
- **MongoDB** com **Mongoose**
- **JWT** para autenticação
- **Redis** para cache
- **Winston** para logging
- **Jest** para testes
- **Swagger** para documentação

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente
# Editar o arquivo .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Executar testes
npm run test

# Build para produção
npm run build

# Executar produção
npm start
```

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/         # Configurações (DB, Swagger)
│   ├── controllers/    # Controladores da API
│   ├── middleware/     # Middlewares customizados
│   ├── models/         # Modelos do MongoDB
│   ├── routes/         # Rotas da API
│   ├── services/       # Lógica de negócio
│   ├── utils/          # Utilitários
│   └── index.ts        # Servidor principal
├── tests/              # Testes
├── docs/               # Documentação
└── dist/               # Build de produção
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/oipet-saude
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
# ... outras configurações Firebase
```

### MongoDB

1. Instale o MongoDB localmente ou use MongoDB Atlas
2. Configure a `MONGODB_URI` no arquivo `.env`
3. O banco será criado automaticamente na primeira execução

### Redis

1. Instale o Redis localmente ou use Redis Cloud
2. Configure a `REDIS_URL` no arquivo `.env`

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Fazer logout

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil

### Pets
- `GET /api/pets` - Listar pets
- `POST /api/pets` - Criar pet
- `GET /api/pets/:id` - Detalhes do pet
- `PUT /api/pets/:id` - Atualizar pet
- `DELETE /api/pets/:id` - Deletar pet

### Saúde
- `GET /api/health/pets/:petId` - Histórico de saúde
- `POST /api/health/pets/:petId` - Criar registro de saúde

### Admin
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/users` - Listar usuários (admin)

## 📖 Documentação

A documentação da API está disponível em:
- **Desenvolvimento**: http://localhost:3001/api-docs
- **Produção**: https://your-app.railway.app/api-docs

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em watch mode
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🔒 Segurança

- **Helmet** para headers de segurança
- **CORS** configurado
- **Rate limiting** implementado
- **JWT** com refresh tokens
- **Validação** de entrada com Joi
- **Sanitização** de dados

## 📈 Monitoramento

- **Winston** para logging estruturado
- **Health check** em `/health`
- **Métricas** de performance
- **Error tracking** integrado

## 🚀 Deploy

### Railway

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

### Manual

```bash
# Build
npm run build

# Executar
npm start
```

## 🤝 Contribuição

1. Siga as convenções do ESLint e Prettier
2. Escreva testes para novas funcionalidades
3. Mantenha cobertura de testes > 80%
4. Documente endpoints no Swagger

## 📝 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm run start` - Executar produção
- `npm run test` - Executar testes
- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir código automaticamente
- `npm run typecheck` - Verificar tipos TypeScript

---

**Desenvolvido com ❤️ pela equipe OiPet**