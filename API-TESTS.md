# Testes da API OiPet Saúde

## 🔗 URL da API
**Base URL**: `https://SEU_PROJETO.up.railway.app`

## 📋 Testes Básicos

### 1. Health Check
```bash
# Teste de saúde da API
curl https://SEU_PROJETO.up.railway.app/health

# Resposta esperada:
{
  "success": true,
  "message": "API funcionando corretamente",
  "timestamp": "2025-07-15T...",
  "environment": "production"
}
```

### 2. API Documentation
```bash
# Documentação Swagger
https://SEU_PROJETO.up.railway.app/api-docs
```

### 3. Registro de Usuário
```bash
curl -X POST https://SEU_PROJETO.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "123456",
    "phone": "(11) 99999-9999"
  }'

# Resposta esperada:
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@teste.com"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### 4. Login
```bash
curl -X POST https://SEU_PROJETO.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "123456"
  }'

# Resposta esperada:
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### 5. Listar Pets (Autenticado)
```bash
# Substitua TOKEN_JWT pelo token obtido no login
curl -X GET https://SEU_PROJETO.up.railway.app/api/pets \
  -H "Authorization: Bearer TOKEN_JWT"

# Resposta esperada:
{
  "success": true,
  "data": {
    "pets": [],
    "total": 0,
    "page": 1,
    "totalPages": 1
  }
}
```

### 6. Criar Pet
```bash
curl -X POST https://SEU_PROJETO.up.railway.app/api/pets \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rex",
    "species": "dog",
    "breed": "Labrador",
    "birthDate": "2020-01-15",
    "weight": 25.5,
    "height": 60,
    "gender": "male"
  }'

# Resposta esperada:
{
  "success": true,
  "message": "Pet criado com sucesso",
  "data": {
    "pet": {
      "id": "...",
      "name": "Rex",
      "species": "dog",
      "breed": "Labrador",
      "age": 5,
      "weight": 25.5,
      "height": 60,
      "gender": "male"
    }
  }
}
```

## 🔍 Checklist de Testes

### ✅ Testes Básicos
- [ ] Health check responde corretamente
- [ ] API docs carrega em `/api-docs`
- [ ] Registro de usuário funciona
- [ ] Login funciona e retorna tokens
- [ ] Lista pets com autenticação
- [ ] Cria pet com dados válidos

### ✅ Testes de Validação
- [ ] Registro rejeita email inválido
- [ ] Registro rejeita senha curta
- [ ] Login rejeita credenciais inválidas
- [ ] Endpoints protegidos rejeitam sem token
- [ ] Criação de pet rejeita dados inválidos

### ✅ Testes de Integração
- [ ] MongoDB conecta corretamente
- [ ] Dados são salvos no banco
- [ ] Busca por usuário funciona
- [ ] Relacionamento user-pet funciona
- [ ] Tokens JWT são válidos

## 🐛 Problemas Comuns

### Erro 500 - Internal Server Error
```bash
# Verifique logs no Railway:
railway logs --tail

# Possíveis causas:
1. MongoDB connection string incorreta
2. Variável de ambiente faltando
3. Erro no código TypeScript
```

### Erro 401 - Unauthorized
```bash
# Verifique se:
1. Token JWT está correto
2. Header Authorization está no formato: "Bearer TOKEN"
3. Token não expirou (1h de vida)
```

### Erro 400 - Bad Request
```bash
# Verifique se:
1. JSON está bem formatado
2. Campos obrigatórios estão presentes
3. Tipos de dados estão corretos
```

## 📊 Monitoramento

### Logs
```bash
# Ver logs em tempo real
railway logs --tail

# Ver logs específicos
railway logs --filter "ERROR"
```

### Métricas
- **CPU Usage**: Railway Dashboard → Metrics
- **Memory Usage**: Railway Dashboard → Metrics
- **Response Time**: Teste com curl -w "@curl-format.txt"
- **Error Rate**: Monitore logs de erro

## 🚀 Próximos Passos

Após todos os testes passarem:

1. ✅ **Milestone 1 COMPLETO**
2. 🔄 **Iniciar Milestone 2**: Core Backend Services
3. 📱 **Preparar Mobile**: React Native setup
4. 🌐 **Preparar Web**: React.js setup
5. 🎛️ **Preparar Admin**: Admin dashboard

---

**Status**: 🧪 Em teste  
**Próximo**: Validar todos os endpoints