# 🚀 Infrastructure Setup - OiPet Saúde

Guia completo para configurar toda a infraestrutura de produção do projeto OiPet Saúde.

## ✅ **Infraestrutura Implementada**

### 1. 🔄 **CI/CD Pipeline (GitHub Actions + Railway)**
- ✅ Workflow de deploy automático
- ✅ Testes automáticos antes do deploy
- ✅ Deploy para staging e produção
- ✅ Security audit automático
- ✅ Health check pós-deploy

### 2. 🗄️ **Redis Cache System**
- ✅ Configuração para Railway Redis
- ✅ Cache de API responses
- ✅ Rate limiting distribuído
- ✅ Cache de sessões de usuário
- ✅ Graceful fallback sem Redis

### 3. 📦 **File Storage (Railway Volume)**
- ✅ Upload de imagens (pets, avatars, food scans)
- ✅ Organização por categorias
- ✅ Cleanup automático de arquivos temporários
- ✅ Security headers para arquivos
- ✅ APIs de upload RESTful

### 4. 🔐 **Security & SSL**
- ✅ HTTPS enforcement
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Rate limiting por endpoint
- ✅ Input sanitization
- ✅ IP filtering
- ✅ API key validation

### 5. 📊 **Monitoring & Health Checks**
- ✅ Health checks completos (DB, Redis, APIs)
- ✅ System metrics (CPU, Memory, Disk)
- ✅ Performance monitoring
- ✅ Security event logging
- ✅ Endpoints para Kubernetes probes

### 6. 💾 **Backup System**
- ✅ Backup automático diário (2 AM)
- ✅ Backup manual via API
- ✅ Backup por coleção específica
- ✅ Cleanup automático (30 dias)
- ✅ Sistema de restore
- ✅ Estatísticas de backup

---

## 🔧 **Configuração Step-by-Step**

### **Passo 1: Railway Setup**

#### 1.1 Criar Projeto no Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Conectar projeto
railway link
```

#### 1.2 Configurar Serviços
```bash
# Adicionar MongoDB
railway add mongodb

# Adicionar Redis
railway add redis

# Deploy automático
railway up
```

### **Passo 2: Environment Variables**

Copie as variáveis do arquivo `.env.production` para o Railway Dashboard:

#### 2.1 Variáveis Essenciais
```env
NODE_ENV=production
MONGODB_URI=[Railway fornece automaticamente]
REDIS_URL=[Railway fornece automaticamente]
JWT_SECRET=[Gere uma chave forte]
SENDGRID_API_KEY=[Sua chave do SendGrid]
```

#### 2.2 Variáveis de Segurança
```env
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://seu-dominio.com
```

### **Passo 3: GitHub Actions Setup**

#### 3.1 Secrets do GitHub
Adicione em Settings → Secrets:
```
RAILWAY_TOKEN=[Token do Railway]
RAILWAY_TOKEN_STAGING=[Token para staging]
```

#### 3.2 Branch Protection
- Proteger branch `main`
- Require status checks
- Require pull request reviews

### **Passo 4: DNS e SSL**

#### 4.1 Custom Domain (Opcional)
```bash
# Adicionar domínio no Railway
railway domain add api.oipet.com

# Configurar DNS
# CNAME: api.oipet.com → [railway-url]
```

#### 4.2 SSL Automático
- Railway configura SSL automaticamente
- Certificados Let's Encrypt renovados automaticamente

---

## 📊 **Monitoramento e Alertas**

### **Endpoints de Monitoramento**

```bash
# Health check público
GET /api/monitoring/health

# Health check detalhado (admin)
GET /api/monitoring/health/detailed

# Métricas do sistema (admin)
GET /api/monitoring/metrics

# Status de serviços externos (admin)
GET /api/monitoring/status/external
```

### **Logs e Alertas**

#### Railway Logs
```bash
# Ver logs em tempo real
railway logs

# Logs específicos
railway logs --tail 100
```

#### Metrics Dashboard
```bash
# Acessar métricas no Railway
https://railway.app/project/[project-id]/metrics
```

---

## 💾 **Sistema de Backup**

### **Backup Automático**
- **Frequência**: Diário às 2h
- **Retenção**: 30 dias
- **Storage**: Redis + Logs

### **Backup Manual**
```bash
# Via API (admin required)
POST /api/backup/create

# Backup específico
POST /api/backup/collection/users
```

### **Restore**
```bash
# Restore completo (CUIDADO!)
POST /api/backup/restore/[backup-id]
{
  "confirmRestore": true
}
```

---

## 🔐 **Segurança**

### **Rate Limiting**
- **Auth endpoints**: 5 tentativas / 15 min
- **API geral**: 100 requests / 15 min  
- **Upload**: 10 uploads / hora

### **Security Headers**
- HSTS com preload
- CSP restritivo
- XSS Protection
- Frame Options: DENY

### **Input Validation**
- Sanitização automática
- Validação de schemas
- File type restrictions

---

## 🚀 **Deploy Process**

### **Automatic Deploy**
```bash
# Push para main = deploy automático
git push origin main

# Staging deploy
git push origin develop
```

### **Manual Deploy**
```bash
# Via Railway CLI
railway up

# Rollback
railway rollback
```

### **Deploy Verification**
```bash
# Health check pós-deploy
curl https://[railway-url]/api/monitoring/health

# Verificar logs
railway logs --tail 50
```

---

## 📈 **Performance**

### **Otimizações Implementadas**
- ✅ Redis caching
- ✅ Gzip compression
- ✅ Connection pooling MongoDB
- ✅ Static file serving otimizado
- ✅ Rate limiting por IP

### **Monitoring Performance**
```bash
# CPU e Memory usage
GET /api/monitoring/metrics

# Database latency
GET /api/monitoring/status/database

# Redis latency
GET /api/monitoring/status/redis
```

---

## 🆘 **Troubleshooting**

### **Problemas Comuns**

#### 1. **Deploy Falha**
```bash
# Verificar logs
railway logs

# Verificar environment variables
railway variables

# Rebuild
railway up --detach
```

#### 2. **Redis Connection Issues**
```bash
# Verificar Redis status
GET /api/monitoring/status/redis

# App funciona sem Redis (graceful fallback)
```

#### 3. **Database Connection**
```bash
# Verificar MongoDB status
GET /api/monitoring/status/database

# Verificar connection string
railway variables
```

### **Emergency Commands**
```bash
# Rollback immediate
railway rollback

# Restart service
railway restart

# View real-time logs
railway logs --follow
```

---

## 📋 **Checklist de Produção**

### **Pré-Deploy**
- [ ] Todas as environment variables configuradas
- [ ] Testes passando
- [ ] Security audit limpo
- [ ] Backup realizado

### **Pós-Deploy**
- [ ] Health check OK
- [ ] Monitoring funcionando
- [ ] Logs sem erros
- [ ] Performance OK

### **Monitoramento Contínuo**
- [ ] Verificar logs diários
- [ ] Monitorar métricas de performance
- [ ] Verificar status de backups
- [ ] Revisar security events

---

## 📞 **Suporte**

### **Recursos**
- **Railway Docs**: https://docs.railway.app
- **GitHub Actions**: https://docs.github.com/actions
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

### **Contatos**
- **Railway Support**: help@railway.app
- **Team Interno**: [Adicionar contatos da equipe]

---

**Data**: 15/07/2025  
**Versão**: 1.0  
**Status**: ✅ Infraestrutura Completa