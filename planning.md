# PLANNING.md - Projeto OiPet Saúde

## 📋 Status do Projeto

- **Fase atual**: Planejamento e Setup Inicial
- **Versão**: 0.1.0
- **Início**: 15/07/2025
- **Prazo estimado MVP**: 15/10/2025 (3 meses)
- **Última atualização**: 15/07/2025

## 🎯 Visão do Produto

### Visão Geral
Criar um ecossistema digital completo para monitoramento de saúde e bem-estar de pets, integrado ao e-commerce OiPet, proporcionando aos tutores uma experiência unificada de cuidado animal e acesso facilitado a produtos especializados.

### Missão
Facilitar o cuidado diário com pets através de tecnologia intuitiva, oferecendo ferramentas de monitoramento de saúde, análise nutricional e conexão direta com produtos de qualidade OiPet.

### Objetivos Estratégicos
1. **Engajamento**: Criar uma base de usuários ativos que utilizem o app diariamente
2. **Conversão**: Aumentar as vendas do e-commerce OiPet através do app
3. **Fidelização**: Estabelecer relacionamento duradouro com tutores de pets
4. **Dados**: Coletar insights sobre comportamento e necessidades dos pets
5. **Expansão**: Criar base para futuros produtos e serviços

### Proposta de Valor
- **Para Tutores**: Monitoramento completo da saúde do pet em um só lugar
- **Para Pets**: Cuidado mais preciso e personalizado
- **Para OiPet**: Canal direto de vendas e relacionamento com clientes
- **Para Veterinários**: (Fase futura) Dados precisos para consultas

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Mobile App    │    Web App      │      Admin Panel           │
│ (iOS/Android)   │   (React/Vue)   │     (React/Vue)             │
│                 │                 │                             │
│ - User Portal   │ - User Portal   │ - Analytics Dashboard       │
│ - Pet Health    │ - Pet Health    │ - User Management           │
│ - Food Scanner  │ - Reports       │ - Content Management        │
│ - E-commerce    │ - E-commerce    │ - Financial Reports         │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                   ┌─────────────────┐
                   │   API GATEWAY   │
                   │                 │
                   │ - Authentication│
                   │ - Rate Limiting │
                   │ - Load Balancing│
                   │ - Request Routing│
                   └─────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Auth Service  │  Core Service   │    Analytics Service        │
│                 │                 │                             │
│ - User Auth     │ - Pet CRUD      │ - Usage Analytics           │
│ - JWT Tokens    │ - Health Records│ - Business Intelligence     │
│ - Permissions   │ - Food Scanning │ - Report Generation         │
│ - 2FA           │ - Notifications │ - Data Export               │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION LAYER                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   File Storage  │   ML Service    │    External APIs            │
│                 │                 │                             │
│ - AWS S3        │ - Image Recognition│ - OiPet E-commerce       │
│ - CloudFront    │ - TensorFlow    │ - Payment Gateway           │
│ - Image Resize  │ - Food Database │ - Email Service             │
│ - Backup        │ - Nutrition API │ - Push Notifications        │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │     Redis       │      Elasticsearch          │
│                 │                 │                             │
│ - User Data     │ - Session Cache │ - Search Index              │
│ - Pet Records   │ - Rate Limiting │ - Analytics Data            │
│ - Health Data   │ - Temp Storage  │ - Logs Aggregation          │
│ - Transactions  │ - Queue Jobs    │ - Real-time Search          │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Fluxo de Dados
```
User Action → Frontend → API Gateway → Backend Service → Database
     ↓              ↓           ↓              ↓            ↓
Analytics ← Response ← Response ← Processing ← Query/Update
```

### Microserviços Planejados
1. **Auth Service**: Autenticação e autorização
2. **User Service**: Gestão de usuários e perfis
3. **Pet Service**: CRUD de pets e relacionamentos
4. **Health Service**: Registros de saúde e monitoramento
5. **Food Service**: Escaneamento e análise nutricional
6. **Notification Service**: Push notifications e emails
7. **Analytics Service**: Métricas e relatórios
8. **E-commerce Service**: Integração com loja OiPet

## 🛠️ Stack Tecnológica

### Backend
```yaml
Framework: Node.js + Express.js (ou NestJS para maior estrutura)
Database: 
  - MongoDB (dados principais - NoSQL flexível)
  - Redis (cache e sessões) - Railway Redis addon
Authentication: JWT + Passport.js
File Upload: Railway Volume Storage (ou AWS S3 se necessário)
Queue: Bull (Redis-based)
Testing: Jest + Supertest
Documentation: Swagger/OpenAPI
Monitoring: Railway Logs + básico metrics
Deployment: Railway (GitHub integration)
```

### Mobile (React Native)
```yaml
Framework: React Native (0.72+)
Navigation: React Navigation 6
State Management: Redux Toolkit + RTK Query
UI Components: React Native Elements ou NativeBase
Camera: react-native-vision-camera
Charts: Victory Native
HTTP Client: Axios
Testing: Jest + React Native Testing Library
Code Quality: ESLint + Prettier
Build: Flipper (debug) + CodePush (updates)
```

### Web Frontend
```yaml
Framework: React.js 18 + TypeScript
Build Tool: Vite
State Management: Redux Toolkit + RTK Query
UI Library: Material-UI (MUI) ou Ant Design
Charts: Chart.js com react-chartjs-2
HTTP Client: Axios
Testing: Jest + React Testing Library
Code Quality: ESLint + Prettier
Deployment: Vercel ou Netlify
```

### Admin Panel
```yaml
Framework: React.js 18 + TypeScript
UI Library: Ant Design Pro
Charts: Recharts + D3.js
Data Grid: AG Grid ou React Table
Export: jsPDF + SheetJS
Real-time: Socket.io (para dashboards)
Testing: Jest + React Testing Library
```

### DevOps & Infrastructure
```yaml
Cloud Provider: Railway (primary) + GitHub
Database: Railway MongoDB + Redis
Containerization: Railway Native (Docker-based)
CI/CD: GitHub Actions → Railway Auto-Deploy
Monitoring: Railway Logs + Metrics Dashboard
File Storage: Railway Volume Storage
Version Control: GitHub
Environment Management: Railway Environment Variables
```

## 🔧 Required Tools

### Desenvolvimento
```bash
# Node.js & Package Managers
Node.js >= 18.0.0
npm >= 8.0.0
yarn >= 1.22.0

# Mobile Development
React Native CLI
Android Studio (Android SDK)
Xcode (iOS - macOS only)
Java JDK 11+
CocoaPods (iOS dependencies)

# Database
MongoDB Compass (GUI)
Redis CLI (local testing)

# Development Tools
Railway CLI
Git
Visual Studio Code (ou IDE similar)
Postman (API testing)
GitHub CLI (opcional)
```

### Extensões VSCode Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "ms-vscode.vscode-json",
    "msjsdiag.debugger-for-chrome",
    "ms-vscode.vscode-node-debug2",
    "ms-python.python",
    "redhat.vscode-yaml",
    "ms-vscode.docker"
  ]
}
```

### Configuração do Ambiente
```bash
# Clone do projeto
git clone [repository-url]
cd oipet-saude

# Install Railway CLI
npm install -g @railway/cli
railway login

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure MongoDB connection string from Railway
npm run dev

# Mobile setup
cd ../mobile
npm install
cd ios && pod install && cd ..
npx react-native run-ios
npx react-native run-android

# Web setup
cd ../web
npm install
npm run dev

# Admin setup
cd ../admin
npm install
npm run dev

# Deploy to Railway
railway deploy
```

## 📊 Arquitetura de Dados

### Modelos Principais
```typescript
// Core Entities
User -> Pet[] -> HealthRecord[]
User -> FoodScan[]
User -> Notification[]
Admin -> Analytics[]
Admin -> Report[]

// Relationships
User (1) -> (N) Pet
Pet (1) -> (N) HealthRecord
User (1) -> (N) FoodScan
Pet (1) -> (N) FoodScan
```

### Estrutura do Banco (MongoDB)
```javascript
// Collections principais
users: {
  _id: ObjectId,
  email: String,
  name: String,
  type: String,
  created_at: Date,
  avatar: String,
  isEmailVerified: Boolean
}

pets: {
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  breed: String,
  species: String,
  birthDate: Date,
  avatar: String,
  currentWeight: Number,
  currentHeight: Number
}

health_records: {
  _id: ObjectId,
  petId: ObjectId,
  date: Date,
  weight: Number,
  height: Number,
  activity: {
    type: String,
    duration: Number,
    intensity: String
  },
  calories: Number,
  notes: String
}

food_scans: {
  _id: ObjectId,
  petId: ObjectId,
  userId: ObjectId,
  imageUrl: String,
  recognizedFood: String,
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  confidence: Number,
  createdAt: Date
}

notifications: {
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: Date
}

analytics: {
  _id: ObjectId,
  userId: ObjectId,
  event: String,
  data: Object,
  timestamp: Date
}
```

## 🔐 Segurança e Compliance

### Autenticação e Autorização
- JWT tokens com refresh mechanism
- Role-based access control (RBAC)
- API rate limiting
- Input validation e sanitization
- SQL injection prevention

### LGPD Compliance
- Consentimento explícito para coleta de dados
- Direito de portabilidade dos dados
- Direito de exclusão (right to be forgotten)
- Logs de auditoria para acesso a dados
- Criptografia de dados sensíveis

### Monitoramento de Segurança
- Logs de autenticação
- Detecção de tentativas de invasão
- Monitoramento de APIs
- Alertas de segurança automáticos

## 🚀 Roadmap de Desenvolvimento

### Fase 1: MVP (Meses 1-3)
**Objetivo**: Health dashboard funcional com glass effects
```
✅ Setup do projeto e estrutura
⏳ Sistema de autenticação completo
⏳ CRUD de usuários e pets
⏳ Health dashboard principal com:
   - Metric cards (água, calorias, sono, passos)
   - Progress circle (75% style)
   - Goal cards (caminhada, brincadeira)
   - Weekly charts básicos
   - Activity timeline
⏳ Integração com e-commerce OiPet
⏳ Painel administrativo com glass dashboard
⏳ Glass components base implementados
⏳ Deploy em staging
```

### Fase 2: Funcionalidades Avançadas (Meses 4-5)
**Objetivo**: Analytics completos e interatividade
```
📋 Escaneamento de alimentos com glass UI
📋 Página de progresso detalhado com:
   - Large progress circle
   - Detailed weekly/monthly charts
   - Comparative analytics
   - Export functionality
📋 Workout/Activity pages com:
   - Timer interface
   - Exercise tracking
   - Progress indicators
📋 Sistema de notificações push com glass effects
📋 Social features (amigos do pet)
📋 Relatórios exportáveis com glass loading
📋 Otimizações de performance glass
📋 Responsive design completo
```

### Fase 3: Inteligência e Expansão (Meses 6-7)
**Objetivo**: IA e gamificação
```
🔮 Recomendações baseadas em dados health
🔮 Gamificação com progress achievements
🔮 Advanced analytics dashboard
🔮 Integração com veterinários
🔮 API pública para parceiros
🔮 Marketplace de serviços
🔮 Machine learning para insights
🔮 Predictive health analytics
```

## 📈 Métricas de Sucesso

### Técnicas
- **Uptime**: 99.9%
- **Response Time**: < 500ms (95% das requests)
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80%

### Produto
- **Usuários ativos**: 1,000 (30 dias após launch)
- **Retenção**: 60% (30 dias)
- **Conversão e-commerce**: 15%
- **NPS**: > 50

### Negócio
- **Aumento vendas**: 20%
- **CAC**: < R$ 30
- **LTV**: > R$ 200
- **ROI**: 300% (12 meses)

## 🧪 Estratégia de Testes

### Tipos de Teste
```
Unit Tests (Jest)
├── Backend Services
├── Utilities Functions
└── React Components

Integration Tests
├── API Endpoints
├── Database Operations
└── External Services

E2E Tests (Cypress)
├── User Flows
├── Admin Workflows
└── Critical Paths

Performance Tests
├── Load Testing (Artillery)
├── Database Performance
└── Mobile Performance
```

### Ambientes de Teste
- **Development**: Local machines
- **Staging**: Produção-like environment
- **QA**: Dedicated testing environment
- **Production**: Monitoring e alerts

## 🎯 Próximos Passos Imediatos

### Semana 1-2: Setup e Fundação
1. **Configuração do repositório e estrutura**
2. **Setup do ambiente de desenvolvimento (MongoDB + Railway)**
3. **Configuração do banco de dados com schemas**
4. **Implementação da autenticação básica**
5. **Setup do CI/CD pipeline com Railway**
6. **Componentes glass base (GlassContainer, GlassButton)**

### Semana 3-4: Core Features + Health Dashboard
1. **CRUD completo de usuários**
2. **CRUD completo de pets**
3. **Health dashboard principal:**
   - Metric cards com glass effects
   - Progress circle component
   - Goal cards com progress bars
   - Weekly chart container
4. **Integração com e-commerce**
5. **Glass components para mobile**
6. **Testes unitários básicos**

### Semana 5-6: Interface Completa + Analytics
1. **Mobile health dashboard completo**
2. **Página de progresso detalhado**
3. **Workout/Activity tracking pages**
4. **Web app responsivo com glass effects**
5. **Painel administrativo com analytics glass**
6. **Charts integrados (Victory Native + Chart.js)**
7. **Integração frontend-backend**
8. **Testes de integração**

### Semana 7-8: Refinamento + Performance
1. **Otimização de performance glass effects**
2. **Responsive design completo**
3. **Social features (amigos do pet)**
4. **Notification system com glass UI**
5. **Export functionality**
6. **Cross-browser testing**
7. **Accessibility improvements**
8. **Load testing e optimizations**

---

**Documento vivo**: Este planejamento será atualizado conforme o progresso do projeto e feedback da equipe.

**Responsável**: Equipe de Desenvolvimento OiPet  
**Revisão**: Semanal  
**Próxima atualização**: 22/07/2025
**Versão**: 2.0 - Health Dashboard + Liquid Glass Integration