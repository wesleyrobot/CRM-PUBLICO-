# Contribuindo para o CRM Público

Primeiramente, obrigado por considerar contribuir para o CRM Público! 🎉

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Mensagens de Commit](#mensagens-de-commit)
- [Pull Requests](#pull-requests)

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em manter esse código.

## Como Posso Contribuir?

### Reportando Bugs

Antes de criar um relatório de bug, verifique se já não existe uma issue sobre o problema.

**Como criar um bom relatório de bug:**

- Use um título claro e descritivo
- Descreva os passos exatos para reproduzir o problema
- Forneça exemplos específicos
- Descreva o comportamento observado e o esperado
- Inclua screenshots se aplicável
- Inclua detalhes do ambiente (SO, versão do Node.js, etc.)

### Sugerindo Melhorias

**Como criar uma boa sugestão:**

- Use um título claro e descritivo
- Forneça uma descrição detalhada da melhoria sugerida
- Explique por que essa melhoria seria útil
- Liste exemplos de como a feature funcionaria

### Contribuindo com Código

1. **Fork o repositório**
2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/CRM-PUBLICO-.git
   cd CRM-PUBLICO-
   ```

3. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-bug-fix
   ```

4. **Configure o ambiente**
   ```bash
   # Backend
   cd backend
   npm install
   cp .env.example .env

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Faça suas alterações**
   - Escreva código limpo e documentado
   - Adicione testes para novas funcionalidades
   - Mantenha a cobertura de testes acima de 90%

6. **Execute os testes**
   ```bash
   # Backend
   npm run test
   npm run test:e2e
   npm run test:cov

   # Frontend
   npm run test
   npm run lint
   ```

7. **Commit suas alterações**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

8. **Push para o GitHub**
   ```bash
   git push origin feature/minha-feature
   ```

9. **Abra um Pull Request**

## Processo de Desenvolvimento

### Estrutura de Branches

- `main` - Produção estável
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes para produção

### Workflow

1. Todas as features devem partir de `develop`
2. Pull Requests devem ter pelo menos 1 revisão aprovada
3. CI deve passar (testes, lint, build)
4. Cobertura de testes não pode diminuir

## Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Evite `any`, prefira tipos específicos
- Use interfaces para objetos complexos
- Documente funções públicas com JSDoc

### NestJS (Backend)

- Siga o padrão de módulos do NestJS
- Use DTOs para validação
- Implemente tratamento de erros adequado
- Escreva testes unitários e E2E

### Next.js (Frontend)

- Use componentes funcionais com hooks
- Separe lógica de negócio dos componentes
- Use Tailwind CSS para estilização
- Implemente loading states e error boundaries

### Nomenclatura

- **Arquivos**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Funções/Variáveis**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Componentes React**: PascalCase (`UserCard`)

## Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta o código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção

### Exemplos

```bash
feat(auth): adiciona refresh token automático
fix(dashboard): corrige cálculo de taxa de conversão
docs(readme): atualiza instruções de instalação
test(users): adiciona testes para UserService
```

## Pull Requests

### Checklist

Antes de submeter um PR, certifique-se de que:

- [ ] O código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam localmente
- [ ] A documentação foi atualizada (se necessário)
- [ ] O título do PR segue o padrão de commits
- [ ] O PR está vinculado a uma issue (se aplicável)

### Template

```markdown
## Descrição
Breve descrição do que foi alterado e por quê.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)

## Checklist
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Documentação atualizada
```

## Dúvidas?

Sinta-se à vontade para abrir uma issue com a tag `question` ou entrar em contato:

- Email: wesleymr.robot@gmail.com
- LinkedIn: [Wesley Costa](https://www.linkedin.com/in/wesley-costa-27b96636b)

---

Novamente, obrigado por contribuir! 🚀
