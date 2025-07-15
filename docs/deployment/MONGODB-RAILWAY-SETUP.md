# MongoDB Setup no Railway 🗄️

Guia completo para configurar o MongoDB no Railway para o projeto OiPet Saúde.

## 🚀 Opções de Configuração

### Opção 1: MongoDB Atlas (Recomendado)

MongoDB Atlas é um serviço de banco de dados em nuvem gerenciado pela MongoDB.

#### 1. Criar Conta no MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (Free Tier M0)

#### 2. Configurar Cluster

1. **Região**: Escolha uma região próxima (ex: São Paulo/AWS)
2. **Nome**: `oipet-saude-production`
3. **Tier**: M0 Sandbox (Free)

#### 3. Configurar Segurança

1. **Database User**:
   - Username: `oipet-user`
   - Password: (gerar senha segura)
   - Roles: `Atlas Admin` ou `Read and write to any database`

2. **Network Access**:
   - IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Ou adicionar IPs específicos do Railway

#### 4. Obter Connection String

1. Vá em **Connect** → **Connect your application**
2. Driver: **Node.js**
3. Version: **4.1 or later**
4. Copie a connection string:

```
mongodb+srv://oipet-user:<password>@oipet-saude-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Opção 2: Railway Database Plugin

O Railway oferece alguns plugins de banco de dados.

#### 1. Verificar Plugins Disponíveis

No dashboard do Railway:
1. Vá ao seu projeto
2. Clique em "Add Service"
3. Procure por "Database" plugins

**Nota**: O Railway pode não ter plugin oficial do MongoDB. Verifique disponibilidade.

## 🔧 Configuração no Railway

### 1. Variáveis de Ambiente

No dashboard do Railway, adicione as seguintes variáveis:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://oipet-user:YOUR_PASSWORD@oipet-saude-production.xxxxx.mongodb.net/oipet-saude?retryWrites=true&w=majority

# Para testes
MONGODB_TEST_URI=mongodb+srv://oipet-user:YOUR_PASSWORD@oipet-saude-production.xxxxx.mongodb.net/oipet-saude-test?retryWrites=true&w=majority

# Node.js
NODE_ENV=production
```

### 2. Configurar Redis (Cache)

Para Redis, você pode usar:

#### Opção A: Railway Redis Plugin

```bash
# Se disponível no Railway
REDIS_URL=redis://default:password@host:port
```

#### Opção B: Redis Cloud (Gratuito)

1. Acesse [Redis Cloud](https://redis.com/try-free/)
2. Crie uma conta e database gratuito
3. Obtenha a connection string
4. Adicione no Railway:

```bash
REDIS_URL=redis://default:password@host:port
```

## 📋 Configuração Completa

### Arquivo `.env` para Desenvolvimento Local

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/oipet-saude
MONGODB_TEST_URI=mongodb://localhost:27017/oipet-saude-test
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=3001

# JWT
JWT_SECRET=your-super-secret-jwt-key-development
JWT_REFRESH_SECRET=your-super-secret-refresh-key-development
```

### Variáveis do Railway (Produção)

```bash
# Database
MONGODB_URI=mongodb+srv://oipet-user:SECURE_PASSWORD@oipet-saude-production.xxxxx.mongodb.net/oipet-saude?retryWrites=true&w=majority
REDIS_URL=redis://default:REDIS_PASSWORD@redis-host:port

# Application
NODE_ENV=production
PORT=$PORT

# JWT (Gerar chaves seguras)
JWT_SECRET=secure-production-jwt-secret-512-bits
JWT_REFRESH_SECRET=secure-production-refresh-secret-512-bits

# Firebase
FIREBASE_PROJECT_ID=oipet-saude
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
# ... outras configurações Firebase

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@oipet.com

# Admin
ADMIN_EMAILS=admin@oipet.com,telmo@oipet.com

# CORS
CORS_ORIGIN=https://oipet.netlify.app,https://your-domain.com
```

## 🧪 Testando a Conexão

### 1. Localmente

```bash
# Instalar dependências
npm install

# Testar conexão
npm run dev

# Executar seed (dados de teste)
npm run seed
```

### 2. No Railway

Após configurar as variáveis:

1. Deploy automático será executado
2. Verifique os logs no Railway dashboard
3. Teste o endpoint de health: `https://your-app.railway.app/health`

## 🔐 Segurança

### Senhas Seguras

Use o comando para gerar senhas seguras:

```bash
# MongoDB password
openssl rand -base64 32

# JWT secrets
openssl rand -hex 64
```

### Configuração de Rede

**MongoDB Atlas**:
- Configure whitelist de IPs se possível
- Use SSL sempre (incluído na connection string)

**Redis**:
- Configure autenticação
- Use SSL se disponível

## 📊 Monitoramento

### MongoDB Atlas

1. **Metrics**: Acesse o dashboard do Atlas
2. **Alerts**: Configure alertas de performance
3. **Logs**: Monitore logs de acesso

### Railway

1. **Logs**: Monitore logs da aplicação
2. **Metrics**: Verifique CPU e memória
3. **Health Checks**: Configure health checks

## 🚨 Troubleshooting

### Problemas Comuns

#### Erro de Conexão

```
MongoNetworkError: failed to connect to server
```

**Soluções**:
1. Verificar connection string
2. Verificar whitelist de IPs
3. Verificar credentials

#### Timeout de Conexão

```
MongooseServerSelectionError: timed out
```

**Soluções**:
1. Aumentar `serverSelectionTimeoutMS`
2. Verificar conectividade de rede
3. Testar com MongoDB Compass

#### Erro de Autenticação

```
MongoServerError: bad auth
```

**Soluções**:
1. Verificar username/password
2. Verificar roles do usuário
3. Recriar usuário se necessário

## 📝 Backup e Recuperação

### MongoDB Atlas

- **Backup automático**: Configurado por padrão (Free tier: 2 dias)
- **Point-in-time recovery**: Disponível em tiers pagos

### Manual

```bash
# Backup
mongodump --uri="mongodb+srv://..."

# Restore
mongorestore --uri="mongodb+srv://..." dump/
```

## 🎯 Próximos Passos

1. ✅ Configurar MongoDB Atlas
2. ✅ Adicionar variáveis no Railway
3. ✅ Testar conexão
4. ✅ Executar seed de dados
5. ✅ Configurar Redis
6. ✅ Configurar monitoramento
7. ✅ Implementar backup strategy

---

**Desenvolvido pela equipe OiPet** 🐾