# 📊 CRM Export to Excel - Guia Completo

Sistema completo de exportação de dados do CRM para Excel usando Python.

## 🚀 Visão Geral

O sistema permite exportar todos os dados do dashboard (leads, clientes, empresas, estatísticas) em um arquivo Excel formatado e profissional.

## 📋 Pré-requisitos

### Python e Bibliotecas

```bash
# Instalar Python 3.8+ (se não tiver)
# Windows: https://python.org/downloads
# Linux: sudo apt install python3 python3-pip
# Mac: brew install python3

# Instalar dependências
pip install requests pandas openpyxl
```

## 🔐 Autenticação

Antes de exportar, você precisa de um token JWT válido.

### Opção 1: Login via API

```bash
# Linux/Mac
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","senha":"Admin@123"}' \
  | jq -r '.data.accessToken'

# Windows PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@crm.com","senha":"Admin@123"}'
$response.data.accessToken
```

### Opção 2: Copiar do Browser

1. Faça login no frontend (http://localhost:3001)
2. Abra DevTools (F12)
3. Vá em Application > Local Storage
4. Copie o valor de `@crm:token`

## 💾 Usando o Script de Export

### Uso Básico

```bash
# Exportar dados do mês atual
python export_to_excel.py --token "SEU_TOKEN_JWT_AQUI"
```

### Opções Avançadas

```bash
# Exportar período específico
python export_to_excel.py --period week --token "SEU_TOKEN_JWT"
python export_to_excel.py --period quarter --token "SEU_TOKEN_JWT"

# Definir nome do arquivo de saída
python export_to_excel.py --output relatorio_jan2026.xlsx --token "SEU_TOKEN_JWT"

# API customizada
python export_to_excel.py --api-url http://seu-servidor:3000/api/v1 --token "SEU_TOKEN_JWT"
```

### Períodos Disponíveis

- `today` - Dados de hoje
- `week` - Semana atual
- `month` - Mês atual (padrão)
- `quarter` - Trimestre atual
- `year` - Ano atual
- `all` - Todo o período

## 📦 Estrutura do Arquivo Excel

O arquivo gerado contém 5 abas:

### 1. Resumo Geral
- Total de leads, clientes, empresas
- Crescimento percentual
- Taxa de conversão
- Leads qualificados/perdidos
- Metadata do relatório

### 2. Leads
Colunas:
- ID
- Nome
- E-mail
- Telefone
- Status
- Origem
- Valor Estimado
- Empresa
- Segmento
- Responsável
- Criado Em
- Atualizado Em

### 3. Clientes
Colunas:
- ID
- Nome
- E-mail
- Telefone
- Cargo
- Ativo
- Empresa
- Segmento
- Responsável
- Criado Em
- Atualizado Em

### 4. Empresas
Colunas:
- ID
- Nome
- CNPJ
- Segmento
- Ativo
- Telefone
- E-mail
- Site
- Total Leads
- Total Clientes
- Criado Em
- Atualizado Em

### 5. Timeline
- Período
- Leads (por período)
- Clientes (por período)

## 🎨 Formatação

O script aplica automaticamente:
- ✅ Cabeçalhos coloridos (verde #00FF88)
- ✅ Fonte em negrito para cabeçalhos
- ✅ Bordas nas células
- ✅ Ajuste automático da largura das colunas
- ✅ Primeira linha congelada para scroll
- ✅ Formatação de datas (DD/MM/YYYY HH:MM)
- ✅ Formatação de valores monetários (R$ X.XXX,XX)
- ✅ Formatação de booleanos (Sim/Não)

## 🌐 Exportação via Frontend

### Método 1: Botão de Export (JSON)

No dashboard do frontend, clique no botão de download (📥) para exportar os dados em JSON. Depois, use o script Python para converter:

```bash
# Assumindo que você baixou dashboard_export_2026-02-07.json
python export_to_excel.py --token "SEU_TOKEN_JWT" --period month
```

### Método 2: API Direta

```bash
# Fazer request direto ao endpoint de export
curl -H "Authorization: Bearer SEU_TOKEN_JWT" \
  "http://localhost:3000/api/v1/dashboard/export?period=month" \
  > dashboard_data.json

# Processar com Python (modifique o script para ler arquivo local)
```

## 🔧 Troubleshooting

### Erro: "Biblioteca necessária não encontrada"

```bash
pip install --upgrade requests pandas openpyxl
```

### Erro: "Não autorizado" (401)

- Verifique se o token JWT é válido
- Tokens expiram após 1 hora, faça login novamente
- Confirme que o backend está rodando

### Erro: "Erro ao buscar dados"

- Verifique se o backend está rodando (`http://localhost:3000`)
- Confirme a URL da API (--api-url)
- Verifique sua conexão de rede

### Excel não abre ou está corrompido

- Instale a versão mais recente do openpyxl: `pip install --upgrade openpyxl`
- Verifique se há espaço em disco suficiente
- Tente um nome de arquivo diferente

## 📊 Exemplo Completo

```bash
# 1. Fazer login e obter token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","senha":"Admin@123"}' \
  | jq -r '.data.accessToken')

# 2. Exportar dados do trimestre
python export_to_excel.py \
  --period quarter \
  --output relatorio_Q1_2026.xlsx \
  --token "$TOKEN"

# 3. Abrir o arquivo
# Windows
start relatorio_Q1_2026.xlsx

# Mac
open relatorio_Q1_2026.xlsx

# Linux
xdg-open relatorio_Q1_2026.xlsx
```

## 🔄 Integração com Frontend

O dashboard frontend agora está **totalmente integrado com o backend**:

### Funcionalidades Ativas:

- ✅ **Dados em Tempo Real**: Métricas atualizadas automaticamente do backend
- ✅ **Auto-Refresh**: Dashboard recarrega dados a cada 60 segundos
- ✅ **Filtro por Período**: Botões para alterar período (Hoje, Semana, Mês, Trimestre)
- ✅ **Botão Refresh**: Atualizar dados manualmente
- ✅ **Botão Export**: Baixar dados em JSON para processamento
- ✅ **Estados de Loading**: Indicadores visuais durante carregamento
- ✅ **Tratamento de Erros**: Mensagens amigáveis em caso de falha

### Como Usar no Frontend:

1. Faça login no sistema
2. O dashboard carregará automaticamente os dados reais do backend
3. Use os filtros de período para visualizar diferentes intervalos
4. Clique no botão de refresh (🔄) para atualizar manualmente
5. Clique no botão de download (📥) para exportar dados em JSON
6. Use o script Python para converter JSON em Excel

## 📝 Notas Importantes

1. **Limites**: O export é limitado a 1000 registros por tipo (leads, clientes, empresas)
2. **Performance**: Exports grandes podem demorar alguns segundos
3. **Segurança**: Nunca compartilhe seu token JWT publicamente
4. **Memória**: Exports muito grandes podem consumir memória RAM considerável
5. **Timezone**: Todas as datas são formatadas para o timezone do servidor

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs do backend: `docker logs crm-backend`
2. Verifique os logs do script Python
3. Abra uma issue no repositório do GitHub
4. Consulte a documentação da API: `http://localhost:3000/api/docs`

## 🎯 Roadmap Futuro

- [ ] Export direto para Excel (sem necessidade de Python)
- [ ] Agendamento automático de exports
- [ ] Envio de relatórios por email
- [ ] Templates personalizáveis
- [ ] Gráficos e visualizações no Excel
- [ ] Export para PDF
- [ ] Dashboard interativo no Excel

---

Desenvolvido com ❤️ para o CRM Público Mr.Robot
