# CRM System

Sistema de CRM desenvolvido com as seguintes tecnologias:

## Stack Tecnológica

### Front-end
- **React** - Biblioteca para interfaces de usuário
- **Next.js** - Framework React com SSR e SSG
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário

### Back-end
- **Node.js** - Runtime JavaScript
- **NestJS** - Framework progressivo Node.js
- **TypeScript** - Tipagem estática
- **TypeORM** - ORM para TypeScript

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional

---

## Estrutura do Projeto

```
CRM/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── main.ts         # Entry point da aplicação
│   │   ├── app.module.ts   # Módulo principal
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── .env.example        # Exemplo de variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Aplicação Next.js
│   ├── app/
│   │   ├── layout.tsx      # Layout principal
│   │   ├── page.tsx        # Página inicial
│   │   └── globals.css     # Estilos globais
│   ├── .env.local.example  # Exemplo de variáveis de ambiente
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
└── docker-compose.yml       # Configuração PostgreSQL
```

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (para o banco de dados)

---

## Configuração e Instalação

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd CRM
```

### 2. Configurar o Banco de Dados

Inicie o PostgreSQL usando Docker:

```bash
docker-compose up -d
```

Isso irá iniciar o PostgreSQL na porta 5432 com as seguintes credenciais:
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: crm_db

### 3. Configurar o Back-end

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
copy .env.example .env

# Editar o arquivo .env com suas configurações
# (As configurações padrão já funcionam com o Docker)
```

### 4. Configurar o Front-end

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
copy .env.local.example .env.local

# Editar o arquivo .env.local se necessário
```

---

## Executando o Projeto

### Executar o Back-end

```bash
cd backend
npm run start:dev
```

O servidor estará disponível em: `http://localhost:3001`

Endpoints disponíveis:
- `GET http://localhost:3001` - Mensagem de boas-vindas
- `GET http://localhost:3001/health` - Health check da API

### Executar o Front-end

Em outro terminal:

```bash
cd frontend
npm run dev
```

O aplicativo estará disponível em: `http://localhost:3000`

---

## Scripts Disponíveis

### Back-end

```bash
npm run start:dev    # Inicia o servidor em modo desenvolvimento
npm run build        # Compila o projeto
npm run start:prod   # Inicia o servidor em produção
```

### Front-end

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Compila o projeto para produção
npm run start        # Inicia o servidor em produção
npm run lint         # Executa o linter
```

---

## Variáveis de Ambiente

### Back-end (.env)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db
```

### Front-end (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Tecnologias e Dependências

### Back-end
- `@nestjs/core` - Core do NestJS
- `@nestjs/platform-express` - Adapter Express
- `@nestjs/typeorm` - Integração TypeORM
- `typeorm` - ORM para TypeScript
- `pg` - Driver PostgreSQL
- `reflect-metadata` - Metadata reflection
- `rxjs` - Programação reativa

### Front-end
- `react` - Biblioteca React
- `react-dom` - React DOM
- `next` - Framework Next.js
- `typescript` - TypeScript
- `tailwindcss` - Framework CSS
- `autoprefixer` - PostCSS plugin
- `eslint` - Linter

---

## Próximos Passos

1. Criar models/entities para o banco de dados
2. Implementar autenticação e autorização
3. Criar módulos de funcionalidades (clientes, vendas, etc.)
4. Implementar componentes React reutilizáveis
5. Configurar testes unitários e de integração
6. Implementar CI/CD

---

## Comandos Úteis do Docker

```bash
# Iniciar o PostgreSQL
docker-compose up -d

# Parar o PostgreSQL
docker-compose down

# Ver logs do PostgreSQL
docker-compose logs -f

# Remover volumes (apaga os dados)
docker-compose down -v
```

---

## Suporte

Para dúvidas ou problemas, consulte a documentação oficial:

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Licença

ISC
