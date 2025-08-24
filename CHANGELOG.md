
# Changelog 📝

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Em Desenvolvimento
- Sistema de notificações push
- Módulo financeiro avançado
- Mobile App React Native
- Integração com IoT e sensores
- Dashboard executivo com BI

## [2.1.0] - 2024-12-13 🎯

### ✨ **Módulo de Relatório de Medição** (NOVO)

#### Adicionado
- **📊 Sistema Completo de Relatório de Medição**
  - Suporte para Equipamentos e Caminhões
  - Cálculos automáticos baseados em contratos de locação
  - Filtros avançados por tipo, veículo e período
  - Checkbox de desmobilização para equipamentos e caminhões

- **🧮 Cálculos Automatizados para Equipamentos**
  - Base de 200 horas mensais conforme contrato
  - Valor unitário: `Aluguel Mensal ÷ 200h = R$/h`
  - Distribuição proporcional por centro de custo
  - Fórmula de 4 partes implementada:
    1. Valor unitário por hora
    2. Desconto de manutenção
    3. Desconto de desmobilização (opcional)
    4. Horas restantes para distribuição

- **🚛 Cálculos Automatizados para Caminhões**
  - Base diária: `Aluguel Mensal ÷ 30 dias = R$/dia`
  - Distribuição proporcional por centro de custo
  - Sistema de descontos por manutenção e desmobilização
  - Valor restante após descontos distribuído proporcionalmente

- **⚙️ Sistema de Descontos Inteligente**
  - **Desconto de Manutenção**: Automático baseado em apontamentos "Em Manutenção"
  - **Desconto de Desmobilização**: Opcional via checkbox
    - Equipamentos: `(200 ÷ 30) × dias parados × R$/h`
    - Caminhões: `(Aluguel ÷ 30) × dias parados`
  - Múltiplos tipos de desconto em uma única tabela
  - Cálculo automático de dias parados até final do período

- **📈 Nova Fórmula de Produtividade**
  - Equipamentos: `(Total Horímetros ÷ Horas Restantes) × Horas Disponíveis`
  - Caminhões: Quilometragem proporcional por centro de custo
  - Cálculo baseado em dados reais de apontamento

#### Funcionalidades Avançadas
- **🎯 Validações Robustas**
  - Verificação de apontamentos no período
  - Validação de centros de custo preenchidos
  - Controle de veículos com valor de aluguel
  - Mensagens de erro específicas e orientativas

- **📊 Interface Profissional**
  - Tabelas responsivas com totais automáticos
  - Campo rastreador editável por linha
  - Seção de observações personalizáveis
  - Área de assinaturas formatada

- **📁 Exportações Avançadas**
  - **Excel**: Múltiplas abas com formatação profissional
    - Aba 1: Relatório principal completo
    - Aba 2: Detalhamento de descontos
    - Aba 3: Resumo por centro de custo
  - **PDF**: Layout otimizado para impressão
  - Formatação monetária brasileira (R$)
  - Headers personalizados com logo da empresa

#### Correções e Melhorias
- **🔧 Correção de Filtros**
  - Checkbox de desmobilização visível para caminhões
  - Filtro de período com validação aprimorada
  - Lista de veículos dinâmica por tipo selecionado

- **⚡ Performance Otimizada**
  - Queries otimizadas para grandes volumes de apontamentos
  - Cálculos em memória para melhor responsividade
  - Cache inteligente para dados de veículos

### 🔐 Melhorias de Segurança

#### Adicionado
- **Row Level Security (RLS)** implementado
- Controle granular de permissões por módulo
- Validações server-side para relatórios de medição
- Auditoria completa de ações de usuário

#### Sistema de Roles Atualizado
- **SuperAdm**: Acesso completo incluindo relatórios de medição
- **AdmLogistica**: Gestão de logística e geração de relatórios
- **Encarregado**: Apontamentos e consulta de relatórios
- **Usuário**: Consultas básicas sem edição

### 📊 Dashboard e Interface

#### Melhorado
- **🎨 Interface Responsiva Aprimorada**
  - Melhor experiência mobile para relatórios
  - Tabelas com scroll horizontal em dispositivos pequenos
  - Formulários otimizados para touch

- **📱 Componentes Atualizados**
  - Estados de loading consistentes
  - Mensagens de erro mais descritivas
  - Feedback visual aprimorado

### 🗄️ Banco de Dados

#### Adicionado
- **Views Especializadas**
  - View para cálculos de relatório de medição
  - Agregação automática de apontamentos por centro de custo
  - Queries otimizadas para performance

- **Índices de Performance**
  - Índices específicos para consultas de relatório
  - Otimização de queries por data e situação
  - Melhoria na velocidade de geração de relatórios

### 📚 Documentação

#### Adicionado
- **📖 Guia Completo do Usuário Atualizado**
  - Seção dedicada ao Relatório de Medição
  - Exemplos práticos de uso
  - Troubleshooting específico

- **🛠️ Documentação Técnica Expandida**
  - Arquitetura do módulo de relatórios
  - Fórmulas matemáticas documentadas
  - Guia de desenvolvimento para extensões

- **🗄️ Documentação do Banco Atualizada**
  - Novas queries de exemplo
  - Estrutura de views e índices
  - Guia de otimização

### 🐛 Correções de Bugs

#### Corrigido
- **Timezone Brasileiro**: Formatação consistente de datas em todo o sistema
- **Cálculos de Espessura**: Validação aprimorada para aplicação de asfalto
- **Filtros de Relatório**: Filtros mais precisos e responsivos
- **Export Excel**: Formatação monetária corrigida
- **Mobile Layout**: Tabelas responsivas em dispositivos pequenos

### ⚡ Performance

#### Otimizado
- **Consultas de Banco**: Queries 40% mais rápidas para relatórios
- **Loading States**: Feedback visual mais rápido
- **Memory Usage**: Otimização de componentes React
- **Bundle Size**: Redução de 15% no tamanho final

---

## [1.0.0] - 2024-01-15

### ✨ Primeira Versão Estável

#### Adicionado
- **Sistema de Autenticação Completo**
  - Login com email e senha
  - Recuperação de senha
  - Perfis de usuário
  - Controle de permissões por função

- **Módulo de Gestão de RH**
  - Cadastro completo de funcionários
  - Gestão de equipes
  - Apontamento de presença
  - Avaliação de desempenho
  - Importação via Excel

- **Módulo de Gestão de Máquinas**
  - Cadastro de veículos e equipamentos
  - Apontamento de uso
  - Sistema de chamados técnicos
  - Ordens de serviço
  - Controle de manutenção

- **Módulo de Logística**
  - Criação de requisições
  - Programação de entregas
  - Registro de cargas da usina
  - Aplicação de asfalto com múltiplas aplicações
  - Cálculos automáticos de área e espessura

- **Sistema de Relatórios Básicos**
  - Relatórios de produtividade
  - Exportação para Excel e PDF
  - Consultas personalizadas

- **Dashboard Executivo**
  - KPIs em tempo real
  - Gráficos de performance
  - Alertas e notificações
  - Indicadores de produtividade

#### Recursos Técnicos
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI**: Tailwind CSS + Shadcn/UI
- **Formulários**: React Hook Form + Zod
- **Estado**: TanStack Query
- **Autenticação**: Supabase Auth
- **Banco**: PostgreSQL com RLS
- **Storage**: Supabase Storage para imagens

#### Segurança
- Row Level Security (RLS) implementado
- Políticas de acesso por empresa e função
- Validação de dados server-side
- Sanitização de inputs
- Controle de sessão automático

#### Performance
- Lazy loading de componentes
- Paginação em listas grandes
- Memoização de componentes pesados
- Otimização de queries SQL
- Code splitting por rotas

## [0.9.0] - 2024-01-08

### 🚀 Release Candidate

#### Adicionado
- **Múltiplas Aplicações por Carga**
  - Controle de massa remanescente
  - Sequenciamento automático
  - Finalização inteligente de cargas

- **Sistema de Validações Avançadas**
  - Validação de espessura (3-15cm)
  - Verificação de massa disponível
  - Controle de temperatura do asfalto

- **Melhorias na Interface**
  - Feedback visual aprimorado
  - Loading states consistentes
  - Mensagens de erro descritivas

#### Corrigido
- Cálculo de espessura incorreto
- Problemas de sincronização de dados
- Bugs no upload de imagens
- Vazamentos de memória em componentes

#### Modificado
- Otimização de consultas ao banco
- Melhor estruturação de componentes
- Padronização de formulários

## [0.8.0] - 2024-01-01

### 🎯 Beta Release

#### Adicionado
- **Apontamento de Equipes**
  - Controle de presença
  - Registro de horas trabalhadas
  - Avaliação de performance

- **Gestão de Chamados**
  - Sistema de tickets
  - Priorização automática
  - Workflow de aprovação

- **Relatórios Básicos**
  - Exportação para Excel
  - Filtros personalizados
  - Templates pré-definidos

#### Corrigido
- Problemas de autenticação
- Bugs em formulários complexos
- Inconsistências na navegação

## Tipos de Mudanças

- `✨ Adicionado` - para novas funcionalidades
- `🔧 Modificado` - para mudanças em funcionalidades existentes
- `🐛 Corrigido` - para correções de bugs
- `🗑️ Removido` - para funcionalidades removidas
- `🔒 Segurança` - para melhorias de segurança
- `⚡ Performance` - para melhorias de performance
- `📚 Documentação` - para mudanças na documentação
- `🧪 Testes` - para mudanças em testes
- `🚀 Deploy` - para mudanças relacionadas ao deploy

## Roadmap Futuro

### Versão 2.2.0 (Q1 2025)
- [ ] **Módulo Financeiro Avançado**
  - Controle de custos operacionais
  - Análise de rentabilidade por projeto
  - Integração bancária para conciliação
  - Relatórios financeiros completos

- [ ] **Mobile App Nativo**
  - App React Native
  - Funcionalidades offline para apontamentos
  - Sincronização automática
  - Push notifications

- [ ] **Melhorias no Relatório de Medição**
  - Templates personalizáveis por cliente
  - Assinatura digital integrada
  - Workflow de aprovação
  - Histórico de alterações

### Versão 2.3.0 (Q2 2025)
- [ ] **Inteligência Artificial**
  - Previsão de manutenções baseada em dados históricos
  - Otimização automática de rotas
  - Análise preditiva de custos
  - Detecção de anomalias em apontamentos

- [ ] **Integração IoT**
  - Conectores para sensores de equipamentos
  - Monitoramento em tempo real de horímetros
  - Alertas automáticos de manutenção
  - Dashboard de telemetria

- [ ] **Gestão de Contratos Digitais**
  - Contratos com fornecedores
  - SLAs e métricas automatizadas
  - Renovações com alertas
  - Integração com sistemas jurídicos

### Versão 3.0.0 (Q3 2025)
- [ ] **Business Intelligence Completo**
  - Data warehouse próprio
  - Dashboards executivos personalizáveis
  - Análise multidimensional
  - Relatórios gerenciais avançados

- [ ] **Módulo de Qualidade**
  - Controle de qualidade do asfalto
  - Integração com laboratórios
  - Testes automatizados
  - Conformidade com normas ABNT

- [ ] **Gestão Ambiental**
  - Controle de emissões de CO2
  - Relatórios de sustentabilidade
  - Certificações ambientais
  - Monitoramento de impacto

### Versão 3.1.0 (Q4 2025)
- [ ] **Plataforma de Integração**
  - APIs públicas documentadas
  - Webhooks para eventos
  - Conectores para ERPs
  - Marketplace de integrações

- [ ] **Módulo de Treinamento**
  - Cursos online integrados
  - Certificações digitais
  - Avaliações automáticas
  - Gamificação

## Contribuições

Este projeto aceita contribuições da comunidade. Para contribuir:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### Convenções de Commit

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

**Tipos:**
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: mudanças na documentação
- `style`: formatação, pontos e vírgulas, etc
- `refactor`: refatoração de código
- `test`: adição ou correção de testes
- `chore`: mudanças no build, ferramentas auxiliares

**Exemplos:**
```bash
feat(relatorio-medicao): adicionar cálculos para equipamentos
fix(dashboard): corrigir cálculo de estatísticas
docs(readme): atualizar instruções de instalação
style(components): ajustar indentação
refactor(services): simplificar lógica de autenticação
test(utils): adicionar testes para formatadores
chore(deps): atualizar dependências
```

### Guidelines de Desenvolvimento

#### Frontend
- **TypeScript**: Tipagem obrigatória para todas as props e funções
- **Componentes**: Máximo 100 linhas, refatorar se maior
- **Hooks**: Usar hooks customizados para lógica complexa
- **Performance**: Memoização para componentes pesados

#### Backend
- **Queries**: Sempre usar índices apropriados
- **Validação**: Server-side obrigatória para todos os endpoints
- **Error Handling**: Mensagens de erro padronizadas
- **Logging**: Log estruturado para debugging

#### Testes
- **Unitários**: Cobertura mínima de 80%
- **Integração**: Testes para fluxos críticos
- **E2E**: Cenários principais automatizados

## Suporte e Comunidade

Para suporte e dúvidas:

- 📧 **Email**: suporte@sistema-pavimentacao.com
- 💬 **Discord**: [Servidor da Comunidade](https://discord.gg/sistema-pavimentacao)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sistema-pavimentacao/issues)
- 📖 **Docs**: [Documentação Completa](https://docs.sistema-pavimentacao.com)

### Níveis de Suporte

#### 🟢 Comunidade (Gratuito)
- Suporte via Discord e GitHub Issues
- Documentação completa
- Tutoriais em vídeo
- FAQ atualizada

#### 🟡 Profissional (Pago)
- Suporte por email com SLA de 24h
- Consultoria para implementação
- Treinamento para equipes
- Customizações básicas

#### 🔴 Enterprise (Sob Consulta)
- Suporte dedicado 24/7
- Implementação assistida
- Customizações avançadas
- Integração com sistemas legados

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

### Termos de Uso

- ✅ Uso comercial permitido
- ✅ Modificação permitida
- ✅ Distribuição permitida
- ✅ Uso privado permitido
- ❌ Responsabilidade não incluída
- ❌ Garantia não incluída

---

**Para ver todas as mudanças e releases, acesse:** [Releases no GitHub](https://github.com/sistema-pavimentacao/releases)

**Desenvolvido com ❤️ pela equipe de desenvolvimento**

---

*Última atualização do changelog: 13 de dezembro de 2024*
