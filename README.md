# OiPet Saúde 🐾

Aplicativo multiplataforma de gestão de saúde e alimentação para pets, integrado ao ecossistema da empresa OiPet.

## 🏗️ Arquitetura

```
oipet-saude/
├── backend/       # API Node.js + Express + MongoDB
├── mobile/        # React Native (iOS/Android)
├── web/           # React.js web app
├── admin/         # Painel administrativo
├── shared/        # Tipos e utilitários compartilhados
└── docs/          # Documentação
```

## 🎨 Design System

O projeto utiliza **Liquid Glass** inspirado no ecosistema Apple, com elementos translúcidos e modernos.

### Cores Oficiais OiPet
- **Coral**: #E85A5A
- **Teal**: #5AA3A3

### Glass Effects
- Blur: 21.8%
- Translucency: 50%
- Border radius: 16px

## 🚀 Quick Start

```bash
# Instalar dependências
npm run install:all

# Desenvolvimento
npm run dev

# Testes
npm run test

# Build
npm run build
```

## 🛠️ Stack Tecnológica

### Backend
- Node.js + Express + TypeScript
- MongoDB + Redis
- JWT Authentication
- Railway Deploy

### Mobile
- React Native
- Redux Toolkit
- React Navigation
- Victory Charts

### Web/Admin
- React.js + TypeScript
- Material-UI + Glass Components
- Chart.js
- Vite

## 📱 Funcionalidades

### Para Usuários
- Monitoramento de saúde do pet
- Escaneamento de alimentos
- Gráficos de progresso
- Integração com e-commerce OiPet

### Para Administradores
- Dashboard com analytics
- Gestão de usuários
- Relatórios avançados
- Sistema de notificações

## 🔧 Configuração

1. **Backend**: Configurar MongoDB e Redis no Railway
2. **Mobile**: Configurar React Native environment
3. **Web/Admin**: Configurar variáveis de ambiente

## 📊 Roadmap

- **Fase 1**: MVP com health dashboard (3 meses)
- **Fase 2**: Funcionalidades avançadas (2 meses)
- **Fase 3**: IA e expansão (2 meses)

## 🤝 Contribuição

Siga as convenções definidas no `CLAUDE.md` e utilize o protocolo de trabalho estabelecido.

## 📄 Documentação

- [CLAUDE.md](./CLAUDE.md) - Guia técnico completo
- [PLANNING.md](./PLANNING.md) - Planejamento estratégico
- [TASKS.md](./TASKS.md) - Lista de tarefas

---

**Desenvolvido com ❤️ pela equipe OiPet**