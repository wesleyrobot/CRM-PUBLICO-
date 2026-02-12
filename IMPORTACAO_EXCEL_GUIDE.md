# 📊 Guia Completo: Importação Inteligente de Leads

Sistema de importação com **IA** que entende planilhas bagunçadas e normaliza dados automaticamente!

## 🤖 Funcionalidades Inteligentes

### 1. Detecção Automática de Colunas

O sistema reconhece **mais de 50 variações** de nomes de colunas:

#### Nome
- ✅ `nome`, `Nome`, `NOME`, `name`, `Name`, `NAME`
- ✅ `cliente`, `Cliente`, `CLIENTE`, `contact`, `Contact`
- ✅ `pessoa`, `Pessoa`, `contato`, `Contato`

#### Email
- ✅ `email`, `Email`, `EMAIL`, `E-mail`, `e-mail`, `E-MAIL`
- ✅ `mail`, `Mail`, `correo`, `Correo`

#### Telefone
- ✅ `telefone`, `Telefone`, `TELEFONE`, `phone`, `Phone`, `PHONE`
- ✅ `celular`, `Celular`, `CELULAR`, `cel`, `Cel`, `CEL`
- ✅ `whatsapp`, `WhatsApp`, `WHATSAPP`, `zap`, `Zap`
- ✅ `fone`, `Fone`, `FONE`, `tel`, `Tel`, `TEL`
- ✅ `mobile`, `Mobile`, `numero`, `Numero`, `número`, `Número`

#### Razão Social
- ✅ `razao social`, `Razao Social`, `RAZAO SOCIAL`
- ✅ `razão social`, `Razão Social`, `RAZÃO SOCIAL`
- ✅ `razao_social`, `razão_social`, `RAZAO_SOCIAL`
- ✅ `corporate name`, `Corporate Name`, `legal name`, `Legal Name`

#### Empresa
- ✅ `empresa`, `Empresa`, `EMPRESA`, `company`, `Company`, `COMPANY`
- ✅ `organizacao`, `Organização`, `organization`, `Organization`

#### Cargo
- ✅ `cargo`, `Cargo`, `CARGO`, `position`, `Position`, `POSITION`
- ✅ `funcao`, `Função`, `FUNÇÃO`, `role`, `Role`, `ROLE`
- ✅ `titulo`, `Título`, `title`, `Title`

#### Origem
- ✅ `origem`, `Origem`, `ORIGEM`, `source`, `Source`, `SOURCE`
- ✅ `canal`, `Canal`, `CANAL`, `channel`, `Channel`
- ✅ `midia`, `Mídia`, `media`, `Media`

#### Observações
- ✅ `observacoes`, `Observações`, `OBSERVAÇÕES`, `observações`
- ✅ `obs`, `Obs`, `OBS`, `notes`, `Notes`, `NOTES`
- ✅ `comentarios`, `Comentários`, `comments`, `Comments`
- ✅ `descricao`, `Descrição`, `description`, `Description`

---

## 📱 Normalização de Telefone para WhatsApp

### Formatos Aceitos

O sistema aceita **QUALQUER** formato de telefone brasileiro:

```
11999999999
(11) 99999-9999
+55 11 99999-9999
011 9 9999-9999
5511999999999
11 9 9999-9999
(11)99999-9999
+55(11)99999-9999
```

### Saída Normalizada

Todos convertidos automaticamente para:
```
+55 (11) 99999-9999
```

### Funcionalidades da Normalização

- ✅ Remove todos os caracteres especiais
- ✅ Remove código de país (+55) se presente
- ✅ Remove zero inicial de telefones fixos antigos (0XX)
- ✅ Extrai o DDD automaticamente (primeiros 2 dígitos)
- ✅ Adiciona o 9 em celulares que não têm (números antigos)
- ✅ Formata no padrão internacional: `+55 (DD) 9XXXX-XXXX`
- ✅ Detecta telefones fixos e formata como: `+55 (DD) XXXX-XXXX`

### Extração de DDD

O sistema extrai e armazena o DDD separadamente:

| Telefone Original | WhatsApp Normalizado | DDD Extraído |
|-------------------|---------------------|--------------|
| 11999999999 | +55 (11) 99999-9999 | 11 |
| (21) 98888-8888 | +55 (21) 98888-8888 | 21 |
| +55 47 3333-4444 | +55 (47) 3333-4444 | 47 |

---

## 🧹 Limpeza e Normalização de Dados

### Nomes
- ✅ Capitalização inteligente: `joao silva` → `João Silva`
- ✅ Respeita preposições: `maria da silva` → `Maria da Silva`
- ✅ Remove espaços extras e quebras de linha
- ✅ Normaliza caracteres especiais

### Razão Social
- ✅ Converte para MAIÚSCULAS: `empresa ltda` → `EMPRESA LTDA`
- ✅ Remove espaços extras
- ✅ Limpa caracteres inválidos

### Email
- ✅ Converte para minúsculas: `JOAO@EMAIL.COM` → `joao@email.com`
- ✅ Remove espaços
- ✅ Valida formato

### Campos de Texto
- ✅ Remove espaços extras (`  texto  ` → `texto`)
- ✅ Remove quebras de linha (`\n`, `\r`)
- ✅ Normaliza espaços múltiplos

---

## 📋 Estrutura do Banco de Dados

Novos campos adicionados na tabela `leads`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `whatsapp` | VARCHAR(20) | Telefone normalizado no formato WhatsApp |
| `ddd` | VARCHAR(3) | DDD extraído automaticamente |
| `razao_social` | VARCHAR(200) | Razão social da empresa |

---

## 🚀 Como Usar

### 1. Acessar a Importação
```
http://localhost:3001/leads
→ Clique em "Importar Excel"
```

### 2. Baixar Template (Opcional)
- Clique em "Baixar Template"
- Use como referência para sua planilha

### 3. Preparar sua Planilha

**Formato:**
- ✅ `.xlsx`, `.xls` ou `.csv`
- ✅ Máximo 10MB
- ✅ Colunas em qualquer ordem
- ✅ Nomes de colunas em qualquer idioma/formato

**Exemplo de planilha válida:**

| NOME | FONE | mail | RAZAO SOCIAL | cargo |
|------|------|------|--------------|-------|
| joao silva | 11999999999 | JOAO@EMAIL.COM | empresa exemplo ltda | gerente |
| MARIA SANTOS | (21)988888888 | maria@email.com | TECH CORP | Diretora |
| Carlos Oliveira | +55 47 99999-9999 | carlos@email.com | | CTO |

### 4. Fazer Upload
- Arraste e solte o arquivo **OU**
- Clique para selecionar

### 5. Revisar Resultados
- ✅ Total de leads processados
- ✅ Sucessos e erros
- ✅ Detalhes linha por linha
- ✅ Dados normalizados exibidos

---

## 🎯 Casos de Uso

### Planilha Bagunçada? Sem Problema!

**Antes:**
```
Nome: joao silva
Telefone: 11999999999
E-mail: JOAO@EMAIL.COM
Empresa: empresa exemplo ltda
```

**Depois:**
```
Nome: João Silva
WhatsApp: +55 (11) 99999-9999
DDD: 11
Email: joao@email.com
Razão Social: EMPRESA EXEMPLO LTDA
```

### Múltiplos Formatos de Telefone

O sistema normaliza automaticamente:

```
11999999999           → +55 (11) 99999-9999
(21) 98888-8888       → +55 (21) 98888-8888
+55 47 99999-9999     → +55 (47) 99999-9999
011 9 8888-7777       → +55 (11) 98888-7777
5511987654321         → +55 (11) 98765-4321
```

### Colunas em Qualquer Idioma

| PT | EN | ES |
|----|----|----|
| nome | name | nombre |
| telefone | phone | telefono |
| empresa | company | empresa |
| cargo | position | posición |

Todos funcionam! 🌍

---

## ⚙️ API Backend

### Endpoint de Importação

```http
POST /api/v1/leads/import
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body:**
```
file: arquivo.xlsx
```

**Response:**
```json
{
  "total": 100,
  "sucesso": 98,
  "erros": 2,
  "detalhes": [
    {
      "linha": 2,
      "dados": {
        "nome": "João Silva",
        "email": "joao@email.com",
        "telefone": "+55 (11) 99999-9999",
        "ddd": "11",
        "razaoSocial": "EMPRESA EXEMPLO LTDA",
        "empresa": "Empresa Exemplo"
      },
      "status": "sucesso"
    },
    {
      "linha": 3,
      "dados": { ... },
      "erro": "Email inválido: abc",
      "status": "erro"
    }
  ]
}
```

### Endpoint de Template

```http
GET /api/v1/leads/template/download
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Arquivo Excel de exemplo

---

## 🔧 Tecnologias Utilizadas

### Backend
- **NestJS 11**: Framework principal
- **TypeORM**: ORM para PostgreSQL
- **xlsx**: Leitura e escrita de arquivos Excel
- **Multer**: Upload de arquivos

### Frontend
- **Next.js 16**: Framework React
- **Tailwind CSS 4**: Estilização
- **Drag and Drop**: Upload intuitivo

---

## 📊 Validações

### Campos Obrigatórios
- ✅ **Nome**: Obrigatório (sem ele a linha falha)

### Campos Opcionais com Validação
- ✅ **Email**: Validação de formato se fornecido
- ✅ **Telefone**: Normalização se fornecido
- ✅ **Outros campos**: Aceitos opcionalmente

### Tratamento de Erros
- ❌ Linha sem nome → Erro: "Campo 'nome' é obrigatório"
- ❌ Email inválido → Erro: "Email inválido: xyz"
- ✅ Linhas com erro não impedem outras de serem processadas

---

## 💡 Dicas Profissionais

### 1. Prepare sua Planilha
- Coloque headers na primeira linha
- Evite células mescladas
- Uma linha = Um lead

### 2. Formatos de Telefone
- Qualquer formato brasileiro funciona
- Sistema adiciona +55 automaticamente
- Celulares recebem o 9 se necessário

### 3. Razão Social
- Use para o nome legal da empresa
- Será convertido para MAIÚSCULAS
- Diferente do campo "empresa" (nome fantasia)

### 4. Teste com Poucos Dados
- Faça um teste com 5-10 linhas primeiro
- Verifique os resultados
- Depois importe o arquivo completo

### 5. Revise os Erros
- O sistema mostra exatamente qual linha falhou
- Corrija e reimporte apenas as linhas com erro

---

## 🎓 Exemplos Práticos

### Exemplo 1: Planilha Simples

```csv
nome,email,telefone
João Silva,joao@email.com,11999999999
Maria Santos,maria@email.com,(21)988888888
```

### Exemplo 2: Planilha Completa

```csv
Nome,Email,Celular,Razao Social,Empresa,Cargo,Origem
joao silva,JOAO@EMAIL.COM,11999999999,empresa exemplo ltda,Empresa Exemplo,gerente,website
MARIA SANTOS,maria@email.com,(21)988888888,tech corp sa,Tech Corp,Diretora,indicacao
```

### Exemplo 3: Planilha "Bagunçada"

```csv
NOME,FONE,mail,RAZAO SOCIAL
joao silva,11999999999,JOAO@EMAIL.COM,empresa ltda
MARIA,21988888888,maria@email.com,
```

**Todos funcionam perfeitamente!** ✅

---

## 🔒 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Limite de 10MB por arquivo
- ✅ Validação de formato de arquivo
- ✅ Sanitização de dados
- ✅ Proteção contra injeção

---

## 📈 Performance

- ✅ Processamento em lote
- ✅ Validação otimizada
- ✅ Relatório em tempo real
- ✅ Suporta milhares de linhas

---

**Desenvolvido por Wesley A. Costa** 🚀

*CRM Público - Sistema completo de gestão de leads com importação inteligente*
