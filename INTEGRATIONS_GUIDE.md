# 🔌 Guia Completo de Integrações - CRM Público

Este guia explica como conectar o CRM Público com outros sistemas de forma fácil e automática.

## 📋 Índice

1. [O que são Integrações?](#o-que-são-integrações)
2. [Como Funciona?](#como-funciona)
3. [Configurar uma Integração](#configurar-uma-integração)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Referência de API](#referência-de-api)

---

## 🤔 O que são Integrações?

Integrações permitem que o CRM **envie dados automaticamente** para outros sistemas quando algo acontecer (por exemplo, quando um lead for criado).

### Casos de Uso:

- ✅ Enviar leads para seu sistema de email marketing
- ✅ Notificar equipe no Slack/Discord quando chegar lead novo
- ✅ Sincronizar com seu ERP/sistema legado
- ✅ Enviar para Google Sheets para análise
- ✅ Integrar com Zapier/Make.com/n8n
- ✅ Disparar automações personalizadas

---

## ⚙️ Como Funciona?

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   Evento    │  →    │   CRM       │  →    │  Seu Sistema │
│ Lead Criado │       │ Webhook     │       │ (URL + Token)│
└─────────────┘       └─────────────┘       └──────────────┘
```

1. **Você configura** a URL do seu sistema e um token de autenticação
2. **Quando algo acontece** (ex: lead criado), o CRM dispara automaticamente
3. **Seu sistema recebe** os dados em tempo real

---

## 🚀 Configurar uma Integração

### Passo 1: Criar uma Integração

```bash
# Login no CRM
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "senha": "suasenha"
  }'

# Criar integração (use o token JWT recebido)
curl -X POST http://localhost:3000/api/v1/integrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "name": "Integração com Meu Sistema",
    "description": "Envia leads para meu webhook",
    "type": "webhook",
    "url": "https://meu-sistema.com/webhook/leads",
    "method": "POST",
    "auth_token": "meu-token-secreto",
    "events": ["lead_created"]
  }'
```

### Campos da Integração:

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `name` | string | Nome da integração | ✅ |
| `description` | string | Descrição | ❌ |
| `type` | enum | Tipo: webhook, zapier, make, n8n, custom | ❌ (default: webhook) |
| `url` | string | URL que receberá os dados | ✅ |
| `method` | string | POST, GET, PUT, PATCH | ❌ (default: POST) |
| `auth_token` | string | Token de autenticação | ❌ |
| `headers` | object | Headers customizados | ❌ |
| `events` | array | Eventos que disparam | ❌ (default: ["lead_created"]) |
| `config` | object | Configurações avançadas | ❌ |

### Eventos Disponíveis:

- `lead_created` - Quando um lead é criado
- `lead_updated` - Quando um lead é atualizado
- `lead_deleted` - Quando um lead é deletado
- `client_created` - Quando um cliente é criado
- `client_updated` - Quando um cliente é atualizado

---

## 📤 Formato do Payload Enviado

Quando um evento ocorrer, o CRM enviará este JSON para sua URL:

```json
{
  "event": "lead_created",
  "timestamp": "2026-02-11T20:30:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999",
    "cargo": "Gerente de TI",
    "origem": "website",
    "status": "novo",
    "pontuacao": 75,
    "criado_em": "2026-02-11T20:30:00.000Z"
  }
}
```

### Headers Enviados:

```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN (se configurado)
... headers customizados que você configurar
```

---

## 💻 Exemplos de Uso

### 1. Servidor Node.js/Express Simples

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Endpoint que recebe os webhooks do CRM
app.post('/webhook/leads', (req, res) => {
  const { event, data } = req.body;

  // Verificar token (opcional mas recomendado)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== 'meu-token-secreto') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log(`Evento recebido: ${event}`);
  console.log('Dados do lead:', data);

  // Processar o lead (salvar no banco, enviar email, etc.)
  if (event === 'lead_created') {
    // Exemplo: enviar email de boas-vindas
    sendWelcomeEmail(data.email, data.nome);

    // Exemplo: salvar em outro sistema
    saveToMyDatabase(data);

    // Exemplo: notificar no Slack
    notifySlack(`Novo lead: ${data.nome} - ${data.email}`);
  }

  // IMPORTANTE: Sempre retornar 200 OK
  res.status(200).json({ success: true });
});

app.listen(3001, () => {
  console.log('Webhook listener rodando na porta 3001');
});
```

---

### 2. Python/Flask

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook/leads', methods=['POST'])
def webhook_leads():
    # Verificar token
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')

    if token != 'meu-token-secreto':
        return jsonify({'error': 'Unauthorized'}), 401

    # Processar webhook
    data = request.json
    event = data.get('event')
    lead_data = data.get('data')

    print(f'Evento recebido: {event}')
    print(f'Lead: {lead_data}')

    if event == 'lead_created':
        # Processar lead
        send_email(lead_data['email'], lead_data['nome'])
        save_to_database(lead_data)

    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(port=3001)
```

---

### 3. PHP

```php
<?php
// webhook.php

// Ler JSON do corpo da requisição
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Verificar token
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if ($token !== 'meu-token-secreto') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$event = $data['event'];
$leadData = $data['data'];

// Log
error_log("Evento recebido: $event");
error_log("Lead: " . print_r($leadData, true));

// Processar
if ($event === 'lead_created') {
    // Salvar no banco
    $pdo = new PDO('mysql:host=localhost;dbname=meudb', 'user', 'pass');
    $stmt = $pdo->prepare('INSERT INTO leads (nome, email, telefone) VALUES (?, ?, ?)');
    $stmt->execute([
        $leadData['nome'],
        $leadData['email'],
        $leadData['telefone']
    ]);

    // Enviar email
    mail(
        $leadData['email'],
        'Bem-vindo!',
        "Olá {$leadData['nome']}, obrigado pelo contato!"
    );
}

// Retornar sucesso
http_response_code(200);
echo json_encode(['success' => true]);
?>
```

---

### 4. Zapier/Make.com

1. **No CRM:**
   - Configure a integração com type: `zapier`
   - URL: Cole o webhook URL do Zapier/Make

2. **No Zapier:**
   - Trigger: **Webhooks by Zapier - Catch Hook**
   - Copie a URL gerada
   - Configure actions: Gmail, Sheets, Slack, etc.

3. **Teste:**
   - Use o botão "Testar Integração" no CRM
   - Verifique se o Zapier recebeu os dados

---

### 5. Google Sheets (via Apps Script)

```javascript
// No Google Sheets: Extensões → Apps Script

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // Verificar token (opcional)
  const token = e.parameter.token;
  if (token !== 'meu-token-secreto') {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.event === 'lead_created') {
    const lead = data.data;

    // Adicionar linha na planilha
    sheet.appendRow([
      new Date(),
      lead.nome,
      lead.email,
      lead.telefone,
      lead.cargo,
      lead.origem,
      lead.status
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Deploy:**
1. Salvar script
2. Implantar → Nova implementação → Aplicativo da Web
3. Quem tem acesso: **Qualquer pessoa**
4. Copiar URL e configurar no CRM

---

## 🔧 Gerenciar Integrações

### Listar todas as integrações

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/v1/integrations
```

### Ver estatísticas

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/v1/integrations/stats
```

Response:
```json
{
  "total": 3,
  "active": 2,
  "inactive": 1,
  "total_success": 150,
  "total_errors": 5
}
```

### Testar uma integração

```bash
curl -X POST \
  -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/v1/integrations/INTEGRATION_ID/test
```

Response:
```json
{
  "success": true,
  "status": 200,
  "response": { "received": true },
  "duration": 234
}
```

### Ver logs de uma integração

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  "http://localhost:3000/api/v1/integrations/INTEGRATION_ID/logs?limit=50"
```

### Ativar/Desativar

```bash
curl -X PATCH \
  -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/v1/integrations/INTEGRATION_ID/toggle
```

### Atualizar

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "url": "https://nova-url.com/webhook",
    "auth_token": "novo-token"
  }' \
  http://localhost:3000/api/v1/integrations/INTEGRATION_ID
```

### Deletar

```bash
curl -X DELETE \
  -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/v1/integrations/INTEGRATION_ID
```

---

## 🔒 Segurança

### Boas Práticas:

1. **Use HTTPS** em produção (nunca HTTP)
2. **Configure auth_token** sempre que possível
3. **Valide o token** no seu servidor
4. **Whiteliste IPs** se possível
5. **Monitore os logs** regularmente
6. **Desative integrações** não utilizadas

### Exemplo de validação no servidor:

```javascript
app.post('/webhook/leads', (req, res) => {
  // Validar token
  const token = req.headers.authorization?.replace('Bearer ', '');
  const EXPECTED_TOKEN = process.env.WEBHOOK_SECRET;

  if (token !== EXPECTED_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Validar IP (opcional)
  const clientIP = req.ip;
  const ALLOWED_IPS = ['123.456.789.0', '::1'];

  if (!ALLOWED_IPS.includes(clientIP)) {
    return res.status(403).json({ error: 'IP not allowed' });
  }

  // Processar webhook...
});
```

---

## 🐛 Troubleshooting

### Integração não dispara

- ✅ Verifique se está **ativa**
- ✅ Verifique se o evento está na lista de **events**
- ✅ Veja os **logs** da integração
- ✅ Teste manualmente com o botão "Testar"

### Erro 401/403

- ✅ Verifique se o **auth_token** está correto
- ✅ Seu servidor está validando o token corretamente?

### Erro 500

- ✅ Veja o **last_error** da integração
- ✅ Seu servidor está retornando 200 OK?
- ✅ A URL está acessível?

### Timeout

- ✅ Configure `timeout_ms` maior nas configurações
- ✅ Seu servidor está respondendo rápido o suficiente?

---

## 📊 Configurações Avançadas

### Retry on Failure

```json
{
  "config": {
    "retry_on_failure": true,
    "max_retries": 3,
    "timeout_ms": 5000
  }
}
```

### Custom Payload Template

```json
{
  "config": {
    "custom_payload_template": "{\"lead\": {{data}}, \"source\": \"crm\"}"
  }
}
```

### Headers Customizados

```json
{
  "headers": {
    "X-Custom-Header": "MyValue",
    "X-API-Version": "v2"
  }
}
```

---

## 🎯 Exemplos Práticos

### 1. Notificar no Slack

```javascript
// Configuração da integração:
{
  "name": "Notificações Slack",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "method": "POST",
  "config": {
    "custom_payload_template": "{\"text\": \"🎉 Novo lead: {{data.nome}} - {{data.email}}\"}"
  }
}
```

### 2. Enviar para ActiveCampaign

```javascript
{
  "name": "ActiveCampaign",
  "url": "https://youraccountname.api-us1.com/api/3/contacts",
  "auth_token": "YOUR_AC_API_KEY",
  "headers": {
    "Api-Token": "YOUR_AC_API_KEY"
  },
  "config": {
    "custom_payload_template": "{\"contact\": {\"email\": \"{{data.email}}\", \"firstName\": \"{{data.nome}}\"}}"
  }
}
```

### 3. Enviar para RD Station

```javascript
{
  "name": "RD Station",
  "url": "https://api.rd.services/platform/conversions",
  "auth_token": "YOUR_RD_TOKEN",
  "config": {
    "custom_payload_template": "{\"event_type\": \"CONVERSION\", \"event_family\": \"CDP\", \"payload\": {\"conversion_identifier\": \"lead_created\", \"email\": \"{{data.email}}\", \"name\": \"{{data.nome}}\"}}"
  }
}
```

---

## 📚 Referência Completa de API

### Endpoints:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/integrations` | Criar integração |
| GET | `/api/v1/integrations` | Listar todas |
| GET | `/api/v1/integrations/stats` | Estatísticas |
| GET | `/api/v1/integrations/:id` | Ver uma |
| GET | `/api/v1/integrations/:id/logs` | Ver logs |
| POST | `/api/v1/integrations/:id/test` | Testar |
| PATCH | `/api/v1/integrations/:id` | Atualizar |
| PATCH | `/api/v1/integrations/:id/toggle` | Ativar/Desativar |
| DELETE | `/api/v1/integrations/:id` | Deletar |

---

**Desenvolvido por Wesley A.Costa** 🚀

*CRM Público - Sistema completo de gestão de relacionamento com clientes*
