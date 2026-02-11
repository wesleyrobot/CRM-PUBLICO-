# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Splash screen animado com letras azul/branco e partículas flutuantes
- Footer com créditos "Desenvolvido por Wesley A.Costa" com gradiente animado
- Dashboard reorganizado para `/dashboard`
- SSR otimizado (partículas geradas no cliente para evitar hydration mismatch)

### Changed
- Dashboard movido de `/` para `/dashboard` para melhor organização de rotas
- Sidebar atualizada para apontar para `/dashboard`
- Login com animações mais dramáticas e visíveis

### Fixed
- Corrigido erro de hidratação no splash screen (partículas agora são geradas apenas no cliente)
- Corrigido conflito de rotas entre splash screen e dashboard

## [1.0.0] - 2025-02-10

### Added - Backend

#### Core
- Sistema CRM completo com NestJS 11
- TypeScript 5 em strict mode
- PostgreSQL 16 com TypeORM
- Redis 7 para caching
- Docker Compose para containerização

#### Autenticação
- Sistema de autenticação JWT
- Refresh tokens (access 1h + refresh 7d)
- RBAC completo (admin, gerente, vendedor)
- Validação forte de senha (bcrypt 10 rounds)

#### Módulos
- Gestão de Usuários (CRUD completo)
- Gestão de Leads (com filtros por status)
- Gestão de Clientes (com conversão de leads)
- Gestão de Empresas (com segmentos)
- Dashboard com Materialized Views
- Analytics (métricas e relatórios)
- Full-Text Search em português
- Auditoria automática
- Scheduler (Cron Jobs)

#### Performance
- Redis cache (70-80% redução de carga)
- Materialized Views PostgreSQL
- Connection pooling configurável
- Queries otimizadas (<10ms com cache)

#### Segurança
- Helmet.js para headers HTTP
- CORS restritivo configurável
- Rate limiting (3 tiers)
- Request ID tracking
- SQL injection protection
- Soft delete em todas entidades

#### Observabilidade
- Sentry error tracking
- Prometheus metrics
- Winston structured logging
- Health check completo
- Audit log automático

#### Testes
- 94.4% test coverage
- 300 testes unitários
- 23 testes E2E
- CI/CD com GitHub Actions

#### Documentação
- Swagger completo
- DTOs tipados
- JSDoc em funções públicas
- README detalhado

### Added - Frontend

#### Core
- Next.js 16.1.3 com Turbopack
- React 19
- TypeScript 5
- Tailwind CSS v4

#### Funcionalidades
- Sistema de autenticação completo
- Dashboard interativo com métricas reais
- Pipeline de oportunidades (Kanban)
- Funil de negociações
- Busca full-text inteligente
- Gestão de equipe
- Relatórios analíticos
- Configurações do sistema
- Automações (CRON Jobs)

#### Design
- Design glassmorphic
- Animações com Framer Motion
- Gráficos SVG customizados
- Responsive design
- Sidebar interativa
- Avatars com DiceBear

#### Qualidade
- React Hook Form + Zod
- Axios interceptors
- Error boundaries
- Loading states
- Auto-refresh de tokens

### Changed
- API versionada (v1)
- Response wrapper padrão
- Error codes padronizados

### Fixed
- Diversos bugs de hydration
- Performance de queries
- Validação de formulários

## [0.1.0] - 2025-01-15

### Added
- Versão inicial do projeto
- Estrutura básica de módulos
- Autenticação básica
- CRUD de entidades principais

---

## Tipos de Mudanças

- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de vulnerabilidades

## Links

- [Repositório](https://github.com/wesleyrobot/CRM-PUBLICO-)
- [Issues](https://github.com/wesleyrobot/CRM-PUBLICO-/issues)
- [Pull Requests](https://github.com/wesleyrobot/CRM-PUBLICO-/pulls)
