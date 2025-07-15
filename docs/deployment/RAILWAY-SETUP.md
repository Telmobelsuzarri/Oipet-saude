# Railway Setup - OiPet Saúde

## 1. Configuração Inicial do Railway

### Passo 1: Conectar GitHub ao Railway

1. **Acesse o Railway Dashboard**: https://railway.app/dashboard
2. **Crie um novo projeto**: "New Project"
3. **Conecte o GitHub**: "Deploy from GitHub repo"
4. **Selecione o repositório**: `Telmobelsuzarri/Oipet-saude`
5. **Defina o diretório raiz**: `backend` (importante!)

### Passo 2: Configurar Build Settings

```yaml
# No Railway Dashboard > Settings > Build
Build Command: npm run build
Start Command: npm run start
Root Directory: backend
```

### Passo 3: Configurar Variáveis de Ambiente

No Railway Dashboard, vá em **Variables** e adicione:

```bash
# Application
NODE_ENV=production
PORT=$PORT

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://oipet-user:PASSWORD@oipet-saude.xxxxx.mongodb.net/oipet-saude?retryWrites=true&w=majority

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=GENERATE_SECURE_KEY_512_BITS
JWT_REFRESH_SECRET=GENERATE_SECURE_KEY_512_BITS
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://oipet.netlify.app,https://your-domain.com

# Admin
ADMIN_EMAILS=admin@oipet.com,telmo@oipet.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Passo 4: Configurar MongoDB Atlas

1. **Acesse**: https://cloud.mongodb.com/
2. **Crie um cluster**: "Build a Database" → "Shared" (Free)
3. **Configurar segurança**:
   - Username: `oipet-user`
   - Password: `[GENERATE_SECURE_PASSWORD]`
   - IP Access: `0.0.0.0/0` (anywhere)
4. **Obtenha a connection string**: Connect → Drivers → Node.js
5. **Substitua a variável**: `MONGODB_URI` no Railway

### Passo 5: Configurar Redis (Opcional)

#### Opção A: Redis Cloud (Recomendado)
1. **Acesse**: https://redis.com/try-free/
2. **Crie uma database**: Free tier (30MB)
3. **Configure**:
   - Name: `oipet-saude-redis`
   - Cloud: AWS
   - Region: us-east-1
4. **Obtenha a URL**: `redis://default:password@host:port`
5. **Adicione ao Railway**: `REDIS_URL=redis://default:password@host:port`

#### Opção B: Railway Plugin
1. **No Railway Dashboard**: Add Service → Database → Redis
2. **Conecte automaticamente**: Railway gera `REDIS_URL`

### Passo 6: Deploy

1. **No Railway**: Deploy será automático após configuração
2. **Monitore logs**: Logs tab no dashboard
3. **Teste endpoints**: Use a URL gerada pelo Railway

## 2. Gerar Chaves JWT Seguras

Execute este comando para gerar chaves JWT:

```bash
node -e "
console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'));
console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'));
"
```

## 3. URLs Finais

Após o deploy, você terá:
- **Backend API**: https://oipet-saude-production.up.railway.app
- **API Documentation**: https://oipet-saude-production.up.railway.app/api-docs
- **Health Check**: https://oipet-saude-production.up.railway.app/health

## 4. Configurar Auto-Deploy

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: "oipet-saude-backend"
```

### Railway Token

1. **Gere um token**: https://railway.app/account/tokens
2. **Adicione ao GitHub**: Settings → Secrets → Actions
3. **Nome**: `RAILWAY_TOKEN`
4. **Valor**: Seu token do Railway

## 5. Monitoramento

### Logs
```bash
# Via Railway CLI (se instalado)
railway logs

# Ou acesse pelo dashboard
https://railway.app/dashboard → Seu projeto → Logs
```

### Métricas
- **CPU/Memory**: Railway dashboard → Metrics
- **Uptime**: Health check endpoint
- **Errors**: Application logs

## 6. Troubleshooting

### Erro de Build
```bash
# Verifique se o package.json tem os scripts corretos
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc",
  "dev": "tsx watch src/index.ts"
}
```

### Erro de Conexão MongoDB
```bash
# Verifique se:
1. String de conexão está correta
2. IP está liberado (0.0.0.0/0)
3. Usuário/senha estão corretos
4. Database name está correto
```

### Erro de Variáveis
```bash
# Verifique se todas as variáveis obrigatórias estão definidas:
NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
```

## 7. Próximos Passos

1. ✅ Conectar GitHub ao Railway
2. ✅ Configurar variáveis de ambiente
3. ✅ Configurar MongoDB Atlas
4. ⏳ Configurar Redis (opcional)
5. ⏳ Testar endpoints
6. ⏳ Configurar domínio customizado (opcional)
7. ⏳ Configurar monitoramento

---

**Nota**: Este setup está pronto para produção com todas as configurações de segurança e performance necessárias.