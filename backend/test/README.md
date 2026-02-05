# Testes E2E (End-to-End)

Este diretório contém os testes de integração E2E da aplicação CRM.

## Estrutura

```
test/
├── app.e2e-spec.ts          # Testes gerais da API
├── audit.e2e-spec.ts        # Testes do módulo de Auditoria
├── dashboard.e2e-spec.ts    # Testes do Dashboard Analytics
├── scheduler.e2e-spec.ts    # Testes do Scheduler (Cron Jobs)
├── jest-e2e.json            # Configuração do Jest para E2E
└── README.md                # Este arquivo
```

## Executar Testes

```bash
# Todos os testes E2E
npm run test:e2e

# Apenas um arquivo específico
npm run test:e2e -- audit.e2e-spec.ts

# Com coverage
npm run test:e2e -- --coverage
```

## Pré-requisitos

### 1. Banco de Dados
Os testes E2E usam o banco de dados configurado em `.env`. Certifique-se de que:
- O banco está rodando
- As migrations foram executadas
- A view materializada existe

```bash
# Rodar migrations
npm run migration:run

# Criar view materializada
psql -d crm_db -c "
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT c.id) as total_clientes,
  COUNT(DISTINCT e.id) as total_empresas
FROM leads l
CROSS JOIN clientes c
CROSS JOIN empresas e
WHERE l.deletado_em IS NULL
  AND c.deletado_em IS NULL
  AND e.deletado_em IS NULL;
"
```

### 2. Autenticação (TODO)

Atualmente os testes **não implementam autenticação**, portanto:
- Endpoints públicos: ✅ funcionam
- Endpoints protegidos: ❌ retornam 401

Para implementar autenticação nos testes:

```typescript
// TODO: Adicionar em cada arquivo de teste
let authToken: string;
let adminToken: string;

beforeAll(async () => {
  // Login como usuário comum
  const loginRes = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'test@example.com', senha: 'senha123' });
  
  authToken = loginRes.body.token;

  // Login como admin
  const adminRes = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', senha: 'admin123' });
  
  adminToken = adminRes.body.token;
});

// Usar nos testes
.set('Authorization', `Bearer ${authToken}`)
```

## Status Atual

### ✅ Testes Passando (13)
- Dashboard: endpoints funcionam (sem auth)
- Audit: endpoints funcionam (sem auth)
- Scheduler: endpoints funcionam (sem auth)

### ❌ Testes Falhando (10)
- **Razão principal**: Falta autenticação JWT
- **Endpoints afetados**: Todos os protegidos com `@UseGuards(JwtAuthGuard)`
- **Status HTTP**: 401 Unauthorized

## Melhorias Futuras

1. **Autenticação**
   - Implementar login automático nos testes
   - Criar seeds de usuários de teste
   - Gerenciar tokens JWT

2. **Database Seeding**
   - Popular banco com dados de teste
   - Limpar dados após cada teste
   - Usar transações para isolamento

3. **Health Check**
   - Criar endpoint `/api/health`
   - Validar conexão com banco
   - Verificar services ativos

4. **Fixtures**
   - Criar helpers para dados de teste
   - Factories para entidades
   - Builders para DTOs

## Executando com Docker

```bash
# Subir banco de dados
docker-compose up -d postgres

# Aguardar banco ficar pronto
sleep 5

# Rodar testes
npm run test:e2e
```

## Coverage

Os testes E2E geram relatório de cobertura em `coverage-e2e/`:

```bash
npm run test:e2e -- --coverage
open coverage-e2e/lcov-report/index.html
```

## Troubleshooting

### Erro: "Connection refused"
- Verifique se o banco está rodando
- Confirme as credenciais no `.env`

### Erro: "401 Unauthorized"
- **Esperado**: Falta implementar auth nos testes
- Ver seção "Autenticação (TODO)"

### Erro: "View mv_dashboard_stats does not exist"
- Execute: `npm run migration:run`
- Crie a view manualmente (ver "Pré-requisitos")

### Timeout
- Aumente o timeout em `jest-e2e.json`:
  ```json
  {
    "testTimeout": 60000
  }
  ```
