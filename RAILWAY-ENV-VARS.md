# Variáveis de Ambiente para Railway

## 🚀 Configuração Rápida

### 1. Acesse o Railway Dashboard
- URL: https://railway.app/dashboard
- Crie um novo projeto: "New Project"
- Conecte o GitHub: "Deploy from GitHub repo"
- Selecione: `Telmobelsuzarri/Oipet-saude`
- **Root Directory**: `backend`

### 2. Configurar Build Settings
```
Build Command: npm run build
Start Command: npm run start
Root Directory: backend
```

### 3. Adicionar Variáveis de Ambiente

Cole estas variáveis no Railway Dashboard > Variables:

```bash
# Application
NODE_ENV=production
PORT=$PORT

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://telmobelsuzarri:oipet2025@cluster0.5vmh6ki.mongodb.net/oipet-saude?retryWrites=true&w=majority&appName=Cluster0

# JWT - Use as chaves geradas abaixo
JWT_SECRET=825e4b217ff32cdb16868491caca7291ce56c9ad48e931a4057eed0c0ea9887b4bb2eb193b5909dd8bce1a052de69ced35d7ceb0c8ae2a3f5f6488f56ba8e3fc
JWT_REFRESH_SECRET=70e89c85079bf10531330d854df99308485091f53cea198767be2487b603c9aed76cf0e3aa9dfc53e0701ec729705b442431ff1009e194807be10c7688bf2c0f
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

### 4. Configurar MongoDB Atlas

1. **Acesse**: https://cloud.mongodb.com/
2. **Crie um cluster grátis**
3. **Configurar usuário**:
   - Username: `oipet-user`
   - Password: `[GERE_UMA_SENHA_SEGURA]`
4. **Liberar IP**: `0.0.0.0/0` (anywhere)
5. **Obter connection string**: Connect → Drivers
6. **Substituir na variável**: `MONGODB_URI`

### 5. Configurar Redis (Opcional)

#### Opção A: Redis Cloud (Recomendado)
1. **Acesse**: https://redis.com/try-free/
2. **Crie database grátis**
3. **Adicione variável**: `REDIS_URL=redis://default:password@host:port`

#### Opção B: Railway Plugin
1. **No Railway**: Add Service → Database → Redis
2. **Conecta automaticamente**

### 6. Testar Deploy

Após configuração, a API estará disponível em:
- **Base URL**: https://oipet-saude-production.up.railway.app
- **Health Check**: https://oipet-saude-production.up.railway.app/health
- **API Docs**: https://oipet-saude-production.up.railway.app/api-docs

### 7. Endpoints Principais

```bash
# Teste de saúde
GET /health

# Registro de usuário
POST /api/auth/register

# Login
POST /api/auth/login

# Lista de pets (autenticado)
GET /api/pets
```

---

## 📝 Checklist de Configuração

- [ ] Projeto conectado ao GitHub
- [ ] Root directory configurado como `backend`
- [ ] Build e start commands configurados
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] MongoDB Atlas configurado
- [ ] Redis configurado (opcional)
- [ ] Deploy realizado com sucesso
- [ ] Endpoints testados

## 🔧 Troubleshooting

### Erro de Build
- Verifique se o `package.json` tem os scripts corretos
- Verifique se o `tsconfig.json` está correto
- Verifique se as dependências estão instaladas

### Erro de Conexão
- Verifique se `MONGODB_URI` está correto
- Verifique se o IP está liberado no MongoDB Atlas
- Verifique se usuário/senha estão corretos

### Erro de Variáveis
- Verifique se todas as variáveis obrigatórias estão definidas
- Especialmente: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`

---

**Status**: ✅ Configuração completa
**Próximo**: Testar endpoints e conectar frontend