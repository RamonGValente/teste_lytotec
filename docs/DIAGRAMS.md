
# Diagramas e Fluxogramas 📊

## Visão Geral da Arquitetura

```mermaid
graph TB
    %% Frontend Layer
    subgraph "Frontend (React + TypeScript)"
        UI[Interface do Usuário]
        RQ[React Query]
        RHF[React Hook Form]
        ZOD[Zod Validation]
    end
    
    %% Backend Layer
    subgraph "Backend (Supabase)"
        AUTH[Supabase Auth]
        DB[(PostgreSQL)]
        STORAGE[Supabase Storage]
        RT[Realtime]
        EDGE[Edge Functions]
    end
    
    %% External Services
    subgraph "Serviços Externos"
        EMAIL[Email Service]
        MAPS[Google Maps]
    end
    
    %% Connections
    UI --> RQ
    RQ --> AUTH
    RQ --> DB
    RHF --> ZOD
    UI --> STORAGE
    UI --> RT
    
    AUTH --> EMAIL
    DB --> RT
    EDGE --> EMAIL
    UI --> MAPS
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef external fill:#fff3e0
    
    class UI,RQ,RHF,ZOD frontend
    class AUTH,DB,STORAGE,RT,EDGE backend
    class EMAIL,MAPS external
```

## Fluxo de Dados Principal

```mermaid
flowchart TD
    START([Usuário Acessa Sistema]) --> LOGIN{Usuário Logado?}
    
    LOGIN -->|Não| AUTH_PAGE[Página de Login]
    AUTH_PAGE --> AUTH_PROCESS[Processo de Autenticação]
    AUTH_PROCESS --> DASHBOARD
    
    LOGIN -->|Sim| DASHBOARD[Dashboard Principal]
    
    DASHBOARD --> MODULES{Selecionar Módulo}
    
    %% Módulos principais
    MODULES --> RH[Gestão de RH]
    MODULES --> MACHINES[Gestão de Máquinas]
    MODULES --> LOGISTICS[Logística]
    MODULES --> REPORTS[Relatórios]
    
    %% RH Flow
    RH --> RH_CRUD[CRUD Funcionários]
    RH --> TEAMS[Gestão de Equipes]
    RH --> ATTENDANCE[Apontamentos]
    
    %% Machines Flow
    MACHINES --> VEHICLES[CRUD Veículos]
    MACHINES --> MAINTENANCE[Manutenção]
    MACHINES --> USAGE[Apontamento de Uso]
    
    %% Logistics Flow
    LOGISTICS --> REQUISITIONS[Requisições]
    LOGISTICS --> PROGRAMMING[Programação]
    LOGISTICS --> LOADS[Registro de Cargas]
    LOGISTICS --> APPLICATION[Aplicação de Asfalto]
    
    %% Data Flow
    RH_CRUD --> DATABASE[(Banco de Dados)]
    TEAMS --> DATABASE
    VEHICLES --> DATABASE
    REQUISITIONS --> DATABASE
    APPLICATION --> DATABASE
    
    DATABASE --> REALTIME[Supabase Realtime]
    REALTIME --> UI_UPDATE[Atualização da Interface]
    
    %% Reports
    REPORTS --> QUERY[Consultas Personalizadas]
    QUERY --> EXPORT[Exportação Excel/PDF]
    
    %% Styling
    classDef startEnd fill:#4caf50,color:#fff
    classDef process fill:#2196f3,color:#fff
    classDef decision fill:#ff9800,color:#fff
    classDef data fill:#9c27b0,color:#fff
    
    class START,DASHBOARD startEnd
    class AUTH_PROCESS,RH_CRUD,VEHICLES,APPLICATION process
    class LOGIN,MODULES decision
    class DATABASE,REALTIME data
```

## Fluxo de Aplicação de Asfalto

```mermaid
sequenceDiagram
    participant E as Engenheiro
    participant S as Sistema
    participant A as Apontador
    participant O as Operador
    participant DB as Banco de Dados
    
    %% Criação de Requisição
    E->>S: Criar Requisição
    S->>DB: Salvar Requisição
    Note over S: Status: Pendente
    
    %% Aprovação
    E->>S: Aprovar Requisição
    S->>DB: Atualizar Status
    Note over S: Status: Aprovada
    
    %% Programação
    E->>S: Criar Programação
    S->>S: Validar Recursos
    S->>DB: Salvar Programação
    Note over S: Alocar: Equipe, Caminhão, Usina
    
    %% Registro de Carga
    O->>S: Registrar Saída da Usina
    S->>S: Validar Temperatura
    S->>DB: Salvar Registro de Carga
    Note over S: Peso, Temperatura, Foto
    
    %% Aplicação
    A->>S: Iniciar Aplicação
    S->>S: Validar Massa Remanescente
    A->>S: Informar Medições
    S->>S: Calcular Área e Espessura
    
    alt Massa Suficiente
        S->>DB: Salvar Aplicação
        Note over S: Status: Em Andamento
    else Massa Insuficiente
        S-->>A: Erro: Massa Excedida
    end
    
    %% Finalização
    A->>S: Finalizar Aplicação
    S->>S: Calcular Massa Remanescente
    
    alt Massa Remanescente = 0
        S->>DB: Finalizar Carga
        Note over S: Status: Entregue
    else Massa Remanescente > 0
        S->>DB: Permitir Nova Aplicação
        Note over S: Status: Parcialmente Aplicada
    end
    
    %% Relatórios
    E->>S: Gerar Relatório
    S->>DB: Consultar Dados
    DB-->>S: Dados de Aplicação
    S-->>E: Relatório PDF/Excel
```

## Arquitetura de Componentes React

```mermaid
graph TD
    %% Layout Components
    APP[App.tsx] --> LAYOUT[MainLayout]
    LAYOUT --> SIDEBAR[AppSidebar]
    LAYOUT --> HEADER[AppHeader]
    LAYOUT --> CONTENT[Content Area]
    
    %% Page Components
    CONTENT --> DASHBOARD_PAGE[DashboardPage]
    CONTENT --> FUNCIONARIOS_PAGE[FuncionariosPage]
    CONTENT --> VEICULOS_PAGE[VeiculosPage]
    CONTENT --> APLICACAO_PAGE[AplicacaoPage]
    
    %% Feature Components
    FUNCIONARIOS_PAGE --> FUNC_TABLE[FuncionarioTable]
    FUNCIONARIOS_PAGE --> FUNC_MODAL[FuncionarioModal]
    FUNC_MODAL --> FUNC_FORM[FuncionarioForm]
    
    APLICACAO_PAGE --> APLICACAO_MODAL[AplicacaoModal]
    APLICACAO_MODAL --> DADOS_INICIAIS[DadosIniciaisTab]
    APLICACAO_MODAL --> DADOS_TECNICOS[DadosTecnicosTab]
    APLICACAO_MODAL --> FINALIZACAO[FinalizacaoTab]
    
    %% Shared Components
    subgraph "Shared UI Components"
        BUTTON[Button]
        INPUT[Input]
        DIALOG[Dialog]
        TABLE[Table]
        FORM[Form]
    end
    
    %% Hooks
    subgraph "Custom Hooks"
        USE_AUTH[useAuth]
        USE_FORM[useForm]
        USE_QUERY[useQuery]
        USE_MUTATION[useMutation]
    end
    
    %% Services
    subgraph "Services"
        API[API Services]
        SUPABASE[Supabase Client]
        STORAGE[Storage Service]
    end
    
    %% Connections
    FUNC_FORM --> BUTTON
    FUNC_FORM --> INPUT
    FUNC_MODAL --> DIALOG
    FUNC_TABLE --> TABLE
    
    FUNC_FORM --> USE_FORM
    FUNC_TABLE --> USE_QUERY
    APLICACAO_MODAL --> USE_MUTATION
    
    USE_QUERY --> API
    USE_MUTATION --> API
    API --> SUPABASE
    
    %% Styling
    classDef page fill:#e3f2fd
    classDef component fill:#f3e5f5
    classDef shared fill:#e8f5e8
    classDef hook fill:#fff3e0
    classDef service fill:#fce4ec
    
    class DASHBOARD_PAGE,FUNCIONARIOS_PAGE,VEICULOS_PAGE,APLICACAO_PAGE page
    class FUNC_TABLE,FUNC_MODAL,APLICACAO_MODAL component
    class BUTTON,INPUT,DIALOG,TABLE,FORM shared
    class USE_AUTH,USE_FORM,USE_QUERY,USE_MUTATION hook
    class API,SUPABASE,STORAGE service
```

## Modelo de Dados Simplificado

```mermaid
erDiagram
    %% Organização
    EMPRESA ||--o{ DEPARTAMENTO : possui
    EMPRESA ||--o{ FUNCIONARIO : emprega
    DEPARTAMENTO ||--o{ FUNCIONARIO : aloca
    
    %% RH
    FUNCAO ||--o{ FUNCIONARIO : exerce
    CENTRO_CUSTO ||--o{ FUNCIONARIO : pertence
    EQUIPE ||--o{ FUNCIONARIO : compoe
    
    %% Requisições
    CENTRO_CUSTO ||--o{ REQUISICAO : solicita
    FUNCIONARIO ||--o{ REQUISICAO : engenheiro
    REQUISICAO ||--o{ RUA_REQUISICAO : contem
    
    %% Programação
    REQUISICAO ||--o{ PROGRAMACAO : programa
    PROGRAMACAO ||--o{ LISTA_ENTREGA : detalha
    
    %% Recursos
    USINA ||--o{ LISTA_ENTREGA : fornece
    VEICULO ||--o{ LISTA_ENTREGA : transporta
    EQUIPE ||--o{ LISTA_ENTREGA : executa
    
    %% Execução
    LISTA_ENTREGA ||--|| REGISTRO_CARGA : registra
    REGISTRO_CARGA ||--o{ APLICACAO : aplicacao
    
    %% Apontamentos
    EQUIPE ||--o{ APONTAMENTO_EQUIPE : presenca
    VEICULO ||--o{ APONTAMENTO_VEICULO : uso
    
    %% Manutenção
    VEICULO ||--o{ CHAMADO : manutencao
    CHAMADO ||--o{ ORDEM_SERVICO : converte
    
    %% Atributos principais
    EMPRESA {
        string nome_empresa
        string cnpj
        string situacao
    }
    
    FUNCIONARIO {
        string nome_completo
        string cpf
        string email
        date data_admissao
    }
    
    REQUISICAO {
        string numero
        date data_requisicao
        string status
    }
    
    APLICACAO {
        date data_aplicacao
        time hora_chegada
        decimal area_aplicada
        decimal tonelada_aplicada
        decimal espessura
    }
```

## Fluxo de Estados de Entrega

```mermaid
stateDiagram-v2
    [*] --> Ativa : Programação Criada
    
    Ativa --> Enviada : Enviar para Execução
    Enviada --> ComCarga : Registrar Carga
    
    ComCarga --> EmAndamento : Iniciar Aplicação
    EmAndamento --> EmAndamento : Aplicações Parciais
    EmAndamento --> Entregue : Finalizar (Massa = 0)
    
    Ativa --> Cancelada : Cancelar Programação
    Enviada --> Cancelada : Cancelar Entrega
    
    Entregue --> [*] : Processo Concluído
    Cancelada --> [*] : Processo Cancelado
    
    note right of EmAndamento
        Múltiplas aplicações podem
        ser feitas até esgotar a massa
    end note
    
    note right of Entregue
        Status final quando toda
        a massa foi aplicada
    end note
```

## Hierarquia de Permissões

```mermaid
graph TD
    %% Roles
    ADMIN[Administrador] --> GESTOR[Gestor]
    GESTOR --> SUPERVISOR[Supervisor]
    SUPERVISOR --> OPERADOR[Operador]
    OPERADOR --> VISUALIZADOR[Visualizador]
    
    %% Permissions
    subgraph "Permissões por Módulo"
        RH_PERMS[RH]
        MACHINE_PERMS[Máquinas]
        LOGISTICS_PERMS[Logística]
        REPORTS_PERMS[Relatórios]
    end
    
    %% Admin permissions
    ADMIN --> RH_PERMS
    ADMIN --> MACHINE_PERMS
    ADMIN --> LOGISTICS_PERMS
    ADMIN --> REPORTS_PERMS
    
    %% Gestor permissions
    GESTOR --> RH_READ[RH: Visualizar]
    GESTOR --> MACHINE_READ[Máquinas: Visualizar]
    GESTOR --> LOGISTICS_FULL[Logística: Completo]
    GESTOR --> REPORTS_FULL[Relatórios: Completo]
    
    %% Supervisor permissions
    SUPERVISOR --> TEAM_MANAGE[Gerenciar Equipe]
    SUPERVISOR --> LOGISTICS_PARTIAL[Logística: Parcial]
    
    %% Operador permissions
    OPERADOR --> OWN_DATA[Próprios Dados]
    OPERADOR --> BASIC_REPORTS[Relatórios Básicos]
    
    %% Specific actions
    subgraph "Ações Específicas"
        CREATE[Criar]
        READ[Visualizar]
        UPDATE[Editar]
        DELETE[Excluir]
        APPROVE[Aprovar]
    end
    
    ADMIN --> CREATE
    ADMIN --> UPDATE
    ADMIN --> DELETE
    ADMIN --> APPROVE
    
    GESTOR --> CREATE
    GESTOR --> UPDATE
    GESTOR --> APPROVE
    
    SUPERVISOR --> UPDATE
    OPERADOR --> READ
    
    %% Styling
    classDef admin fill:#f44336,color:#fff
    classDef gestor fill:#ff9800,color:#fff
    classDef supervisor fill:#2196f3,color:#fff
    classDef operador fill:#4caf50,color:#fff
    classDef visualizador fill:#9e9e9e,color:#fff
    
    class ADMIN admin
    class GESTOR gestor
    class SUPERVISOR supervisor
    class OPERADOR operador
    class VISUALIZADOR visualizador
```

## Fluxo de Cálculos de Aplicação

```mermaid
flowchart TD
    START([Início da Aplicação]) --> INPUT_MEDIDAS[Inserir Medidas]
    
    INPUT_MEDIDAS --> COMPRIMENTO{Comprimento > 0?}
    COMPRIMENTO -->|Não| ERROR_COMP[Erro: Comprimento Inválido]
    COMPRIMENTO -->|Sim| LARGURA{Largura > 0?}
    
    LARGURA -->|Não| ERROR_LARG[Erro: Largura Inválida]
    LARGURA -->|Sim| CALC_AREA[Calcular Área]
    
    CALC_AREA --> AREA_CALC[Área = Comprimento × Largura]
    AREA_CALC --> INPUT_MASSA[Inserir Massa Aplicada]
    
    INPUT_MASSA --> VALIDATE_MASSA{Massa ≤ Massa Remanescente?}
    VALIDATE_MASSA -->|Não| ERROR_MASSA[Erro: Massa Excede Disponível]
    VALIDATE_MASSA -->|Sim| CALC_ESPESSURA[Calcular Espessura]
    
    CALC_ESPESSURA --> ESPESSURA_CALC[Espessura = (Massa ÷ Área) ÷ 2.4 × 100]
    ESPESSURA_CALC --> VALIDATE_ESPESSURA{3cm ≤ Espessura ≤ 15cm?}
    
    VALIDATE_ESPESSURA -->|Não| WARNING_ESP[Aviso: Espessura Fora do Padrão]
    VALIDATE_ESPESSURA -->|Sim| CALC_REMANESCENTE[Calcular Massa Remanescente]
    WARNING_ESP --> CONFIRM{Confirmar Mesmo Assim?}
    CONFIRM -->|Não| INPUT_MEDIDAS
    CONFIRM -->|Sim| CALC_REMANESCENTE
    
    CALC_REMANESCENTE --> REMANESCENTE_CALC[Remanescente = Massa Total - Σ Aplicações]
    REMANESCENTE_CALC --> CHECK_FINAL{Remanescente ≤ 0.001t?}
    
    CHECK_FINAL -->|Sim| FINALIZAR_CARGA[Finalizar Carga]
    CHECK_FINAL -->|Não| PERMITIR_NOVA[Permitir Nova Aplicação]
    
    FINALIZAR_CARGA --> CALC_MEDIA[Calcular Espessura Média]
    CALC_MEDIA --> UPDATE_STATUS[Status = Entregue]
    UPDATE_STATUS --> END([Fim])
    
    PERMITIR_NOVA --> SAVE_PARTIAL[Salvar Aplicação Parcial]
    SAVE_PARTIAL --> END
    
    %% Error flows
    ERROR_COMP --> INPUT_MEDIDAS
    ERROR_LARG --> INPUT_MEDIDAS
    ERROR_MASSA --> INPUT_MEDIDAS
    
    %% Styling
    classDef input fill:#e3f2fd
    classDef calc fill:#e8f5e8
    classDef decision fill:#fff3e0
    classDef error fill:#ffebee
    classDef success fill:#e8f5e8
    
    class INPUT_MEDIDAS,INPUT_MASSA input
    class AREA_CALC,ESPESSURA_CALC,REMANESCENTE_CALC,CALC_MEDIA calc
    class COMPRIMENTO,LARGURA,VALIDATE_MASSA,VALIDATE_ESPESSURA,CHECK_FINAL,CONFIRM decision
    class ERROR_COMP,ERROR_LARG,ERROR_MASSA,WARNING_ESP error
    class FINALIZAR_CARGA,UPDATE_STATUS,SAVE_PARTIAL success
```

## Arquitetura de Segurança (RLS)

```mermaid
graph TD
    %% Authentication Layer
    USER[Usuário] --> AUTH[Supabase Auth]
    AUTH --> JWT[JWT Token]
    
    %% RLS Policies
    JWT --> RLS{Row Level Security}
    
    %% Policy Types
    RLS --> COMPANY_POLICY[Política de Empresa]
    RLS --> ROLE_POLICY[Política de Função]
    RLS --> USER_POLICY[Política de Usuário]
    
    %% Table Access
    COMPANY_POLICY --> COMPANY_TABLES[Tabelas de Empresa]
    ROLE_POLICY --> ROLE_TABLES[Tabelas por Função]
    USER_POLICY --> USER_TABLES[Tabelas de Usuário]
    
    %% Specific Tables
    COMPANY_TABLES --> FUNCIONARIOS[bd_funcionarios]
    COMPANY_TABLES --> VEICULOS[bd_caminhoes_equipamentos]
    
    ROLE_TABLES --> REQUISICOES[bd_requisicoes]
    ROLE_TABLES --> APLICACOES[bd_registro_aplicacao]
    
    USER_TABLES --> PROFILES[profiles]
    USER_TABLES --> APONTAMENTOS[bd_apontamento_equipe]
    
    %% Policy Examples
    FUNCIONARIOS --> FUNC_POLICY["empresa_id = user_empresa_id"]
    VEICULOS --> VEI_POLICY["empresa_id IN (SELECT empresa_id FROM user_companies)"]
    REQUISICOES --> REQ_POLICY["user_role IN ('admin', 'gestor')"]
    APLICACOES --> APL_POLICY["apontador_id = auth.uid() OR user_role = 'admin'"]
    
    %% Styling
    classDef auth fill:#f44336,color:#fff
    classDef policy fill:#ff9800,color:#fff
    classDef table fill:#2196f3,color:#fff
    classDef rule fill:#4caf50,color:#fff
    
    class USER,AUTH,JWT auth
    class RLS,COMPANY_POLICY,ROLE_POLICY,USER_POLICY policy
    class FUNCIONARIOS,VEICULOS,REQUISICOES,APLICACOES table
    class FUNC_POLICY,VEI_POLICY,REQ_POLICY,APL_POLICY rule
```

## Performance e Otimização

```mermaid
graph TD
    %% Performance Challenges
    PERF_ISSUES[Problemas de Performance] --> LARGE_TABLES[Tabelas Grandes]
    PERF_ISSUES --> COMPLEX_QUERIES[Consultas Complexas]
    PERF_ISSUES --> HEAVY_UI[Interface Pesada]
    
    %% Database Optimizations
    LARGE_TABLES --> INDEXES[Índices Estratégicos]
    LARGE_TABLES --> PAGINATION[Paginação]
    LARGE_TABLES --> ARCHIVING[Arquivamento de Dados]
    
    COMPLEX_QUERIES --> VIEWS[Views Materializadas]
    COMPLEX_QUERIES --> FUNCTIONS[Funções do Banco]
    COMPLEX_QUERIES --> QUERY_OPT[Otimização de Queries]
    
    %% Frontend Optimizations
    HEAVY_UI --> LAZY_LOADING[Lazy Loading]
    HEAVY_UI --> MEMOIZATION[Memoização]
    HEAVY_UI --> VIRTUALIZATION[Virtualização]
    HEAVY_UI --> CODE_SPLITTING[Code Splitting]
    
    %% Specific Solutions
    INDEXES --> COMP_INDEXES[Índices Compostos]
    INDEXES --> PARTIAL_INDEXES[Índices Parciais]
    
    PAGINATION --> CURSOR_PAGING[Cursor Pagination]
    PAGINATION --> OFFSET_PAGING[Offset Pagination]
    
    LAZY_LOADING --> ROUTE_LAZY[Route-based Lazy]
    LAZY_LOADING --> COMPONENT_LAZY[Component Lazy]
    
    MEMOIZATION --> REACT_MEMO[React.memo]
    MEMOIZATION --> USE_MEMO[useMemo]
    MEMOIZATION --> USE_CALLBACK[useCallback]
    
    %% Monitoring
    subgraph "Monitoramento"
        METRICS[Métricas de Performance]
        ALERTS[Alertas Automáticos]
        PROFILING[Profiling Contínuo]
    end
    
    INDEXES --> METRICS
    LAZY_LOADING --> METRICS
    METRICS --> ALERTS
    ALERTS --> PROFILING
    
    %% Styling
    classDef problem fill:#f44336,color:#fff
    classDef solution fill:#4caf50,color:#fff
    classDef optimization fill:#2196f3,color:#fff
    classDef monitoring fill:#ff9800,color:#fff
    
    class PERF_ISSUES,LARGE_TABLES,COMPLEX_QUERIES,HEAVY_UI problem
    class INDEXES,PAGINATION,VIEWS,LAZY_LOADING solution
    class COMP_INDEXES,CURSOR_PAGING,REACT_MEMO optimization
    class METRICS,ALERTS,PROFILING monitoring
```

## Deployment e CI/CD

```mermaid
flowchart TD
    %% Development
    DEV[Desenvolvimento Local] --> COMMIT[Commit & Push]
    COMMIT --> PR[Pull Request]
    
    %% CI Pipeline
    PR --> CI_START[CI Pipeline]
    CI_START --> LINT[ESLint Check]
    CI_START --> TYPE_CHECK[TypeScript Check]
    CI_START --> TESTS[Unit Tests]
    
    LINT --> CI_RESULT{CI Passou?}
    TYPE_CHECK --> CI_RESULT
    TESTS --> CI_RESULT
    
    CI_RESULT -->|Não| FIX_ISSUES[Corrigir Problemas]
    FIX_ISSUES --> DEV
    
    CI_RESULT -->|Sim| CODE_REVIEW[Code Review]
    CODE_REVIEW --> APPROVE{Aprovado?}
    
    APPROVE -->|Não| CHANGES[Solicitar Mudanças]
    CHANGES --> DEV
    
    %% CD Pipeline
    APPROVE -->|Sim| MERGE[Merge to Main]
    MERGE --> CD_START[CD Pipeline]
    
    CD_START --> BUILD[Build Production]
    BUILD --> ENV_CONFIG[Configure Environment]
    ENV_CONFIG --> DEPLOY[Deploy to Production]
    
    %% Post-deployment
    DEPLOY --> HEALTH_CHECK[Health Check]
    HEALTH_CHECK --> MONITOR[Monitoring]
    
    %% Rollback
    HEALTH_CHECK --> ROLLBACK{Health OK?}
    ROLLBACK -->|Não| PREVIOUS_VERSION[Rollback to Previous]
    ROLLBACK -->|Sim| SUCCESS[Deployment Success]
    
    %% Environments
    subgraph "Environments"
        DEV_ENV[Development]
        STAGING_ENV[Staging]
        PROD_ENV[Production]
    end
    
    DEV --> DEV_ENV
    CODE_REVIEW --> STAGING_ENV
    DEPLOY --> PROD_ENV
    
    %% Styling
    classDef dev fill:#4caf50,color:#fff
    classDef ci fill:#2196f3,color:#fff
    classDef cd fill:#ff9800,color:#fff
    classDef env fill:#9c27b0,color:#fff
    
    class DEV,COMMIT,FIX_ISSUES dev
    class CI_START,LINT,TYPE_CHECK,TESTS,CODE_REVIEW ci
    class CD_START,BUILD,DEPLOY,HEALTH_CHECK cd
    class DEV_ENV,STAGING_ENV,PROD_ENV env
```

---

**Estes diagramas fornecem uma visão visual completa da arquitetura, fluxos de dados e processos do sistema. São úteis para entender rapidamente como os componentes interagem e como os dados fluem pela aplicação.**
