# Política de Segurança

## Versões Suportadas

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x.x  | :white_check_mark: |
| < 1.0  | :x:                |

## Reportando uma Vulnerabilidade

A segurança do CRM Público é levada a sério. Se você descobrir uma vulnerabilidade de segurança, agradecemos seus esforços para divulgá-la de forma responsável.

### Como Reportar

**Por favor, NÃO reporte vulnerabilidades de segurança através de issues públicas do GitHub.**

Em vez disso, envie um email para: **wesleymr.robot@gmail.com**

Inclua as seguintes informações:

- Tipo de vulnerabilidade (ex: SQL injection, XSS, CSRF, etc.)
- Caminhos completos dos arquivos de código-fonte relacionados à manifestação da vulnerabilidade
- Localização do código afetado (tag/branch/commit ou URL direto)
- Qualquer configuração especial necessária para reproduzir o problema
- Instruções passo a passo para reproduzir o problema
- Proof-of-concept ou código de exploração (se possível)
- Impacto do problema, incluindo como um atacante poderia explorar o problema

### O Que Esperar

Você receberá uma resposta em até **48 horas** confirmando o recebimento do seu relatório.

Após a confirmação inicial:

1. **Análise**: Investigaremos e validaremos o problema (geralmente dentro de 7 dias)
2. **Desenvolvimento de Correção**: Trabalharemos em uma correção
3. **Disclosure**: Coordenaremos a divulgação pública

### Processo de Divulgação

1. O problema será confirmado e uma lista de todas as versões afetadas será determinada
2. O código será auditado para encontrar quaisquer problemas similares potenciais
3. Correções serão preparadas para todas as versões ainda sob manutenção
4. Novas versões serão lançadas o mais rápido possível

## Política de Divulgação

- Daremos crédito aos pesquisadores de segurança que reportarem vulnerabilidades válidas
- Pedimos que você nos dê tempo razoável para corrigir o problema antes da divulgação pública
- Manteremos você informado sobre o progresso em direção a uma correção

## Melhores Práticas de Segurança

Se você está usando o CRM Público em produção, recomendamos:

### Backend

- [ ] Use HTTPS em produção
- [ ] Mantenha `JWT_SECRET` seguro e complexo (mínimo 32 caracteres)
- [ ] Configure CORS adequadamente (não use `*` em produção)
- [ ] Use variáveis de ambiente para segredos
- [ ] Mantenha as dependências atualizadas
- [ ] Configure rate limiting apropriadamente
- [ ] Use Helmet.js para headers de segurança
- [ ] Ative logs de auditoria
- [ ] Configure backup regular do banco de dados

### Frontend

- [ ] Nunca exponha tokens em URLs
- [ ] Use `httpOnly` cookies quando possível
- [ ] Implemente Content Security Policy (CSP)
- [ ] Sanitize inputs do usuário
- [ ] Use HTTPS estrito

### Infraestrutura

- [ ] Use Docker secrets ou similar para credenciais
- [ ] Mantenha PostgreSQL e Redis em rede privada
- [ ] Configure firewall adequadamente
- [ ] Use SSL/TLS para conexões de banco de dados
- [ ] Implemente monitoramento de segurança (Sentry)
- [ ] Faça backups regulares e teste restauração

## Recursos de Segurança Implementados

### Autenticação e Autorização

- ✅ JWT com refresh tokens
- ✅ Bcrypt para hash de senhas (10 rounds)
- ✅ RBAC (Role-Based Access Control)
- ✅ Validação forte de senha (maiúscula, minúscula, número, 8+ chars)

### Proteção de API

- ✅ Helmet.js para headers HTTP de segurança
- ✅ CORS configurável
- ✅ Rate limiting (3 tiers: short/medium/long)
- ✅ Request ID tracking
- ✅ Validação de dados com class-validator
- ✅ SQL injection protection (TypeORM prepared statements)

### Monitoramento

- ✅ Sentry error tracking
- ✅ Winston structured logging
- ✅ Audit log automático
- ✅ Health checks

### Dados

- ✅ Soft delete (dados não são perdidos)
- ✅ Sanitização de dados sensíveis em logs
- ✅ Backup automático configurável

## Dependências Conhecidas

Vulnerabilidades conhecidas nas dependências são rastreadas e corrigidas regularmente através de:

- Dependabot (GitHub)
- npm audit
- Snyk (code quality workflow)

## Contato

Para questões relacionadas a segurança: **wesleymr.robot@gmail.com**

---

**Obrigado por ajudar a manter o CRM Público seguro!** 🔒
