# API Versioning Strategy

## Visão Geral

A API do CRM utiliza **URI Versioning** para garantir compatibilidade retroativa e facilitar a evolução da API.

**Padrão de URL**: `/api/v{version}/{resource}`

**Exemplo**: `/api/v1/leads`, `/api/v1/dashboard`

## Estratégia de Versionamento

### Quando Criar Nova Versão

Uma nova versão deve ser criada quando:

1. **Breaking Changes** (obrigatório):
   - Remoção de campos de resposta
   - Alteração de tipo de dados existentes
   - Mudança de contratos de endpoints
   - Alteração de comportamento que quebra clientes existentes

2. **Reestruturação Significativa** (recomendado):
   - Mudança de modelo de autenticação
   - Alteração de formato de erro padrão
   - Reorganização de recursos principais

### Mudanças Compatíveis (mesma versão)

As seguintes mudanças podem ser feitas sem criar nova versão:

- ✅ Adicionar novos endpoints
- ✅ Adicionar novos campos opcionais nas requisições
- ✅ Adicionar novos campos nas respostas
- ✅ Adicionar novos parâmetros de query opcionais
- ✅ Tornar campos obrigatórios opcionais
- ✅ Correções de bugs que não alteram contratos
- ✅ Melhorias de performance
- ✅ Adição de novos valores em enums existentes

## Política de Deprecação

### Ciclo de Vida das Versões

1. **Versão Atual**: Totalmente suportada, recebe novos recursos
2. **Versão Anterior**: Suportada por 6 meses após nova versão
3. **Versão Depreciada**: 3 meses de aviso antes de remoção
4. **Versão Removida**: Endpoint retorna 410 Gone

### Timeline de Depreciação

```
Lançamento v2 → 6 meses → Aviso de depreciação → 3 meses → Remoção v1
```

### Avisos de Depreciação

Versões depreciadas incluem headers de aviso:

```http
Deprecation: true
Sunset: Sat, 31 Dec 2024 23:59:59 GMT
Link: </api/v2/resource>; rel="successor-version"
```

## Implementação Técnica

### Configuração Global (main.ts)

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

### Versionamento em Controllers

```typescript
// Controller com versão padrão
@Controller('leads')
export class LeadsController {
  // Usa v1 automaticamente
}

// Endpoint específico com versão diferente
@Controller('leads')
export class LeadsController {
  @Version('2')
  @Get()
  findAllV2() {
    // Nova implementação
  }

  @Version('1')
  @Get()
  @Deprecated()
  findAllV1() {
    // Implementação antiga
  }
}

// Múltiplas versões no mesmo endpoint
@Version(['1', '2'])
@Get('status')
getStatus() {
  // Funciona em ambas versões
}
```

## Guia de Migração

### Para Desenvolvedores do Backend

1. **Criar Nova Versão**:
   ```bash
   # 1. Criar novo módulo versionado
   nest g module leads/v2
   nest g controller leads/v2
   nest g service leads/v2

   # 2. Copiar e adaptar código
   # 3. Adicionar @Version('2') nos controllers
   # 4. Atualizar testes
   # 5. Documentar mudanças
   ```

2. **Depreciar Versão Antiga**:
   ```typescript
   @Version('1')
   @ApiDeprecated('Use v2 instead')
   @Get()
   findAll() {
     // Adicionar log de uso
     this.logger.warn('v1 endpoint deprecated, use v2');
     return this.findAllV1();
   }
   ```

3. **Remover Versão**:
   ```typescript
   @Version('1')
   @Get()
   @HttpCode(410)
   findAll() {
     throw new GoneException('v1 has been removed, use v2');
   }
   ```

### Para Consumidores da API

1. **Atualizar Base URL**:
   ```diff
   - const API_URL = 'https://api.crm.com/api/leads'
   + const API_URL = 'https://api.crm.com/api/v1/leads'
   ```

2. **Monitorar Headers de Depreciação**:
   ```javascript
   const response = await fetch('/api/v1/leads');
   if (response.headers.get('Deprecation')) {
     console.warn('API version deprecated:',
       response.headers.get('Sunset'));
   }
   ```

3. **Testar Nova Versão**:
   ```javascript
   // Manter compatibilidade com ambas versões durante transição
   const apiVersion = process.env.API_VERSION || 'v1';
   const API_URL = `https://api.crm.com/api/${apiVersion}/leads`;
   ```

## Documentação

### Swagger

Cada versão tem documentação própria:

- `GET /api/docs` - Documentação completa (todas versões)
- `GET /api/v1/docs` - Documentação v1 (futuro)
- `GET /api/v2/docs` - Documentação v2 (futuro)

### Changelog

Manter arquivo `CHANGELOG.md` atualizado com:

- Mudanças de cada versão
- Breaking changes destacados
- Guias de migração
- Datas de deprecação

## Monitoramento

### Métricas a Acompanhar

1. **Uso por Versão**:
   - Requests por versão
   - Usuários únicos por versão
   - Taxa de adoção de novas versões

2. **Performance**:
   - Tempo de resposta por versão
   - Taxa de erro por versão

3. **Deprecação**:
   - Uso de endpoints depreciados
   - Clientes que ainda não migraram

### Logs

```typescript
@UseInterceptors(VersionLoggingInterceptor)
export class LeadsController {
  // Automaticamente loga versão usada
}
```

## Segurança

### Considerações

1. **Versões Antigas**: Recebem patches de segurança durante período de suporte
2. **Versões Removidas**: Não são mais suportadas (retornam 410)
3. **Breaking Changes de Segurança**: Podem forçar depreciação antecipada

### Comunicação

Mudanças de segurança são comunicadas via:
- Email para desenvolvedores registrados
- Avisos na documentação
- Headers HTTP de aviso
- Status page

## Boas Práticas

### ✅ Fazer

- Planejar breaking changes com antecedência
- Comunicar mudanças com clareza
- Manter backward compatibility quando possível
- Versionar documentação junto com código
- Automatizar testes de compatibilidade
- Usar feature flags para novos recursos experimentais

### ❌ Evitar

- Breaking changes sem nova versão
- Remover versões antes do prazo
- Múltiplas versões ativas simultaneamente (máximo 2)
- Mudanças silenciosas de comportamento
- Versionar recursos internos/privados

## Roadmap de Versões

### v1 (Atual)
- Status: **Ativa**
- Lançamento: 2024-01
- Suporte até: TBD
- Recursos: CRUD completo, Dashboard, Search, Audit

### v2 (Planejado)
- Status: **Planejado**
- Lançamento previsto: TBD
- Mudanças planejadas:
  - GraphQL opcional
  - Webhooks
  - Rate limiting por tenant
  - Filtros avançados com JSON API spec

## Referências

- [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)
- [API Versioning Best Practices](https://swagger.io/blog/api-strategy/api-versioning/)
- [Semantic Versioning](https://semver.org/)
- [REST API Versioning](https://restfulapi.net/versioning/)
