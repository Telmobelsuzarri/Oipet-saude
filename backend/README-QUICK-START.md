# 🚀 OiPet Saúde Backend - Quick Start

## Iniciando o Servidor

### Opção 1: Com MongoDB Atlas (Recomendado)
```bash
npm run dev
```

### Opção 2: Com MongoDB em Memória
```bash
npx ts-node -r tsconfig-paths/register src/dev-server.ts
```

## Status do Servidor

✅ **Servidor configurado e funcionando!**
- **Porta**: 3001
- **MongoDB**: Atlas conectado
- **Endpoints principais**:
  - `GET /health` - Health check
  - `POST /api/auth/login` - Login
  - `POST /api/auth/register` - Registro
  - `GET /api/pets` - Listar pets
  - `POST /api/pets` - Criar pet
  - `GET /api-docs` - Documentação Swagger

## Configuração do .env

O arquivo `.env` já está configurado com:
- MongoDB Atlas connection string
- JWT secrets
- CORS para localhost:3000

## Testando a API

### Health Check
```bash
curl http://localhost:3001/health
```

### Criar usuário de teste
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@test.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456"}'
```

## Correções Aplicadas

✅ **TypeScript paths configurados**
✅ **MongoDB Atlas conectado**
✅ **Serviços simplificados criados**
✅ **Erros de compilação corrigidos**

## Próximos Passos

1. Frontend já está integrado com a API
2. Modal de adicionar pet funcionando
3. Dashboard pronto para receber dados reais