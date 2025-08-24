# Visão Geral da Estrutura RLS

## Estatísticas Gerais

- **Total de Tabelas**: 34
- **Tabelas com RLS Habilitado**: 17 (50%)
- **Tabelas sem RLS**: 17 (50%)
- **Funções de Segurança**: 8
- **Políticas RLS Ativas**: 27

## Distribuição por Módulo

### Módulo de Usuários e Permissões
- `profiles` ✅ (4 políticas)
- `bd_funcoes` ✅ (1 política)
- `bd_funcoes_permissao` ❌ (SEM RLS)
- `bd_permissoes` ❌ (SEM RLS)

### Módulo de Funcionários e Equipes
- `bd_funcionarios` ✅ (1 política)
- `bd_equipes` ✅ (1 política)
- `bd_apontamento_equipe` ✅ (1 política)
- `bd_avaliacao_equipe` ✅ (1 política)

### Módulo de Entregas e Cargas
- `bd_lista_programacao_entrega` ✅ (1 política)
- `bd_registro_cargas` ✅ (1 política)
- `bd_registro_apontamento_aplicacao` ✅ (1 política)
- `bd_programacao_entrega` ❌ (SEM RLS)

### Módulo de Veículos e Equipamentos
- `bd_caminhoes_equipamentos` ✅ (1 política)
- `bd_registro_apontamento_cam_equipa` ✅ (1 política)
- `bd_registro_apontamento_inspecao` ❌ (SEM RLS)

### Módulo de Ordens de Serviço
- `bd_chamados_os` ✅ (1 política)
- `bd_ordens_servico` ✅ (1 política)
- `bd_os_mao_obra` ❌ (SEM RLS)
- `bd_os_materiais_utilizados` ❌ (SEM RLS)
- `bd_os_movimentacoes` ❌ (SEM RLS)

### Módulo de Estrutura Organizacional
- `bd_empresas` ✅ (4 políticas)
- `bd_departamentos` ❌ (SEM RLS)
- `bd_centros_custo` ❌ (SEM RLS)
- `bd_usinas` ✅ (1 política)
- `bd_requisicoes` ✅ (2 políticas)
- `bd_ruas_requisicao` ✅ (1 política)

### Módulo de Histórico e Auditoria
- `bd_carga_status_historico` ❌ (SEM RLS)
- `bd_registro_os` ❌ (SEM RLS)
- `bd_registro_aplicacao_detalhes` ❌ (SEM RLS)

## Padrões de Segurança Identificados

### 1. Hierarquia de Acesso
```
SuperAdmin (SuperAdm)
├── Administrador
├── AdmRH
├── AdmLogistica
├── AdmEquipamentos
├── Mestre de Obra
├── Encarregado
├── Apontador
└── Operador
```

### 2. Tipos de Políticas Comuns
- **SuperAdmin Full Access**: Acesso total para SuperAdmin
- **Role-Based Access**: Acesso baseado em funções específicas
- **Team-Based Access**: Acesso baseado em equipes
- **Owner Access**: Acesso apenas aos próprios dados

### 3. Funções de Segurança Utilizadas
- `check_is_super_admin_new()` - Verifica se é SuperAdmin
- `check_is_super_admin_hybrid()` - Verifica SuperAdmin (compatibilidade)
- `usuario_acessa_equipe()` - Verifica acesso à equipe
- `usuario_gerencia_funcionario()` - Verifica gestão de funcionário
- `user_has_permission()` - Verifica permissão específica
- `get_current_user_role()` - Obtém função do usuário atual

## Problemas Críticos Identificados

### 1. Tabelas Sem RLS (CRÍTICO)
17 tabelas estão completamente expostas sem controle de acesso.

### 2. Funções sem search_path (ALTO)
Várias funções não definem `search_path`, causando vulnerabilidades.

### 3. Views com SECURITY DEFINER (MÉDIO)
Views podem estar contornando RLS inadvertidamente.

### 4. Ausência de Auditoria (BAIXO)
Não há sistema de auditoria para monitorar acessos.

## Recomendações Imediatas

1. **Habilitar RLS em todas as tabelas desprotegidas**
2. **Criar políticas adequadas para cada contexto**
3. **Revisar e corrigir funções de segurança**
4. **Implementar testes de segurança automatizados**