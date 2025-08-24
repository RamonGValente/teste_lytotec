
# Guia de Contribuição 🤝

Obrigado por considerar contribuir para o Sistema de Gestão de Asfalto e Logística! Este documento fornece diretrizes para contribuições efetivas e colaboração harmoniosa.

## 📋 Índice

1. [Como Contribuir](#como-contribuir)
2. [Tipos de Contribuição](#tipos-de-contribuição)
3. [Configurando o Ambiente](#configurando-o-ambiente)
4. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
5. [Padrões de Código](#padrões-de-código)
6. [Commits e Pull Requests](#commits-e-pull-requests)
7. [Reportando Bugs](#reportando-bugs)
8. [Sugerindo Melhorias](#sugerindo-melhorias)
9. [Documentação](#documentação)
10. [Comunidade](#comunidade)

## Como Contribuir

### Primeiros Passos

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Configure** o ambiente de desenvolvimento
4. **Crie** uma branch para sua contribuição
5. **Faça** suas mudanças
6. **Teste** suas alterações
7. **Submeta** um Pull Request

### Antes de Começar

- ✅ Leia este guia completamente
- ✅ Verifique issues existentes
- ✅ Discuta mudanças grandes antes de implementar
- ✅ Certifique-se de que sua contribuição agrega valor

## Tipos de Contribuição

### 🐛 Correção de Bugs
- Correções de problemas identificados
- Melhorias de estabilidade
- Patches de segurança

### ✨ Novas Funcionalidades
- Implementação de recursos solicitados
- Melhorias na experiência do usuário
- Extensões de módulos existentes

### 📚 Documentação
- Melhoria da documentação existente
- Criação de tutoriais
- Exemplos de uso

### 🧪 Testes
- Adição de testes unitários
- Testes de integração
- Melhoria da cobertura de testes

### 🎨 Interface
- Melhorias de UX/UI
- Responsividade
- Acessibilidade

### ⚡ Performance
- Otimizações de código
- Melhorias de performance
- Redução de bundle size

## Configurando o Ambiente

### Pré-requisitos

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Git
git --version
```

### Instalação

```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU_USUARIO/sistema-asfalto.git
cd sistema-asfalto

# 2. Adicione o repositório upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/sistema-asfalto.git

# 3. Instale dependências
npm install

# 4. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 5. Execute o projeto
npm run dev
```

### Verificação da Instalação

```bash
# Execute os testes
npm test

# Verifique linting
npm run lint

# Verifique tipos TypeScript
npm run type-check

# Build do projeto
npm run build
```

## Processo de Desenvolvimento

### Workflow Git

```bash
# 1. Sincronize com upstream
git checkout main
git pull upstream main

# 2. Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# 3. Faça suas alterações
# ... codifique ...

# 4. Commit suas mudanças
git add .
git commit -m "feat: descrição da mudança"

# 5. Mantenha sua branch atualizada
git pull upstream main
git push origin feature/nome-da-feature

# 6. Abra um Pull Request
```

### Estrutura de Branches

```
main                    # Branch principal (protegida)
├── develop            # Branch de desenvolvimento
├── feature/nova-func  # Branches de funcionalidades
├── fix/corrigir-bug   # Branches de correções
├── docs/documentacao  # Branches de documentação
└── release/v1.1.0     # Branches de release
```

### Nomeação de Branches

```bash
# Funcionalidades
feature/adicionar-modulo-estoque
feature/melhorar-dashboard
feature/implementar-notificacoes

# Correções
fix/corrigir-calculo-espessura
fix/resolver-problema-upload
fix/ajustar-validacao-cpf

# Documentação
docs/atualizar-readme
docs/guia-contribuicao
docs/api-documentation

# Melhorias
improve/otimizar-queries
improve/melhorar-performance
improve/refatorar-componentes
```

## Padrões de Código

### Estrutura de Arquivos

```typescript
// Estrutura de componente padrão
src/components/ModuleName/
├── index.ts                    # Export barrel
├── ComponentName.tsx           # Componente principal
├── ComponentName.test.tsx      # Testes
├── ComponentName.stories.tsx   # Storybook (se aplicável)
├── hooks/                      # Hooks específicos
│   └── useComponentName.ts
├── utils/                      # Utilitários específicos
│   └── componentUtils.ts
└── types/                      # Tipos específicos
    └── componentTypes.ts
```

### Convenções TypeScript

```typescript
// ✅ Bom - Nomes descritivos
interface FuncionarioFormData {
  nome_completo: string;
  email: string;
  empresa_id: string;
}

// ✅ Bom - Tipos específicos
type StatusEntrega = 'Ativa' | 'Enviada' | 'Entregue' | 'Cancelada';

// ✅ Bom - Props tipadas
interface ComponentProps {
  title: string;
  isLoading?: boolean;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}

// ❌ Ruim - Tipos genéricos demais
interface Props {
  data: any;
  callback: Function;
}
```

### Convenções React

```typescript
// ✅ Bom - Componente funcional tipado
export const FuncionarioForm: React.FC<FuncionarioFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  // Hooks primeiro
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Handlers
  const handleSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({ title: 'Sucesso', description: 'Dados salvos' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar' });
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit, toast]);
  
  // Early returns
  if (!initialData) {
    return <Skeleton />;
  }
  
  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
};

// ✅ Bom - Hook customizado
export const useFuncionarioForm = (initialData?: Funcionario) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FuncionarioFormData>({
    defaultValues: initialData || getDefaultValues(),
    resolver: zodResolver(funcionarioSchema),
  });
  
  const onSubmit = useCallback(async (data: FuncionarioFormData) => {
    // Implementação
  }, []);
  
  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
```

### Convenções CSS/Tailwind

```typescript
// ✅ Bom - Classes organizadas
<div className="
  flex items-center justify-between
  w-full max-w-md
  p-4 mb-4
  bg-white border border-gray-200 rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">

// ✅ Bom - Componente reutilizável
const Button = ({ variant, size, children, ...props }) => {
  const baseClasses = "font-medium rounded-md transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Validações com Zod

```typescript
// ✅ Bom - Schema bem estruturado
export const funcionarioSchema = z.object({
  // Campos obrigatórios com validações específicas
  nome_completo: z.string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .refine(isValidCPF, 'CPF inválido'),
  
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  // Validações condicionais
  data_nascimento: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const age = calculateAge(new Date(date));
      return age >= 16 && age <= 80;
    }, 'Idade deve estar entre 16 e 80 anos'),
  
  // Relacionamentos
  empresa_id: z.string().uuid('Empresa é obrigatória'),
});

// Validações customizadas
export const isValidCPF = (cpf: string): boolean => {
  // Implementação da validação de CPF
  return validateCPFAlgorithm(cpf);
};
```

## Commits e Pull Requests

### Conventional Commits

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

#### Tipos de Commit

```bash
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Mudanças na documentação
style:    # Formatação, sem mudança de lógica
refactor: # Refatoração sem mudança de funcionalidade
test:     # Adição ou correção de testes
chore:    # Mudanças de build, deps, etc.
perf:     # Melhorias de performance
ci:       # Mudanças no CI/CD
build:    # Mudanças no sistema de build
revert:   # Reverter commit anterior
```

#### Exemplos de Commits

```bash
# Funcionalidades
feat(funcionarios): adicionar validação de CPF
feat(dashboard): implementar gráfico de produtividade
feat: adicionar sistema de notificações

# Correções
fix(aplicacao): corrigir cálculo de espessura
fix(auth): resolver problema de login
fix: ajustar responsividade em mobile

# Documentação
docs(readme): atualizar instruções de instalação
docs: adicionar guia de contribuição
docs(api): documentar endpoints de usuários

# Melhorias
perf(queries): otimizar consultas ao banco
refactor(components): simplificar estrutura de forms
style(lint): corrigir problemas de formatação

# Testes
test(utils): adicionar testes para formatadores
test: aumentar cobertura de testes para 80%

# Chores
chore(deps): atualizar React para v18
chore: configurar GitHub Actions
build: otimizar bundle de produção
```

### Mensagens de Commit Detalhadas

```bash
# Commit simples
feat(funcionarios): adicionar validação de CPF

# Commit com corpo
feat(funcionarios): adicionar validação de CPF

Implementa validação completa de CPF incluindo:
- Verificação de formato
- Validação de dígitos verificadores
- Mensagens de erro específicas
- Testes unitários

# Commit com breaking change
feat(api)!: alterar estrutura de resposta da API

BREAKING CHANGE: A estrutura de resposta da API mudou.
Antes: { data: [], success: true }
Agora: { result: [], status: 'success', meta: {} }

Migrate: Atualize o código cliente para usar 'result' ao invés de 'data'
```

### Pull Request Template

```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de Mudança
- [ ] 🐛 Bug fix (mudança que corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (correção/funcionalidade que quebra compatibilidade)
- [ ] 📚 Mudança de documentação
- [ ] 🎨 Mudança de estilo/formatação
- [ ] ♻️ Refatoração de código
- [ ] ⚡ Melhoria de performance
- [ ] 🧪 Adição/correção de testes

## Motivação e Contexto
Por que essa mudança é necessária? Qual problema resolve?

## Como Foi Testado?
Descreva os testes realizados para verificar suas mudanças.

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes manuais
- [ ] Testes em diferentes navegadores
- [ ] Testes em dispositivos móveis

## Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## Checklist
- [ ] Meu código segue as convenções do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei código complexo quando necessário
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que a correção é efetiva
- [ ] Testes novos e existentes passam localmente
- [ ] Mudanças dependentes foram mergeadas e publicadas

## Issues Relacionadas
Fixes #(issue_number)
Closes #(issue_number)
Related to #(issue_number)
```

## Reportando Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do que é o bug.

**Para Reproduzir**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '....'
3. Role para baixo até '....'
4. Veja erro

**Comportamento Esperado**
Uma descrição clara e concisa do que você esperava que acontecesse.

**Comportamento Atual**
Uma descrição clara e concisa do que realmente acontece.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar seu problema.

**Ambiente:**
 - OS: [e.g. Windows 11, macOS 12.0]
 - Navegador: [e.g. chrome 96, firefox 95]
 - Versão do Sistema: [e.g. 1.0.0]
 - Dispositivo: [e.g. Desktop, iPhone 12]

**Console Logs**
```
Cole aqui os logs do console (F12 -> Console)
```

**Contexto Adicional**
Adicione qualquer contexto adicional sobre o problema aqui.

**Possível Solução**
Se você tem uma ideia de como corrigir, descreva aqui.
```

### Investigação de Bugs

Antes de reportar um bug:

1. **Verifique** se não é um problema local
2. **Reproduza** o problema consistentemente
3. **Pesquise** issues existentes
4. **Colete** todas as informações necessárias
5. **Teste** em diferentes ambientes se possível

## Sugerindo Melhorias

### Template de Feature Request

```markdown
**A sua solicitação de funcionalidade está relacionada a um problema? Descreva.**
Uma descrição clara e concisa de qual é o problema. Ex: Eu fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara e concisa de quaisquer soluções ou funcionalidades alternativas que você considerou.

**Impacto Esperado**
Como essa funcionalidade beneficiaria os usuários?

**Mockups/Wireframes**
Se aplicável, adicione esboços visuais da funcionalidade.

**Contexto Adicional**
Adicione qualquer contexto ou screenshots sobre a solicitação de funcionalidade aqui.

**Prioridade**
- [ ] Baixa - seria bom ter
- [ ] Média - importante para o workflow
- [ ] Alta - bloqueador ou funcionalidade essencial
- [ ] Crítica - necessário para o funcionamento básico
```

### Processo de Avaliação

Sugestões passam por:

1. **Triagem** - Análise inicial da proposta
2. **Discussão** - Debate com a comunidade
3. **Especificação** - Detalhamento técnico
4. **Priorização** - Inclusão no roadmap
5. **Implementação** - Desenvolvimento da funcionalidade

## Documentação

### Documentando Código

```typescript
/**
 * Calcula a espessura do asfalto aplicado
 * 
 * @param massa - Massa aplicada em toneladas
 * @param area - Área da aplicação em metros quadrados
 * @param densidade - Densidade do asfalto (padrão: 2.4 t/m³)
 * @returns Espessura em centímetros
 * 
 * @example
 * ```typescript
 * const espessura = calculateEspessura(5, 100, 2.4);
 * console.log(espessura); // 2.08
 * ```
 * 
 * @throws {Error} Quando área é menor ou igual a zero
 */
export const calculateEspessura = (
  massa: number, 
  area: number, 
  densidade: number = 2.4
): number => {
  if (area <= 0) {
    throw new Error('Área deve ser maior que zero');
  }
  
  return (massa / area) / densidade * 100;
};
```

### README de Componentes

```markdown
# ComponentName

Breve descrição do que o componente faz.

## Uso

```tsx
import { ComponentName } from '@/components/ComponentName';

<ComponentName
  prop1="value"
  prop2={true}
  onAction={handleAction}
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| prop1 | string | - | Descrição da prop1 |
| prop2 | boolean | false | Descrição da prop2 |
| onAction | function | - | Callback executado quando... |

## Variantes

### Variante 1
Descrição e exemplo de uso

### Variante 2
Descrição e exemplo de uso

## Acessibilidade

- Suporte a teclado
- ARIA labels apropriados
- Contraste adequado

## Testes

Para executar testes:
```bash
npm test ComponentName
```
```

### Documentação de APIs

```typescript
/**
 * @fileoverview Serviço para gerenciamento de funcionários
 * @module FuncionarioService
 */

/**
 * Interface para dados de criação de funcionário
 */
export interface CreateFuncionarioData {
  nome_completo: string;
  cpf: string;
  email?: string;
  empresa_id: string;
}

/**
 * Serviço para operações CRUD de funcionários
 */
export class FuncionarioService {
  /**
   * Busca todos os funcionários com filtros opcionais
   * 
   * @param filters - Filtros de busca
   * @returns Promise com lista de funcionários
   * 
   * @example
   * ```typescript
   * const funcionarios = await funcionarioService.findAll({
   *   empresa_id: 'uuid-da-empresa'
   * });
   * ```
   */
  async findAll(filters?: FuncionarioFilters): Promise<Funcionario[]> {
    // Implementação
  }
}
```

## Comunidade

### Canais de Comunicação

- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/sistema-asfalto)
- 📧 **Email**: dev@sistema-asfalto.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/sistema-asfalto/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/sistema-asfalto/discussions)

### Código de Conduta

Seguimos o [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Esperamos que todos os participantes:

- **Sejam respeitosos** com diferentes opiniões e experiências
- **Aceitem críticas construtivas** graciosamente
- **Foquem no que é melhor** para a comunidade
- **Demonstrem empatia** com outros membros da comunidade

### Reconhecimento

Contribuidores são reconhecidos através de:

- **Hall of Fame** no README
- **Badges especiais** no Discord
- **Menções** em releases
- **Convites** para eventos especiais

### Mentoria

Novos contribuidores podem solicitar mentoria:

- 👋 **Primeira contribuição**: Apoio para o primeiro PR
- 🎓 **Aprendizado**: Orientação sobre tecnologias
- 🚀 **Projeto**: Ajuda com projetos maiores

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma [Licença MIT](LICENSE) do projeto.

---

**Obrigado por contribuir! 🎉**

Sua participação torna este projeto melhor para todos. Se tiver dúvidas, não hesite em perguntar em nossos canais de comunicação.
