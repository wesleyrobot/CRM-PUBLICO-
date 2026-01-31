# 🚀 CRM Público - Sistema de Gestão de Relacionamento com Cliente

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-73.71%25-brightgreen.svg)](https://github.com/wesleyrobot/CRM-PUBLICO-)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Sistema completo de CRM desenvolvido com NestJS, TypeORM e PostgreSQL. Inclui autenticação JWT, RBAC, analytics avançado, rate limiting, health checks e 73.71% de cobertura de testes.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando](#executando)
- [Testes](#testes)
- [Migrations](#migrations)
- [API Documentation](#api-documentation)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Melhorias Sênior](#melhorias-sênior)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Autor](#autor)

---

## 🎯 Sobre o Projeto

CRM completo e profissional para gestão de leads, clientes e empresas. Desenvolvido seguindo as melhores práticas de arquitetura, segurança e qualidade de código.

### ✨ Destaques

- ✅ **73.71% Test Coverage** - 115 testes unitários
- ✅ **Arquitetura Modular** - Clean Code & SOLID
- ✅ **Migrations TypeORM** - Controle total do schema
- ✅ **Rate Limiting** - Proteção contra DDoS
- ✅ **Health Checks** - Pronto para Kubernetes
- ✅ **Response DTOs** - Segurança de dados
- ✅ **Analytics SQL** - 6 queries avançadas

---

## 🚀 Funcionalidades

### Módulos Principais

- **👥 Usuários**
  - CRUD completo
  - Autenticação JWT
  - RBAC (Admin, Gerente, Vendedor)
  - Hash de senhas com bcrypt

- **🏢 Empresas**
  - Gestão de empresas
  - Relacionamento com leads
  - Paginação e filtros

- **📊 Leads**
  - Gestão de leads
  - Status workflow (novo → qualificado → convertido)
  - Conversão para clientes
  - Analytics avançado

- **👤 Clientes**
  - Gestão de clientes
  - Histórico de conversões
  - Relacionamento com empresas

- **📈 Analytics**
  - Empresas com contagem de leads
  - Performance de usuários
  - Distribuição por status
  - Top empresas
  - Tendências mensais
  - Análise de distribuição

- **🔌 External**
  - Integração com APIs externas
  - Logging de requisições

### Funcionalidades de Segurança

- 🔐 Autenticação JWT
- 🛡️ RBAC (Role-Based Access Control)
- 🚦 Rate Limiting (3 níveis)
- 🔒 Hash de senhas (bcrypt)
- 📝 Response DTOs (sem exposição de dados sensíveis)
- 🌐 CORS configurado
- 🪖 Helmet (segurança HTTP)

### Funcionalidades Técnicas

- ✅ Health Checks (database + memory)
- 📝 Logging estruturado (Winston)
- 🗄️ Migrations TypeORM
- 📄 Swagger/OpenAPI
- 🐳 Docker Compose
- ⚡ Compression
- 🔍 Validação com DTOs

---

## 🛠️ Tecnologias

### Backend

- **[NestJS](https://nestjs.com/)** - Framework Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem
- **[TypeORM](https://typeorm.io/)** - ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados
- **[Passport](http://www.passportjs.org/)** - Autenticação
- **[JWT](https://jwt.io/)** - Tokens
- **[Class Validator](https://github.com/typestack/class-validator)** - Validação
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas

### DevOps & Tools

- **[Docker](https://www.docker.com/)** - Containerização
- **[Jest](https://jestjs.io/)** - Testes
- **[Swagger](https://swagger.io/)** - Documentação API
- **[Winston](https://github.com/winstonjs/winston)** - Logging
- **[Helmet](https://helmetjs.github.io/)** - Segurança

---

## 📦 Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

---

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/wesleyrobot/CRM-PUBLICO-.git
cd CRM-PUBLICO--main/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db

# JWT
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=1d

# Server
PORT=3000
NODE_ENV=development
```

---

## ⚙️ Configuração

### Subir o banco de dados (Docker)
```bash
docker-compose up -d
```

### Executar migrations
```bash
npm run migration:run
```

---

## 🚀 Executando

### Modo Development
```bash
npm run start:dev
```

### Modo Production
```bash
npm run build
npm run start:prod
```

A API estará disponível em: `http://localhost:3000`

Swagger UI: `http://localhost:3000/api`

---

## 🧪 Testes

### Executar todos os testes
```bash
npm run test
```

### Testes com coverage
```bash
npm run test:cov
```

### Testes em watch mode
```bash
npm run test:watch
```

### Resultados de Coverage
```
All files: 73.71%
- Controllers: 93-100%
- Services: 88-100%
- Guards: 89-100%
- Strategies: 100%
- Filters: 70%
```

---

## 🗄️ Migrations

### Gerar nova migration
```bash
npm run migration:generate NomeDaMigration
```

### Executar migrations
```bash
npm run migration:run
```

### Reverter última migration
```bash
npm run migration:revert
```

### Mostrar migrations
```bash
npm run migration:show
```

### Dropar schema (CUIDADO!)
```bash
npm run schema:drop
```

---

## 📚 API Documentation

### Swagger UI

Acesse: `http://localhost:3000/api`

### Principais Endpoints

#### Autenticação
```
POST   /auth/login
POST   /auth/register
```

#### Usuários
```
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

#### Empresas
```
GET    /companies
GET    /companies/:id
POST   /companies
PATCH  /companies/:id
DELETE /companies/:id
```

#### Leads
```
GET    /leads
GET    /leads/:id
POST   /leads
PATCH  /leads/:id
DELETE /leads/:id
POST   /leads/:id/convert
```

#### Clientes
```
GET    /clients
GET    /clients/:id
POST   /clients
PATCH  /clients/:id
DELETE /clients/:id
```

#### Analytics
```
GET    /analytics/companies-with-leads
GET    /analytics/user-performance
GET    /analytics/leads-by-status
GET    /analytics/top-companies?limit=10
GET    /analytics/lead-distribution
GET    /analytics/monthly-trend
```

#### Health Check
```
GET    /health
```

---

## 📁 Estrutura do Projeto
```
backend/
├── src/
│   ├── modules/
│   │   ├── users/              # Módulo de usuários
│   │   ├── auth/               # Autenticação JWT
│   │   ├── companies/          # Módulo de empresas
│   │   ├── leads/              # Módulo de leads
│   │   ├── clients/            # Módulo de clientes
│   │   ├── analytics/          # Analytics & Relatórios
│   │   └── external/           # Integrações externas
│   ├── common/
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth & RBAC guards
│   │   ├── interceptors/       # Interceptors
│   │   └── logger/             # Winston logger
│   ├── database/
│   │   └── migrations/         # TypeORM migrations
│   ├── config/                 # Configurações
│   ├── app.module.ts
│   └── main.ts
├── test/                       # Testes unitários
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🏆 Melhorias Sênior

Este projeto implementa 5 melhorias de nível sênior:

### 1. ✅ Response DTOs
- Não expõe dados sensíveis (senhas)
- Transformação automática de respostas
- Segurança de dados

### 2. ✅ Rate Limiting
- 3 níveis de proteção
- Headers informativos (X-RateLimit-*)
- Proteção contra DDoS
```typescript
// Strict: 10 req/min
@UseGuards(StrictRateLimitGuard)

// Moderate: 30 req/min  
@UseGuards(ModerateRateLimitGuard)

// Lenient: 100 req/min
@UseGuards(LenientRateLimitGuard)
```

### 3. ✅ Health Checks
- Database health
- Memory usage
- Uptime
- Timestamps
- Pronto para Kubernetes
```bash
GET /health
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

### 4. ✅ Migrations TypeORM
- 5 scripts npm
- Controle total do schema
- Versionamento do banco

### 5. ✅ Test Coverage 73.71%
- 115 testes unitários
- Coverage em todos módulos
- Qualidade profissional

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Wesley**

- GitHub: [@wesleyrobot](https://github.com/wesleyrobot)
- LinkedIn: [seu-linkedin](#)
- Email: seu-email@exemplo.com

---

## 📊 Status do Projeto
```
✅ Em Produção
✅ Mantido Ativamente
✅ 73.71% Test Coverage
✅ 115 Testes Passando
✅ 13 Commits
```

---

## 🎯 Roadmap

- [ ] Testes E2E
- [ ] CI/CD (GitHub Actions)
- [ ] Deploy (Railway/Render)
- [ ] Notificações por Email
- [ ] WebSocket real-time
- [ ] Dashboard administrativo
- [ ] Autenticação 2FA
- [ ] Exportação Excel/PDF
- [ ] Internacionalização (i18n)
- [ ] Cache com Redis

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/wesleyrobot">Wesley</a>
</p>
