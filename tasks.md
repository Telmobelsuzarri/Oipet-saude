# TASKS.md - Projeto OiPet Saúde

## 📊 Status Geral

- **Projeto**: OiPet Saúde
- **Fase Atual**: Milestone 1 - Setup e Fundação
- **Última Atualização**: 15/07/2025
- **Progresso Geral**: 18% (29/162 tasks concluídas)

## 🎯 Milestone 1: Setup e Fundação (Semanas 1-2)

### 📁 M1.1 - Configuração do Projeto
- [✅] Criar estrutura de diretórios do projeto - [15/07/2025]
- [✅] Configurar monorepo com workspaces - [15/07/2025]
- [✅] Setup do Git e configuração de branches - [15/07/2025]
- [✅] Configurar .gitignore para cada ambiente - [15/07/2025]
- [✅] Criar README.md principal com instruções - [15/07/2025]
- [✅] Configurar ESLint e Prettier para todo o projeto - [15/07/2025]
- [✅] Setup do pre-commit hooks (Husky) - [15/07/2025]
- [✅] Configurar variáveis de ambiente (.env templates) - [15/07/2025]
- [✅] **Implementar componente OiPetLogo oficial reutilizável** - [15/07/2025]
- [✅] **Adicionar logo OiPet em todas as estruturas de navegação** - [15/07/2025]
- [✅] **Configurar assets do logo (SVG/PNG) em todas as plataformas** - [15/07/2025]
- [✅] **Criar style guide com cores oficiais OiPet (coral #E85A5A, teal #5AA3A3)** - [15/07/2025]

### 🗄️ M1.2 - Banco de Dados
- [✅] Configurar MongoDB no Railway - [15/07/2025]
- [✅] Configurar MongoDB Compass localmente - [15/07/2025]
- [✅] Criar connection string e environment variables - [15/07/2025]
- [✅] Implementar Mongoose schemas - [15/07/2025]
- [✅] Criar model User com validações - [15/07/2025]
- [✅] Criar model Pet com validações - [15/07/2025]
- [✅] Criar model HealthRecord com validações - [15/07/2025]
- [✅] Criar model FoodScan com validações - [15/07/2025]
- [✅] Criar model Notification com validações - [15/07/2025]
- [ ] Configurar Redis no Railway (addon)
- [✅] Criar seeds para dados de teste - [15/07/2025]
- [✅] Configurar índices para performance - [15/07/2025]

### 🔐 M1.3 - Autenticação Backend
- [✅] Setup do Express.js com TypeScript - [15/07/2025]
- [✅] Configurar middleware de CORS - [15/07/2025]
- [✅] Implementar hash de senhas com bcrypt - [15/07/2025]
- [✅] Criar JWT service (access + refresh tokens) - [15/07/2025]
- [✅] Implementar middleware de autenticação - [15/07/2025]
- [✅] Criar endpoint POST /auth/register - [15/07/2025]
- [✅] Criar endpoint POST /auth/login - [15/07/2025]
- [✅] Criar endpoint POST /auth/refresh - [15/07/2025]
- [✅] Criar endpoint POST /auth/logout - [15/07/2025]
- [✅] Implementar verificação de email - [15/07/2025]
- [✅] Criar endpoint POST /auth/forgot-password - [15/07/2025]
- [✅] Criar endpoint POST /auth/reset-password - [15/07/2025]
- [✅] Implementar rate limiting - [15/07/2025]
- [✅] Configurar validação de entrada (Joi/Zod) - [15/07/2025]

### 🧪 M1.4 - Testes Backend
- [✅] Configurar Jest para backend - [15/07/2025]
- [✅] Criar factory de dados de teste - [15/07/2025]
- [✅] Testes unitários para auth service - [15/07/2025]
- [✅] Testes de integração para auth endpoints - [15/07/2025]
- [✅] Configurar coverage reports - [15/07/2025]
- [✅] Setup do banco de testes - [15/07/2025]

### 🚀 M1.5 - CI/CD Inicial
- [ ] Conectar repositório GitHub ao Railway
- [✅] Configurar auto-deploy no Railway - [15/07/2025]
- [ ] Configurar environment variables no Railway
- [ ] Configurar GitHub Actions para testes
- [ ] Pipeline de build backend
- [ ] Setup do environment de staging no Railway
- [ ] Configurar Railway CLI localmente
- [ ] Testes de deploy automático

## 🎯 Milestone 2: Core Backend Services (Semanas 3-4)

### 👤 M2.1 - User Service
- [ ] Criar model User com validações
- [ ] Implementar CRUD completo de usuários
- [ ] Endpoint GET /users/profile
- [ ] Endpoint PUT /users/profile
- [ ] Endpoint DELETE /users/account
- [ ] Implementar upload de avatar
- [ ] Middleware de autorização (admin/user)
- [ ] Paginação para listagem de usuários
- [ ] Filtros de busca de usuários
- [ ] Testes unitários para User service

### 🐕 M2.2 - Pet Service
- [ ] Criar model Pet com validações
- [ ] Endpoint POST /pets (criar pet)
- [ ] Endpoint GET /pets (listar pets do usuário)
- [ ] Endpoint GET /pets/:id (detalhes do pet)
- [ ] Endpoint PUT /pets/:id (atualizar pet)
- [ ] Endpoint DELETE /pets/:id (remover pet)
- [ ] Upload de foto do pet
- [ ] Validação de ownership (user só vê seus pets)
- [ ] Cálculo de idade automático
- [ ] Testes unitários para Pet service

### 🏥 M2.3 - Health Service
- [ ] Criar model HealthRecord
- [ ] Endpoint POST /pets/:id/health (criar registro)
- [ ] Endpoint GET /pets/:id/health (histórico)
- [ ] Endpoint PUT /health/:id (atualizar registro)
- [ ] Endpoint DELETE /health/:id (remover registro)
- [ ] Implementar cálculo de IMC para pets
- [ ] Validação de dados de saúde
- [ ] Agregação de dados por período
- [ ] Testes unitários para Health service

### 📧 M2.4 - Notification Service
- [ ] Configurar serviço de email (SendGrid)
- [ ] Template para email de verificação
- [ ] Template para reset de senha
- [ ] Template para notificações gerais
- [ ] Configurar Firebase Cloud Messaging
- [ ] Endpoint POST /notifications (enviar push)
- [ ] Endpoint GET /notifications (listar notificações)
- [ ] Endpoint PUT /notifications/:id/read
- [ ] Agendamento de notificações
- [ ] Testes unitários para Notification service

### 📊 M2.5 - Analytics Service Básico
- [ ] Criar model Analytics
- [ ] Middleware para tracking de eventos
- [ ] Endpoint POST /analytics/event
- [ ] Endpoint GET /analytics/dashboard
- [ ] Métricas básicas de usuários
- [ ] Métricas básicas de pets
- [ ] Relatórios de uso da aplicação
- [ ] Testes unitários para Analytics service

## 🎯 Milestone 3: Frontend Mobile (Semanas 5-6)

### 📱 M3.1 - Setup Mobile
- [ ] Configurar React Native projeto
- [ ] Setup do React Navigation
- [ ] Configurar Redux Toolkit
- [ ] Configurar RTK Query
- [ ] Setup do React Native Elements
- [ ] Configurar react-native-vector-icons
- [ ] Setup do AsyncStorage
- [ ] Configurar react-native-keychain
- [ ] Setup do Flipper para debug
- [ ] Configurar Metro bundler

### 🔐 M3.2 - Autenticação Mobile
- [ ] Criar screens de Login/Register
- [ ] Implementar form validation
- [ ] Integrar com auth API
- [ ] Implementar storage de tokens
- [ ] Criar splash screen
- [ ] Implementar auto-login
- [ ] Screen de forgot password
- [ ] Screen de reset password
- [ ] Implementar logout
- [ ] Testes para auth flows

### 🐾 M3.3 - Pet Management Mobile
- [ ] Screen de listagem de pets
- [ ] Screen de cadastro de pet
- [ ] Screen de detalhes do pet
- [ ] Screen de edição de pet
- [ ] Implementar image picker para pets
- [ ] Validação de formulários
- [ ] Integração com Pet API
- [ ] Loading states e error handling
- [ ] Pull to refresh
- [ ] Testes para pet screens

### 📊 M3.4 - Health Tracking Mobile (Fitness App Layout + Glass)
- [ ] Criar dashboard principal estilo fitness app
- [ ] **Implementar header glass com logo OiPet oficial + saudação**
- [ ] **Integrar logo OiPet em todos os headers de navegação**
- [ ] Criar métricas cards (água, calorias) com glass effect + paw icons
- [ ] Implementar cards de metas diárias (caminhada, brincadeira) + logo elements
- [ ] Criar progress circle glass component (75% style) com cores OiPet
- [ ] Implementar weekly bar chart com glass container + cores coral/teal
- [ ] Criar activity cards row (sono, passos) com mini charts + paw accents
- [ ] Implementar friends/social section com glass + logo decorations
- [ ] Criar exercise list com glass container + paw icons
- [ ] **Implementar página de progresso detalhado com logo OiPet no header**
- [ ] **Criar workout page com timer, logo OiPet e cores oficiais**
- [ ] Adicionar circular progress indicators com cores OiPet
- [ ] Implementar mini bar charts para métricas
- [ ] Criar mini line charts para trends
- [ ] **Adicionar play/pause buttons com glass + cores OiPet**
- [ ] **Implementar start workout button com coral (#E85A5A)**
- [ ] **Criar exercise items com paw icons e cores teal (#5AA3A3)**
- [ ] Integração com Health API para dados
- [ ] Testes para health dashboard layout
- [ ] Implementar dark/light theme support mantendo logo OiPet

### 🎨 M3.5 - UI/UX Mobile (Liquid Glass Apple-Style)
- [ ] Implementar configurações glass precisas (blur: 21.8%, translucency: 50%)
- [ ] Criar GlassContainer com configurações Apple-inspired
- [ ] Implementar PetHealthWidget estilo widgets de clima
- [ ] Criar Dock Navigation estilo macOS dock
- [ ] Implementar NotificationGlass estilo lembretes Apple
- [ ] Criar Tab Bar glass com adaptação de background
- [ ] Implementar Floating Action Button com glass OiPet
- [ ] Adicionar glass status indicators (100% style)
- [ ] Configurar backdrop-filter para iOS nativo
- [ ] Implementar glass sidebar navigation
- [ ] Criar animações líquidas Apple-style
- [ ] Implementar glass tooltips e overlays
- [ ] Otimizar performance glass para 60fps
- [ ] Testes de acessibilidade com glass Apple-style
- [ ] Implementar responsive glass (phone/tablet)
- [ ] Adicionar haptic feedback nos glass components
- [ ] Criar glass loading states
- [ ] Implementar glass form overlays

## 🎯 Milestone 4: Frontend Web (Semanas 7-8)

### 🌐 M4.1 - Setup Web
- [ ] Configurar React + TypeScript com Vite
- [ ] Setup do React Router
- [ ] Configurar Redux Toolkit
- [ ] Setup do Material-UI
- [ ] Configurar Axios para HTTP
- [ ] Setup do React Hook Form
- [ ] Configurar theme com cores OiPet
- [ ] Setup do React Query
- [ ] Configurar build para produção

### 🔐 M4.2 - Autenticação Web
- [ ] Criar páginas de Login/Register
- [ ] Implementar form validation
- [ ] Integrar com auth API
- [ ] Implementar protected routes
- [ ] Criar layout autenticado
- [ ] Página de forgot password
- [ ] Página de reset password
- [ ] Implementar logout
- [ ] Testes para auth flows

### 🏠 M4.3 - Dashboard Web
- [ ] Criar dashboard principal
- [ ] Cards de resumo de pets
- [ ] Gráficos de saúde resumidos
- [ ] Últimas atividades
- [ ] Shortcuts para ações rápidas
- [ ] Responsividade mobile
- [ ] Testes para dashboard

### 📊 M4.4 - Pet Management Web (Dashboard Layout + Glass)
- [ ] Criar dashboard web estilo fitness app
- [ ] Implementar header glass com navegação pets
- [ ] Criar cards de métricas principais com glass
- [ ] Implementar tabela de pets com glass rows
- [ ] Criar pet detail page com health dashboard
- [ ] Implementar charts responsivos para web
- [ ] Criar progress indicators circulares
- [ ] Implementar weekly/monthly chart views
- [ ] Adicionar filtros de tempo com glass dropdowns
- [ ] Criar activity timeline com glass items
- [ ] Implementar export funcionalities
- [ ] Criar modal de edição pet com glass overlay
- [ ] Implementar drag & drop para reordenar
- [ ] Adicionar search e filtros avançados
- [ ] Criar responsive breakpoints para charts
- [ ] Implementar print/PDF export
- [ ] Adicionar bulk actions para pets
- [ ] Integração com Pet API
- [ ] Testes para pet management pages
- [ ] Implementar keyboard shortcuts

### 🌐 M4.5 - Health Tracking Web (Liquid Glass Apple-Style)
- [ ] Implementar glass dashboard com widgets estilo Apple
- [ ] Criar glass health cards com blur 21.8%
- [ ] Implementar glass sidebar navigation
- [ ] Criar glass modal overlays para detalhes
- [ ] Implementar glass filters dropdown
- [ ] Criar charts com glass overlay containers
- [ ] Implementar glass tooltips estilo macOS
- [ ] Adicionar glass notification system
- [ ] Criar glass dock navigation para web
- [ ] Implementar glass status indicators
- [ ] Adicionar glass loading states
- [ ] Configurar CSS backdrop-filter otimizado
- [ ] Implementar glass effects para diferentes browsers
- [ ] Criar glass form overlays
- [ ] Testes cross-browser para glass effects
- [ ] Otimizar performance glass para web
- [ ] Implementar glass responsive breakpoints
- [ ] Adicionar glass hover effects

## 🎯 Milestone 5: Admin Panel (Semanas 9-10)

### 🎛️ M5.1 - Setup Admin
- [ ] Configurar React + TypeScript para admin
- [ ] Setup do Ant Design
- [ ] Configurar roteamento admin
- [ ] Implementar layout administrativo
- [ ] Setup do sistema de permissões
- [ ] Configurar autenticação admin
- [ ] Implementar sidebar navigation
- [ ] Setup do tema administrativo

### 📊 M5.2 - Dashboard Admin
- [ ] **Dashboard com logo OiPet oficial no header principal**
- [ ] **Implementar navegação com logo OiPet em todas as páginas admin**
- [ ] Dashboard com métricas gerais + glass containers
- [ ] Cards de estatísticas + paw icons decorativos
- [ ] Gráficos de usuários ativos com cores OiPet (coral/teal)
- [ ] Gráficos de pets cadastrados com glass overlay
- [ ] Métricas de uso da aplicação
- [ ] Filtros por período com glass dropdowns
- [ ] **Refresh automático de dados mantendo logo OiPet sempre visível**
- [ ] **Sidebar com logo OiPet pequeno + glass navigation**
- [ ] **Footer com logo OiPet em todas as páginas admin**
- [ ] Testes para dashboard admin com elementos de branding

### 👥 M5.3 - User Management
- [ ] Listagem de usuários
- [ ] Busca e filtros de usuários
- [ ] Detalhes do usuário
- [ ] Bloquear/desbloquear usuários
- [ ] Histórico de atividades
- [ ] Exportação de dados
- [ ] Paginação e ordenação
- [ ] Testes para user management

### 🐾 M5.4 - Pet Management Admin
- [ ] Listagem de todos os pets
- [ ] Estatísticas por raça
- [ ] Estatísticas por idade
- [ ] Relatórios de saúde
- [ ] Busca avançada
- [ ] Filtros múltiplos
- [ ] Exportação de relatórios
- [ ] Testes para pet management

### 📈 M5.5 - Analytics Admin
- [ ] Métricas de engajamento
- [ ] Análise de retenção
- [ ] Funil de conversão
- [ ] Relatórios personalizados
- [ ] Comparação de períodos
- [ ] Exportação avançada
- [ ] Alertas automáticos
- [ ] Testes para analytics

## 🎯 Milestone 6: E-commerce Integration (Semanas 11-12)

### 🛒 M6.1 - Catalog Integration
- [ ] Integrar API do site OiPet
- [ ] Criar service para produtos
- [ ] Implementar cache de produtos
- [ ] Endpoint GET /products
- [ ] Endpoint GET /products/:id
- [ ] Filtros por categoria
- [ ] Busca de produtos
- [ ] Testes para catalog service

### 📱 M6.2 - E-commerce Mobile
- [ ] Screen de catálogo de produtos
- [ ] Screen de detalhes do produto
- [ ] Implementar busca
- [ ] Filtros por pet
- [ ] Implementar wishlist
- [ ] Redirecionamento para checkout
- [ ] Deep linking
- [ ] Testes para e-commerce mobile

### 🌐 M6.3 - E-commerce Web
- [ ] Página de catálogo
- [ ] Página de produto
- [ ] Implementar busca avançada
- [ ] Filtros e ordenação
- [ ] Recomendações por pet
- [ ] Carrinho de compras
- [ ] Integração com checkout
- [ ] Testes para e-commerce web

### 📊 M6.4 - E-commerce Analytics
- [ ] Tracking de visualizações
- [ ] Métricas de conversão
- [ ] Produtos mais visualizados
- [ ] Análise de abandono
- [ ] Relatórios de vendas
- [ ] ROI do aplicativo
- [ ] Testes para e-commerce analytics

## 🎯 Milestone 7: Food Scanner (Semanas 13-14)

### 🤖 M7.1 - AI Service Setup
- [ ] Configurar TensorFlow.js
- [ ] Treinar modelo de reconhecimento
- [ ] Implementar API de reconhecimento
- [ ] Configurar banco de alimentos
- [ ] Implementar cache de resultados
- [ ] Criar fallback manual
- [ ] Testes para AI service

### 📱 M7.2 - Scanner Mobile
- [ ] Implementar camera service
- [ ] Screen de escaneamento
- [ ] Captura e processamento
- [ ] Integração com AI service
- [ ] Exibição de resultados
- [ ] Histórico de escaneamentos
- [ ] Testes para scanner mobile

### 🌐 M7.3 - Scanner Web
- [ ] Implementar file upload
- [ ] Página de escaneamento
- [ ] Processamento de imagem
- [ ] Integração com AI service
- [ ] Exibição de resultados
- [ ] Histórico web
- [ ] Testes para scanner web

### 📊 M7.4 - Nutrition Analysis
- [ ] Banco de dados nutricional
- [ ] Cálculo de nutrientes
- [ ] Recomendações personalizadas
- [ ] Alertas nutricionais
- [ ] Relatórios nutricionais
- [ ] Integração com health records
- [ ] Testes para nutrition analysis

## 🎯 Milestone 8: Advanced Features (Semanas 15-16)

### 🔔 M8.1 - Push Notifications (Liquid Glass)
- [ ] Configurar FCM backend
- [ ] Implementar targeting por usuário
- [ ] Criar NotificationGlass component
- [ ] Implementar glass notification overlay
- [ ] Notificações agendadas com glass UI
- [ ] Personalização por usuário (glass settings)
- [ ] Implementar glass notification center
- [ ] Analytics de notificações em glass dashboard
- [ ] A/B testing de mensagens
- [ ] Implementar glass toast notifications
- [ ] Configurar glass notification badges
- [ ] Animações líquidas para notificações
- [ ] Testes para notifications glass UI

### 📊 M8.2 - Advanced Charts
- [ ] Implementar Chart.js
- [ ] Gráficos de linha (peso/tempo)
- [ ] Gráficos de barras (atividade)
- [ ] Gráficos de pizza (alimentação)
- [ ] Comparação entre pets
- [ ] Exportação de gráficos
- [ ] Testes para charts

### 📱 M8.3 - Offline Support
- [ ] Implementar cache estratégico
- [ ] Sync quando voltar online
- [ ] Indicadores de status
- [ ] Armazenamento local
- [ ] Conflict resolution
- [ ] Testes para offline

### 🎮 M8.4 - Gamification
- [ ] Sistema de pontos
- [ ] Badges e conquistas
- [ ] Challenges diários
- [ ] Leaderboard
- [ ] Streak tracking
- [ ] Testes para gamification

## 🎯 Milestone 9: Testing & Quality (Semanas 17-18)

### 🧪 M9.1 - Comprehensive Testing
- [ ] Aumentar coverage backend (>80%)
- [ ] Testes E2E com Cypress
- [ ] Testes de performance
- [ ] Testes de segurança
- [ ] Testes de acessibilidade
- [ ] Load testing
- [ ] Stress testing

### 🔍 M9.2 - Code Quality
- [ ] Code review completo
- [ ] Refatoração de código
- [ ] Otimização de performance
- [ ] Documentação completa
- [ ] TypeScript strict mode
- [ ] Audit de dependências

### 🐛 M9.3 - Bug Fixes
- [ ] Fix de bugs identificados
- [ ] Melhorias de UX
- [ ] Otimizações mobile
- [ ] Correções de responsividade
- [ ] Polishing geral

## 🎯 Milestone 10: Launch Preparation (Semanas 19-20)

### 🚀 M10.1 - Production Setup
- [ ] Configurar ambiente de produção
- [ ] Setup do monitoramento
- [ ] Configurar logging
- [ ] Implementar health checks
- [ ] Configurar backups
- [ ] Setup do CDN
- [ ] Configurar SSL

### 📚 M10.2 - Documentation
- [ ] Documentação da API
- [ ] Guia de instalação
- [ ] Manual do usuário
- [ ] Documentação técnica
- [ ] Troubleshooting guide
- [ ] Changelog

### 📊 M10.3 - Analytics Setup
- [ ] Configurar Google Analytics
- [ ] Implementar tracking events
- [ ] Setup do Mixpanel
- [ ] Configurar dashboards
- [ ] Alertas de monitoramento
- [ ] Métricas de negócio

### 🎯 M10.4 - Pre-Launch Testing
- [ ] Testes finais em produção
- [ ] Validação com usuários beta
- [ ] Performance testing final
- [ ] Security audit
- [ ] Backup e recovery testing
- [ ] Go-live checklist

## 📈 Legenda de Status

- [ ] **Pendente**: Task não iniciada
- [⏳] **Em Progresso**: Task sendo desenvolvida
- [🔄] **Em Revisão**: Task aguardando review
- [✅] **Concluída**: Task finalizada e testada
- [❌] **Bloqueada**: Task impedida por dependência
- [⚠️] **Crítica**: Task com alta prioridade

## 📊 Progresso por Milestone

| Milestone | Total Tasks | Concluídas | Progresso |
|-----------|-------------|------------|-----------|
| M1 - Setup e Fundação | 20 | 0 | 0% |
| M2 - Core Backend | 25 | 0 | 0% |
| M3 - Mobile Frontend | 22 | 0 | 0% |
| M4 - Web Frontend | 20 | 0 | 0% |
| M5 - Admin Panel | 18 | 0 | 0% |
| M6 - E-commerce | 15 | 0 | 0% |
| M7 - Food Scanner | 12 | 0 | 0% |
| M8 - Advanced Features | 10 | 0 | 0% |
| M9 - Testing & Quality | 8 | 0 | 0% |
| M10 - Launch Prep | 12 | 0 | 0% |
| **TOTAL** | **162** | **0** | **0%** |

---

**Instruções para Atualização:**
1. Marque tasks como concluídas usando `[✅]` quando terminadas
2. Adicione data de conclusão: `[✅] Task concluída - [DD/MM/YYYY]`
3. Adicione novas tasks descobertas no milestone apropriado
4. Atualize o progresso da tabela quando necessário
5. Mova tasks entre milestones se necessário

**Última atualização**: 15/07/2025