# 🎯 CRM Público - Sistema de Gestão de Leads e Clientes

<div align="center">

![Coverage](https://img.shields.io/badge/coverage-87.1%25-brightgreen?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-136%20passing-success?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Sistema completo de CRM para gestão de leads, clientes e análise de vendas**

[Documentação da API](#-documentação-da-api) • [Como Rodar](#-como-rodar) • [Testes](#-testes) • [Arquitetura](#-arquitetura)

</div>

---

## 📋 Sobre o Projeto

Sistema profissional de **Customer Relationship Management (CRM)** desenvolvido com as melhores práticas de arquitetura, qualidade de código e segurança. Ideal para equipes de vendas que precisam gerenciar leads, clientes e acompanhar métricas de conversão.

### ✨ Principais Destaques

- ✅ **87.1% de Test Coverage** com 136 testes automatizados
- ✅ **Arquitetura Modular** seguindo princípios SOLID
- ✅ **Type Safety** completo com TypeScript strict mode
- ✅ **Documentação Interativa** com Swagger UI
- ✅ **Containerização** completa com Docker
- ✅ **Sistema de Logs** estruturado com Winston
- ✅ **Segurança** com JWT, bcrypt e Role-based Access Control

---

## 🚀 Tecnologias

### Backend
- **[NestJS 11](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript 5](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[PostgreSQL 16](https://www.postgresql.org/)** - Banco de dados relacional
- **[TypeORM 0.3](https://typeorm.io/)** - ORM para TypeScript/JavaScript

### Infraestrutura
- **[Docker](https://www.docker.com/)** - Containerização
- **[Docker Compose](https://docs.docker.com/compose/)** - Orquestração de containers

### Qualidade & Documentação
- **[Jest](https://jestjs.io/)** - Framework de testes (87.1% coverage)
- **[Swagger](https://swagger.io/)** - Documentação interativa da API
- **[Winston](https://github.com/winstonjs/winston)** - Sistema de logs
- **[ESLint](https://eslint.org/)** - Linter para qualidade de código
- **[Prettier](https://prettier.io/)** - Formatação de código

### Segurança
- **[JWT](https://jwt.io/)** - Autenticação stateless
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Hash de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de dados

---

## 💼 Funcionalidades

### 🔐 Autenticação e Autorização
- [x] Login com JWT (access token)
- [x] Sistema de permissões (Admin, Gerente, Vendedor)
- [x] Senha criptografada com bcrypt (10 rounds)
- [x] Guards de autenticação e autorização

### 👥 Gestão de Usuários
- [x] CRUD completo de usuários
- [x] Paginação e filtros
- [x] Validação de dados
- [x] Controle de roles/permissões

### 📊 Gestão de Leads
- [x] Cadastro de leads com origem e status
- [x] Conversão de lead para cliente
- [x] Histórico de interações
- [x] Filtros avançados

### 🏢 Gestão de Clientes
- [x] CRUD completo de clientes
- [x] Vínculo com empresas
- [x] Histórico de vendas
- [x] Métricas de faturamento

### 🏭 Gestão de Empresas
- [x] Cadastro de empresas
- [x] CNPJ, endereço e contatos
- [x] Vínculo com clientes

### 📈 Analytics e Dashboard
- [x] Taxa de conversão de leads
- [x] Receita por período
- [x] Distribuição de leads por vendedor
- [x] Top performers
- [x] Análise por origem de lead
- [x] Breakdown por status

### 🔧 Infraestrutura
- [x] Logs estruturados com Winston
- [x] Health check endpoint
- [x] Tratamento global de exceções
- [x] Validação de requisições
- [x] Interceptor de logging HTTP

---

## 🏗️ Arquitetura

### Estrutura do Projeto
```
backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   │   ├── auth/            # 🔐 Autenticação e autorização
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── strategies/  # Estratégia JWT
│   │   │   └── guards/      # Guards de proteção
│   │   ├── users/           # 👤 Gestão de usuários
│   │   ├── leads/           # 📊 Gestão de leads
│   │   ├── clients/         # 🏢 Gestão de clientes
│   │   ├── companies/       # 🏭 Gestão de empresas
│   │   ├── analytics/       # 📈 Dashboard e métricas
│   │   └── external/        # 🌐 Integrações externas
│   ├── common/              # Utilitários compartilhados
│   │   ├── decorators/      # Decorators customizados
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Guards globais
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── logger/          # Sistema de logs
│   ├── config/              # ⚙️ Configurações
│   └── database/            # 🗄️ Migrations e seeds
├── test/                    # 🧪 Testes E2E
└── coverage/                # 📊 Relatórios de coverage
```

### Padrões Arquiteturais

- **Modular Architecture** - Cada módulo é independente e reutilizável
- **Dependency Injection** - Inversão de controle com NestJS
- **Repository Pattern** - Abstração de acesso a dados com TypeORM
- **DTO Pattern** - Validação e transformação de dados
- **Guard Pattern** - Proteção de rotas e recursos
- **Interceptor Pattern** - Manipulação de requisições/respostas

---

## 🔧 Como Rodar

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/))
- **Docker Compose** (geralmente já vem com Docker)
- **Git** ([Download](https://git-scm.com/))

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/wesleyrobot/CRM-PUBLICO-.git
cd CRM-PUBLICO-/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db

# JWT
JWT_SECRET=seu-secret-super-secreto-aqui
JWT_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
```

4. **Inicie o banco de dados**
```bash
docker-compose up -d
```

5. **Execute as migrations**
```bash
npm run migration:run
```

6. **Inicie o servidor**
```bash
# Modo desenvolvimento (hot reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

### Acessar a Aplicação

Após iniciar, a aplicação estará disponível em:

- **API Backend:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/health

---

## 📚 Documentação da API

### 📸 Interface Swagger

<div align="center">

![Swagger Overview](docs/swagger-overview.png)
*Visão geral de todos os endpoints disponíveis*

![Swagger Endpoint](docs/swagger-endpoint.png)
*Exemplo de endpoint com documentação detalhada*

![Swagger Schemas](docs/swagger-schemas.png)
*Schemas e modelos de dados*

</div>

---

A documentação completa e interativa está disponível via **Swagger UI** em:

👉 **http://localhost:3000/api/docs**

### Principais Endpoints

#### 🔐 Autenticação
```http
POST /auth/login
POST /auth/register
```

#### 👥 Usuários
```http
GET    /users           # Listar (paginado)
POST   /users           # Criar
GET    /users/:id       # Buscar por ID
PATCH  /users/:id       # Atualizar
DELETE /users/:id       # Deletar
```

#### 📊 Leads
```http
GET    /leads           # Listar (paginado)
POST   /leads           # Criar
GET    /leads/:id       # Buscar por ID
PATCH  /leads/:id       # Atualizar
DELETE /leads/:id       # Deletar
```

#### 🏢 Clientes
```http
GET    /clients         # Listar (paginado)
POST   /clients         # Criar
GET    /clients/:id     # Buscar por ID
PATCH  /clients/:id     # Atualizar
DELETE /clients/:id     # Deletar
```

#### 🏭 Empresas
```http
GET    /companies       # Listar (paginado)
POST   /companies       # Criar
GET    /companies/:id   # Buscar por ID
PATCH  /companies/:id   # Atualizar
DELETE /companies/:id   # Deletar
```

#### 📈 Analytics
```http
GET /analytics/conversion-rate      # Taxa de conversão
GET /analytics/revenue              # Receita por período
GET /analytics/lead-distribution    # Distribuição de leads
GET /analytics/top-performers       # Top vendedores
GET /analytics/source-performance   # Performance por origem
GET /analytics/lead-status         # Breakdown por status
```

### Exemplo de Requisição
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crm.com",
    "senha": "senha123"
  }'

# Criar Lead (com token)
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "+5511999999999",
    "empresa": "Empresa XYZ",
    "origem": "website",
    "status": "novo"
  }'
```

---

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes em modo watch
npm run test:watch
```

### Métricas de Qualidade

| Métrica | Valor |
|---------|-------|
| **Test Coverage** | **87.1%** ✅ |
| **Total de Testes** | **136** ✅ |
| **Test Suites** | **29** ✅ |
| **TypeScript** | **Strict Mode** ✅ |
| **ESLint** | **0 Errors** ✅ |

### Coverage Detalhado por Módulo

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Analytics** | 100% | 66.66% | 100% | 100% |
| **Auth** | 94.11% | 87.5% | 77.77% | 93.33% |
| **Clients** | 100% | 75% | 100% | 100% |
| **Companies** | 93.54% | 55.55% | 100% | 92.85% |
| **External** | 100% | 50% | 100% | 100% |
| **Leads** | 100% | 75% | 100% | 100% |
| **Users** | 96.15% | 71.42% | 94.11% | 95.77% |
| **Entities** | **100%** | **100%** | **100%** | **100%** |

---

## 🔒 Segurança

### Medidas Implementadas

- ✅ **Senha Criptografada** - bcrypt com 10 rounds
- ✅ **JWT Tokens** - Autenticação stateless
- ✅ **CORS Configurado** - Proteção contra cross-origin attacks
- ✅ **Validação de Dados** - class-validator em todos os DTOs
- ✅ **Role-based Access Control** - Guards de autorização
- ✅ **SQL Injection Protection** - TypeORM com prepared statements
- ✅ **Rate Limiting** - Proteção contra brute force (próxima versão)

### Variáveis Sensíveis

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` com dados reais!
```bash
# .gitignore já configurado para:
.env
.env.local
.env.production
```

---

## 📊 Monitoramento

### Logs

Sistema de logs estruturado com Winston:
```typescript
{
  "level": "info",
  "message": "User created successfully",
  "timestamp": "2025-01-31T10:30:00.000Z",
  "context": "UsersService",
  "userId": "123",
  "email": "user@example.com"
}
```

### Health Check

Endpoint de saúde da aplicação:
```bash
GET /health
```

Resposta:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

---

## 🚀 Roadmap

### ✅ Concluído
- [x] Autenticação JWT
- [x] CRUD completo de todas entidades
- [x] Dashboard de analytics
- [x] Sistema de logs
- [x] Documentação Swagger
- [x] 87.1% test coverage
- [x] Containerização Docker

### 🔄 Em Desenvolvimento
- [ ] Frontend React/Next.js
- [ ] Testes E2E completos
- [ ] CI/CD com GitHub Actions
- [ ] Rate limiting

### 📋 Backlog
- [ ] Cache com Redis
- [ ] Notificações por email
- [ ] Integração com CRMs externos
- [ ] Relatórios PDF
- [ ] Dashboard em tempo real (WebSockets)
- [ ] Soft delete
- [ ] Auditoria de ações
- [ ] Backup automático

---

## 👨‍💻 Autor

**Wesley Robot**

Desenvolvedor Full Stack especializado em Node.js, TypeScript e arquitetura de software.

- 🌐 GitHub: [@wesleyrobot](https://github.com/wesleyrobot)
- 💼 LinkedIn: [Seu LinkedIn]
- 📧 Email: seu.email@exemplo.com
- 🏢 Empresa: Multi360 Tecnologia Ltda

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [NestJS](https://nestjs.com/) - Framework incrível
- [TypeORM](https://typeorm.io/) - ORM poderoso e flexível
- [Jest](https://jestjs.io/) - Framework de testes confiável
- Comunidade open source

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

[![GitHub Stars](https://img.shields.io/github/stars/wesleyrobot/CRM-PUBLICO-?style=social)](https://github.com/wesleyrobot/CRM-PUBLICO-)
[![GitHub Forks](https://img.shields.io/github/forks/wesleyrobot/CRM-PUBLICO-?style=social)](https://github.com/wesleyrobot/CRM-PUBLICO-)

Desenvolvido com ❤️ por [Wesley Robot](https://github.com/wesleyrobot)

</div>
