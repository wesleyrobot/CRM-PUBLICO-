# 📡 CRM Público - Documentação de APIs

Este documento contém todas as informações necessárias para integrar sistemas externos com o CRM Público através de APIs.

## 🔑 Autenticação

Todas as APIs públicas utilizam **API Keys** para autenticação. Você pode gerenciar suas chaves através do painel do CRM.

### Como autenticar

Existem 3 formas de enviar sua API Key:

**1. Header X-API-Key (Recomendado)**
```bash
curl -H "X-API-Key: sua_chave_aqui" \
     https://api.seucrm.com/api/v1/public/leads
```

**2. Header Authorization Bearer**
```bash
curl -H "Authorization: Bearer sua_chave_aqui" \
     https://api.seucrm.com/api/v1/public/leads
```

**3. Query Parameter**
```bash
curl https://api.seucrm.com/api/v1/public/leads?api_key=sua_chave_aqui
```

---

## 🎯 Endpoints Disponíveis

### 1. Webhook para Receber Leads

**POST** `/api/v1/public/webhook/leads`

Recebe leads de campanhas externas, landing pages, formulários, etc.

**Permissão necessária:** `criar_leads`

#### Request Body

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "cargo": "Gerente de TI",
  "origem": "landing-page-promocao",
  "interesse": "Produto Premium",
  "observacoes": "Demonstrou interesse em plano empresarial",
  "custom_fields": {
    "empresa": "Tech Solutions",
    "tamanho_empresa": "50-100 funcionários",
    "orcamento": "R$ 50.000"
  }
}
```

#### Campos Obrigatórios
- `nome` - Nome do lead
- `email` - Email do lead

#### Campos Opcionais
- `telefone` - Telefone de contato
- `cargo` - Cargo/Posição
- `origem` - Origem do lead (padrão: "webhook")
- `status` - Status inicial (padrão: "novo")
- `pontuacao` - Pontuação de qualificação (0-100)
- `interesse` - Área de interesse
- `observacoes` - Observações adicionais
- `empresa_id` - ID da empresa (se já cadastrada)
- `custom_fields` - Campos customizados (objeto JSON)

#### Response (Sucesso)

```json
{
  "success": true,
  "message": "Lead recebido com sucesso",
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-11T20:30:00.000Z"
}
```

#### Response (Erro)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Campos obrigatórios: nome e email são necessários",
  "timestamp": "2026-02-11T20:30:00.000Z"
}
```

#### Exemplo cURL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SUA_API_KEY" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999",
    "origem": "landing-page"
  }' \
  http://localhost:3000/api/v1/public/webhook/leads
```

#### Exemplo JavaScript/Fetch

```javascript
fetch('http://localhost:3000/api/v1/public/webhook/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'SUA_API_KEY'
  },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '11999999999',
    origem: 'formulario-contato'
  })
})
  .then(res => res.json())
  .then(data => console.log('Lead criado:', data.lead_id))
  .catch(err => console.error('Erro:', err));
```

#### Exemplo PHP

```php
<?php
$apiKey = 'SUA_API_KEY';
$url = 'http://localhost:3000/api/v1/public/webhook/leads';

$data = [
    'nome' => 'João Silva',
    'email' => 'joao@email.com',
    'telefone' => '11999999999',
    'origem' => 'site'
];

$options = [
    'http' => [
        'header' => [
            "Content-Type: application/json",
            "X-API-Key: $apiKey"
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

echo "Lead criado: " . $response['lead_id'];
?>
```

---

### 2. Consultar Leads

**GET** `/api/v1/public/leads`

Consulta e exporta leads do sistema.

**Permissão necessária:** `ler_leads`

#### Query Parameters

- `page` (opcional) - Número da página (padrão: 1)
- `limit` (opcional) - Registros por página (máx: 100, padrão: 50)
- `status` (opcional) - Filtrar por status (novo, qualificado, convertido, etc.)
- `origem` (opcional) - Filtrar por origem (website, landing-page, etc.)
- `data_inicio` (opcional) - Data inicial (formato: YYYY-MM-DD)
- `data_fim` (opcional) - Data final (formato: YYYY-MM-DD)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "11999999999",
      "cargo": "Gerente",
      "status": "novo",
      "origem": "website",
      "pontuacao": 75,
      "criado_em": "2026-02-11T20:00:00.000Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  },
  "timestamp": "2026-02-11T20:30:00.000Z"
}
```

#### Exemplo cURL

```bash
curl -H "X-API-Key: SUA_API_KEY" \
     "http://localhost:3000/api/v1/public/leads?page=1&limit=50&status=novo"
```

---

### 3. Estatísticas de Leads

**GET** `/api/v1/public/leads/stats`

Retorna estatísticas gerais sobre os leads.

**Permissão necessária:** `ler_leads`

#### Response

```json
{
  "success": true,
  "stats": {
    "total": 500,
    "novos": 150,
    "qualificados": 200,
    "convertidos": 100,
    "perdidos": 50
  },
  "timestamp": "2026-02-11T20:30:00.000Z"
}
```

---

## 🔧 Gerenciamento de API Keys

### 1. Criar Nova API Key

**POST** `/api/v1/keys`

Requer autenticação JWT (login no sistema).

#### Request Body

```json
{
  "nome": "API Webhook Landing Page",
  "descricao": "Chave para receber leads da landing page de promoção",
  "expira_em": "2027-12-31T23:59:59Z",
  "permissoes": {
    "criar_leads": true,
    "ler_leads": true,
    "atualizar_leads": false,
    "deletar_leads": false,
    "ler_clientes": false,
    "ler_empresas": false
  }
}
```

#### Response

```json
{
  "id": "uuid",
  "nome": "API Webhook Landing Page",
  "chave": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "permissoes": { ... },
  "criado_em": "2026-02-11T20:30:00.000Z",
  "aviso": "ATENÇÃO: Guarde esta chave em local seguro. Ela não será mostrada novamente!"
}
```

**⚠️ IMPORTANTE:** A chave completa só é mostrada uma vez, na criação. Guarde em local seguro!

---

### 2. Listar API Keys

**GET** `/api/v1/keys`

Lista todas as API Keys do usuário (chaves parcialmente ocultas).

#### Response

```json
[
  {
    "id": "uuid",
    "nome": "API Webhook Landing Page",
    "chave": "********e1f2",
    "ativo": true,
    "ultimo_uso": "2026-02-11T15:00:00.000Z",
    "criado_em": "2026-02-01T10:00:00.000Z"
  }
]
```

---

### 3. Ativar/Desativar API Key

**PATCH** `/api/v1/keys/:id/toggle`

Alterna entre ativo/inativo.

---

### 4. Deletar API Key

**DELETE** `/api/v1/keys/:id`

Remove permanentemente uma API Key.

---

## 🌐 Exemplos de Integração

### Landing Page com Formulário

```html
<!DOCTYPE html>
<html>
<head>
    <title>Formulário de Contato</title>
</head>
<body>
    <form id="contactForm">
        <input type="text" name="nome" placeholder="Nome" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="tel" name="telefone" placeholder="Telefone">
        <button type="submit">Enviar</button>
    </form>

    <script>
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const data = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                origem: 'landing-page-promocao'
            };

            try {
                const response = await fetch('http://localhost:3000/api/v1/public/webhook/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': 'SUA_API_KEY_AQUI'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Obrigado! Entraremos em contato em breve.');
                    e.target.reset();
                } else {
                    alert('Erro ao enviar formulário. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao enviar formulário.');
            }
        });
    </script>
</body>
</html>
```

---

### Zapier / Make.com (Webhook)

1. Configure um **Webhook** no Zapier/Make
2. Use a URL: `http://localhost:3000/api/v1/public/webhook/leads`
3. Método: **POST**
4. Headers:
   - `Content-Type: application/json`
   - `X-API-Key: SUA_CHAVE`
5. Mapeie os campos do trigger para o formato do CRM

---

### WordPress (Contact Form 7)

```php
// functions.php

add_action('wpcf7_mail_sent', 'enviar_lead_para_crm');

function enviar_lead_para_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $data = $submission->get_posted_data();

    $lead = array(
        'nome' => $data['your-name'],
        'email' => $data['your-email'],
        'telefone' => $data['your-phone'],
        'observacoes' => $data['your-message'],
        'origem' => 'wordpress-contact-form-7'
    );

    $response = wp_remote_post('http://localhost:3000/api/v1/public/webhook/leads', array(
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-API-Key' => 'SUA_API_KEY'
        ),
        'body' => json_encode($lead)
    ));

    if (is_wp_error($response)) {
        error_log('Erro ao enviar lead: ' . $response->get_error_message());
    }
}
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha sua API Key**
   - Não commite no Git
   - Não envie por email/Slack
   - Use variáveis de ambiente

2. **Use HTTPS em produção**
   - As API Keys trafegam em texto plano
   - HTTPS criptografa a comunicação

3. **Defina permissões mínimas**
   - Dê apenas as permissões necessárias
   - Uma key para receber leads não precisa ler clientes

4. **Configure expiração**
   - Use chaves com data de expiração
   - Renove periodicamente

5. **Monitore o uso**
   - Verifique `ultimo_uso` regularmente
   - Desative keys não utilizadas

6. **Rotação de chaves**
   - Crie nova key
   - Atualize todas as integrações
   - Delete a antiga

---

## 📊 Limites e Rate Limiting

- **Máximo de 100 registros por página** na consulta de leads
- **Rate limiting aplicado** conforme configuração do servidor
- Em caso de muitas requisições, você receberá erro `429 Too Many Requests`

---

## ❌ Códigos de Erro

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - API Key inválida ou ausente |
| 403 | Forbidden - Sem permissão para esta operação |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

---

## 💡 Dicas

### Testando sua integração

```bash
# Teste básico
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SUA_KEY" \
  -d '{"nome":"Teste","email":"teste@email.com"}' \
  http://localhost:3000/api/v1/public/webhook/leads

# Teste com mais dados
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SUA_KEY" \
  -d '{
    "nome": "Lead de Teste",
    "email": "teste@email.com",
    "telefone": "11999999999",
    "origem": "teste-api",
    "interesse": "Produto Premium",
    "observacoes": "Este é um lead de teste"
  }' \
  http://localhost:3000/api/v1/public/webhook/leads
```

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:
- Email: suporte@crm.com
- Documentação: https://docs.crm.com
- GitHub: https://github.com/seu-usuario/crm-publico

---

**Desenvolvido por Wesley A.Costa** 🚀
