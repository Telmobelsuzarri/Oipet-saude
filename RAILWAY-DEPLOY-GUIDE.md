# 🚀 Railway Deploy Guide - OiPet Saúde Backend

## 📋 Pre-requisitos

1. Conta no Railway: https://railway.app
2. Conta no GitHub com o repositório
3. Projeto commitado e pushado no GitHub

## 🔧 Passo a Passo para Deploy

### 1️⃣ **Criar Novo Projeto no Railway**

1. Acesse https://railway.app
2. Clique em "New Project"
3. Escolha "Deploy from GitHub repo"
4. Autorize o Railway no GitHub se necessário
5. Selecione o repositório: `Telmobelsuzarri/Oipet-saude`

### 2️⃣ **Adicionar MongoDB**

```bash
# No dashboard do Railway:
1. Clique em "New" → "Database" → "Add MongoDB"
2. Railway criará automaticamente as variáveis:
   - MONGO_URL
   - MONGOHOST
   - MONGOPASSWORD
   - MONGOPORT
   - MONGOUSER
   - MONGODB_URL
```

### 3️⃣ **Adicionar Redis**

```bash
# No dashboard do Railway:
1. Clique em "New" → "Database" → "Add Redis"
2. Railway criará automaticamente as variáveis:
   - REDIS_URL
   - REDISHOST
   - REDISPASSWORD
   - REDISPORT
   - REDISUSER
```

### 4️⃣ **Configurar Variáveis de Ambiente**

No painel do Railway, vá em "Variables" e adicione:

```env
# App Config
NODE_ENV=production
PORT=3001

# Database (use a variável MONGODB_URL criada automaticamente)
MONGODB_URI=${{MONGODB_URL}}
DATABASE_NAME=oipet-saude

# Redis (use a variável REDIS_URL criada automaticamente)
REDIS_URL=${{REDIS_URL}}

# Authentication
JWT_SECRET=oipet-jwt-secret-2025-super-secure-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=oipet-refresh-secret-2025-ultra-secure
JWT_REFRESH_EXPIRE=30d

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx (adicionar depois)
FROM_EMAIL=noreply@oipet.com.br
SUPPORT_EMAIL=support@oipet.com.br

# Frontend URLs
FRONTEND_URL=https://oipet-saude-web.vercel.app
ADMIN_URL=https://oipet-saude-admin.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Storage
STORAGE_TYPE=local
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5242880

# Monitoring
LOG_LEVEL=info
ENABLE_MONITORING=true
MONITORING_INTERVAL=60000

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

### 5️⃣ **Deploy Inicial**

```bash
# O Railway fará deploy automático quando:
1. Detectar push no branch main
2. Usar as configurações de railway.json e nixpacks.toml

# Comandos executados automaticamente:
- cd backend && npm install
- cd backend && npm start
```

### 6️⃣ **Verificar Deploy**

```bash
# URLs para verificar:
https://[seu-projeto].railway.app/health
https://[seu-projeto].railway.app/api-docs

# Logs:
- Acesse "Logs" no painel do Railway
- Verifique se aparece:
  ✅ Database connected successfully
  ✅ Redis connected successfully
  🚀 Server running on port 3001
```

## 🔍 Troubleshooting

### Erro: "Cannot connect to MongoDB"
```bash
# Solução:
1. Verifique se MongoDB foi adicionado ao projeto
2. Confirme que MONGODB_URI está usando ${{MONGODB_URL}}
3. Aguarde 2-3 minutos para MongoDB inicializar
```

### Erro: "Redis connection failed"
```bash
# Solução:
1. Redis é opcional - pode funcionar sem
2. Se quiser Redis, adicione pelo painel
3. Confirme REDIS_URL está configurado
```

### Erro: "Build failed"
```bash
# Solução:
1. Verifique logs de build no Railway
2. Confirme que package.json está em /backend
3. Verifique railway.json e nixpacks.toml
```

### Erro: "Port already in use"
```bash
# Solução:
1. Railway define PORT automaticamente
2. Use process.env.PORT || 3001
3. Não hardcode a porta
```

## 📊 Monitoramento

### Métricas Disponíveis
- CPU Usage
- Memory Usage
- Network I/O
- Response Times
- Error Rates

### Endpoints de Monitoramento
```bash
GET /health - Health check básico
GET /api/monitoring/health - Health check detalhado
GET /api/monitoring/metrics - Métricas do sistema
```

## 🔐 Segurança

### Checklist de Segurança
- [x] JWT_SECRET forte e único
- [x] CORS configurado para domínios específicos
- [x] Rate limiting ativo
- [x] Helmet.js para headers de segurança
- [x] Input sanitization
- [x] MongoDB connection com SSL
- [x] HTTPS automático pelo Railway

## 🚀 Comandos Úteis

```bash
# Login no Railway CLI (local)
railway login

# Ver logs
railway logs

# Abrir dashboard
railway open

# Executar comando no container
railway run npm list

# Ver variáveis de ambiente
railway variables
```

## 📝 Notas Importantes

1. **Auto-deploy**: Cada push no main faz deploy automático
2. **Rollback**: Use o painel para voltar versões anteriores
3. **Scaling**: Railway escala automaticamente baseado no uso
4. **SSL**: HTTPS é automático, não precisa configurar
5. **Domínio**: Railway fornece domínio .railway.app grátis

## 🎯 Próximos Passos Após Deploy

1. ✅ Testar endpoint /health
2. ✅ Verificar conexão MongoDB
3. ✅ Testar autenticação (register/login)
4. ✅ Criar usuário admin
5. ✅ Configurar SendGrid (emails)
6. ✅ Testar integração com frontend Vercel
7. ✅ Configurar monitoramento
8. ✅ Setup backups automáticos

## 🔗 Links Úteis

- Railway Dashboard: https://railway.app/dashboard
- Documentação Railway: https://docs.railway.app
- Status Railway: https://status.railway.app
- Suporte: https://discord.gg/railway

---

**Última atualização**: 21/08/2025
**Autor**: Claude Code Assistant
**Projeto**: OiPet Saúde