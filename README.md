#  CRM Público - Sistema de Gestão de Leads e Clientes

<div align="center">

![Coverage](https://img.shields.io/badge/coverage-87.1%25-brightgreen?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-136%20passing-success?style=for-the-badge)
![CI](https://github.com/wesleyrobot/CRM-PUBLICO-/actions/workflows/test.yml/badge.svg)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Sistema completo de CRM para gestão de leads, clientes e análise de vendas**

[Documentação da API](#-documentação-da-api) • [Como Rodar](#-como-rodar) • [Testes](#-testes) • [Arquitetura](#-arquitetura)

</div>

---

##  Sobre o Projeto

Sistema profissional de **Customer Relationship Management (CRM)** desenvolvido com as melhores práticas de arquitetura, qualidade de código e segurança. Ideal para equipes de vendas que precisam gerenciar leads, clientes e acompanhar métricas de conversão.

###  Principais Destaques

- ✅ **87.1% de Test Coverage** com 136 testes unitários + **100% E2E (23 testes)**
- ✅ **Arquitetura Modular** seguindo princípios SOLID
- ✅ **Type Safety** completo com TypeScript strict mode
- ✅ **Full-Text Search** em português com ranking e highlight
- ✅ **Auditoria Automática** de todas operações do banco
- ✅ **Dashboard Otimizado** com Materialized Views PostgreSQL
- ✅ **Cron Jobs** para manutenção automática do sistema
- ✅ **Documentação Interativa** com Swagger UI
- ✅ **Containerização** completa com Docker
- ✅ **Sistema de Logs** estruturado com Winston
- ✅ **Segurança** com JWT, bcrypt e Role-based Access Control
- ✅ **Soft Delete** em todas entidades

---

##  Tecnologias

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

##  Funcionalidades

###  Autenticação e Autorização
- [x] Login com JWT (access token)
- [x] Sistema de permissões (Admin, Gerente, Vendedor)
- [x] Senha criptografada com bcrypt (10 rounds)
- [x] Guards de autenticação e autorização

###  Gestão de Usuários
- [x] CRUD completo de usuários
- [x] Paginação e filtros
- [x] Validação de dados
- [x] Controle de roles/permissões

###  Gestão de Leads
- [x] Cadastro de leads com origem e status
- [x] Conversão de lead para cliente
- [x] Histórico de interações
- [x] Filtros avançados

###  Gestão de Clientes
- [x] CRUD completo de clientes
- [x] Vínculo com empresas
- [x] Histórico de vendas
- [x] Métricas de faturamento

###  Gestão de Empresas
- [x] Cadastro de empresas
- [x] CNPJ, endereço e contatos
- [x] Vínculo com clientes

###  Analytics e Dashboard
- [x] Taxa de conversão de leads
- [x] Receita por período
- [x] Distribuição de leads por vendedor
- [x] Top performers
- [x] Análise por origem de lead
- [x] Breakdown por status
- [x] Dashboard otimizado com Materialized Views
- [x] Timeline de criação (dia, semana, mês, trimestre, ano)
- [x] Estatísticas de crescimento percentual
- [x] Análise por segmento de mercado

###  Full-Text Search
- [x] Busca inteligente em português (com acentuação)
- [x] Ranking por relevância
- [x] Highlight dos termos encontrados
- [x] Busca em leads, clientes e empresas
- [x] Fallback automático para ILIKE
- [x] Paginação e filtros

###  Auditoria e Logs
- [x] Auditoria automática de todas as operações
- [x] Registro de INSERT, UPDATE, DELETE
- [x] Histórico completo por registro
- [x] Sanitização de dados sensíveis
- [x] Rastreamento de usuário responsável
- [x] Consulta por tabela, ação e período

###  Automação e Manutenção
- [x] Cron Jobs para tarefas programadas
- [x] Refresh automático de Materialized Views (15 min)
- [x] Atualização de Full-Text Search (1 hora)
- [x] Limpeza de logs antigos (diária)
- [x] VACUUM ANALYZE do PostgreSQL (semanal)
- [x] Execução manual de jobs (endpoint admin)

###  Infraestrutura
- [x] Logs estruturados com Winston
- [x] Health check endpoint completo
- [x] Tratamento global de exceções
- [x] Validação de requisições
- [x] Interceptor de logging HTTP
- [x] Rate limiting configurável por ambiente

---

##  Funcionalidades Avançadas

### 🔍 Full-Text Search em Português

Sistema de busca inteligente otimizado para português brasileiro:

**Características:**
- **Suporte nativo a acentuação** - Busca por "jose" encontra "José"
- **Ranking por relevância** - Resultados ordenados por score
- **Highlight de termos** - Destaque visual dos termos encontrados
- **Busca parcial** - Suporte a prefixos (busca por "tec" encontra "tecnologia")
- **Fallback automático** - Se Full-Text falhar, usa ILIKE como backup
- **Performance** - Índices GIN para busca instantânea
- **Paginação** - Suporte a page/limit
- **Estatísticas** - Contagem por tipo de entidade

**Exemplo de uso:**
```bash
GET /api/search?q=joão tecnologia&page=1&limit=10
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid-123",
      "type": "lead",
      "nome": "João Silva",
      "email": "joao@tech.com",
      "rank": 0.85,
      "highlight": "<mark>João</mark> Silva - Empresa de <mark>tecnologia</mark>"
    }
  ],
  "meta": {
    "query": "joão tecnologia",
    "total": 15,
    "entities": { "leads": 5, "clientes": 7, "empresas": 3 }
  }
}
```

### 📋 Auditoria Automática

Sistema completo de auditoria que registra automaticamente todas as operações:

**O que é auditado:**
- ✅ Todas as operações INSERT, UPDATE, DELETE
- ✅ Tabelas: leads, clientes, empresas, usuários
- ✅ Dados anteriores e novos (formato JSONB)
- ✅ Usuário responsável pela operação
- ✅ Timestamp preciso

**Segurança:**
- 🔒 Dados sensíveis sanitizados (senhas nunca são logadas)
- 🔒 Logs imutáveis (apenas INSERT)
- 🔒 Acesso restrito (admin/gerente)

**Endpoints:**
```bash
GET /api/audit?page=1&limit=20                    # Listar todos
GET /api/audit?tabela=leads&acao=UPDATE           # Filtrar por tabela/ação
GET /api/audit/stats                              # Estatísticas
GET /api/audit/registro/uuid-123                  # Histórico de um registro
```

### 📊 Dashboard com Materialized Views

Dashboard de alta performance usando Materialized Views do PostgreSQL:

**Métricas disponíveis:**
- 📈 **Totais** - Leads, clientes, empresas, usuários
- 📈 **Crescimento** - Percentual de crescimento por período
- 📈 **Conversão** - Taxa de conversão, qualified, lost
- 📈 **Timeline** - Evolução temporal (dia, semana, mês, trimestre, ano)
- 📈 **Por Status** - Distribuição de leads por status
- 📈 **Por Segmento** - Análise por segmento de mercado
- 📈 **Top Users** - Ranking dos 5 melhores vendedores

**Performance:**
- ⚡ Queries executadas em < 10ms (graças a materialized views)
- ⚡ Refresh automático a cada 15 minutos via cron job
- ⚡ Suporte a filtros por período e data customizada

### ⏰ Cron Jobs (Scheduler)

Sistema de tarefas automatizadas para manutenção do sistema:

| Job | Frequência | Função |
|-----|-----------|--------|
| **refresh-dashboard-view** | 15 minutos | Atualiza materialized view do dashboard |
| **update-search-vectors** | 1 hora | Atualiza índices Full-Text Search |
| **cleanup-old-audit-logs** | Diariamente | Remove logs > 90 dias |
| **vacuum-analyze** | Semanalmente | Otimiza tabelas PostgreSQL |

**Execução manual (admin):**
```bash
POST /api/scheduler/run/refresh-dashboard-view
```

**Listar jobs:**
```bash
GET /api/scheduler/jobs
```

**Resposta:**
```json
[
  {
    "name": "refresh-dashboard-view",
    "nextRun": "2024-01-15T10:45:00Z",
    "cronExpression": "0 */15 * * * *"
  }
]
```

---

##  Arquitetura

### Estrutura do Projeto
```
backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   │   ├── auth/            #  Autenticação e autorização
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── strategies/  # Estratégia JWT
│   │   │   └── guards/      # Guards de proteção
│   │   ├── users/           # Gestão de usuários
│   │   ├── leads/           # Gestão de leads
│   │   ├── clients/         # Gestão de clientes
│   │   ├── companies/       # Gestão de empresas
│   │   ├── analytics/       # Dashboard e métricas
│   │   ├── dashboard/       # Dashboard com Materialized Views
│   │   ├── search/          # 🔍 Full-Text Search
│   │   ├── audit/           # 📋 Auditoria automática
│   │   ├── scheduler/       # ⏰ Cron Jobs
│   │   └── external/        # Integrações externas
│   ├── common/              # Utilitários compartilhados
│   │   ├── decorators/      # Decorators customizados
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Guards globais
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── logger/          # Sistema de logs
│   ├── config/              # Configurações
│   └── database/            # Migrations e seeds
├── test/                    # Testes E2E
└── coverage/                #  elatórios de coverage
```

### Padrões Arquiteturais

- **Modular Architecture** - Cada módulo é independente e reutilizável
- **Dependency Injection** - Inversão de controle com NestJS
- **Repository Pattern** - Abstração de acesso a dados com TypeORM
- **DTO Pattern** - Validação e transformação de dados
- **Guard Pattern** - Proteção de rotas e recursos
- **Interceptor Pattern** - Manipulação de requisições/respostas

---

##  Como Rodar

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

##  Documentação da API

###  Interface Swagger

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

 **http://localhost:3000/api/docs**

### Principais Endpoints

####  Autenticação
```http
POST /auth/login
POST /auth/register
```

####  Usuários
```http
GET    /users           # Listar (paginado)
POST   /users           # Criar
GET    /users/:id       # Buscar por ID
PATCH  /users/:id       # Atualizar
DELETE /users/:id       # Deletar
```

####  Leads
```http
GET    /leads           # Listar (paginado)
POST   /leads           # Criar
GET    /leads/:id       # Buscar por ID
PATCH  /leads/:id       # Atualizar
DELETE /leads/:id       # Deletar
```

####  Clientes
```http
GET    /clients         # Listar (paginado)
POST   /clients         # Criar
GET    /clients/:id     # Buscar por ID
PATCH  /clients/:id     # Atualizar
DELETE /clients/:id     # Deletar
```

####  Empresas
```http
GET    /companies       # Listar (paginado)
POST   /companies       # Criar
GET    /companies/:id   # Buscar por ID
PATCH  /companies/:id   # Atualizar
DELETE /companies/:id   # Deletar
```

####  Analytics
```http
GET /analytics/conversion-rate      # Taxa de conversão
GET /analytics/revenue              # Receita por período
GET /analytics/lead-distribution    # Distribuição de leads
GET /analytics/top-performers       # Top vendedores
GET /analytics/source-performance   # Performance por origem
GET /analytics/lead-status         # Breakdown por status
```

####  Dashboard
```http
GET  /dashboard              # Dashboard completo
GET  /dashboard/stats        # Estatísticas gerais
GET  /dashboard/timeline     # Linha do tempo
POST /dashboard/refresh      # Atualizar view (admin)
```

####  Search (Full-Text)
```http
GET /search?q=termo&page=1&limit=10   # Busca inteligente
```

####  Auditoria
```http
GET /audit                        # Listar logs (paginado)
GET /audit/stats                  # Estatísticas de auditoria
GET /audit/registro/:id           # Histórico de um registro
```

####  Scheduler (Cron Jobs)
```http
GET  /scheduler/jobs                    # Listar jobs programados
POST /scheduler/run/:jobName            # Executar job manualmente (admin)
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

##  Testes

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
| **Test Coverage** | **87.1%**  |
| **Total de Testes** | **136**  |
| **Test Suites** | **29**  |
| **TypeScript** | **Strict Mode**  |
| **ESLint** | **0 Errors**  |

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

##  Segurança

### Medidas Implementadas

-  **Senha Criptografada** - bcrypt com 10 rounds
-  **JWT Tokens** - Autenticação stateless
-  **CORS Configurado** - Proteção contra cross-origin attacks
-  **Validação de Dados** - class-validator em todos os DTOs
-  **Role-based Access Control** - Guards de autorização
-  **SQL Injection Protection** - TypeORM com prepared statements
-  **Rate Limiting** - Proteção contra brute force (próxima versão)

### Variáveis Sensíveis

 **IMPORTANTE:** Nunca commite o arquivo `.env` com dados reais!
```bash
# .gitignore já configurado para:
.env
.env.local
.env.production
```

---

##  Monitoramento

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

##  Roadmap

###  Concluído
- [x] Autenticação JWT
- [x] CRUD completo de todas entidades
- [x] Dashboard de analytics com Materialized Views
- [x] Sistema de logs estruturado
- [x] Documentação Swagger completa
- [x] 87.1% test coverage unitário
- [x] **Testes E2E com 100% de aprovação (23 testes)**
- [x] Containerização Docker completa
- [x] **Full-Text Search em português com ranking**
- [x] **Auditoria automática de todas operações**
- [x] **Soft delete em todas entidades**
- [x] **Cron Jobs para manutenção automática**
- [x] Rate limiting configurável por ambiente

### 🔄 Em Desenvolvimento
- [ ] Frontend React/Next.js
- [ ] CI/CD com GitHub Actions (parcial)

### 📋 Backlog
- [ ] Cache com Redis
- [ ] Notificações por email
- [ ] Integração com CRMs externos (Salesforce, HubSpot)
- [ ] Relatórios PDF exportáveis
- [ ] Dashboard em tempo real (WebSockets)
- [ ] Backup automático do banco
- [ ] Webhooks para integrações
- [ ] Multi-tenancy (SaaS)

---

##  Autor

**Wesley Robot**

Desenvolvedor Full Stack especializado em Node.js, TypeScript e arquitetura de software.

-  GitHub: [@wesleyrobot](https://github.com/wesleyrobot)
-  LinkedIn: www.linkedin.com/in/wesley-costa-27b96636b
-  Email: wesleymr.robot@gmail.com
-  Empresa: Multi360 Tecnologia Ltda

---

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

##  Agradecimentos

- [NestJS](https://nestjs.com/) - Framework incrível
- [TypeORM](https://typeorm.io/) - ORM poderoso e flexível
- [Jest](https://jestjs.io/) - Framework de testes confiável
- Comunidade open source

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

[![GitHub Stars](https://img.shields.io/github/stars/wesleyrobot/CRM-PUBLICO-?style=social)](https://github.com/wesleyrobot/CRM-PUBLICO-)
[![GitHub Forks](https://img.shields.io/github/forks/wesleyrobot/CRM-PUBLICO-?style=social)](https://github.com/wesleyrobot/CRM-PUBLICO-)

Desenvolvido por [Wesley Robot](https://github.com/wesleyrobot)

</div>
