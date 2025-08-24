# Funções de Segurança RLS

## Visão Geral

O sistema utiliza 8 funções de segurança principais para controlar o acesso aos dados através das políticas RLS. Estas funções implementam diferentes níveis de verificação de permissões e acesso.

## Funções Ativas

### 1. check_is_super_admin_new(user_id uuid)

**Propósito**: Verificar se um usuário é SuperAdmin através do novo sistema de permissões.

**Uso**: Função principal para verificação de SuperAdmin.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.check_is_super_admin_new(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  );
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''` (vulnerabilidade de segurança)

**Correção Recomendada**:
```sql
CREATE OR REPLACE FUNCTION public.check_is_super_admin_new(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  );
$function$
```

### 2. check_is_super_admin_hybrid(user_id uuid)

**Propósito**: Verificar SuperAdmin com compatibilidade para sistemas antigo e novo.

**Uso**: Para transição entre sistemas de permissões.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.check_is_super_admin_hybrid(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND 'SuperAdm' = ANY(p.funcoes)
  );
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`
- ⚠️ Depende de campo `funcoes` que pode ser removido

### 3. usuario_acessa_equipe(_user_id uuid, _equipe_id uuid)

**Propósito**: Verificar se um usuário tem acesso a uma equipe específica.

**Uso**: Controle de acesso baseado em equipes.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.usuario_acessa_equipe(_user_id uuid, _equipe_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    is_super_admin BOOLEAN := FALSE;
    is_team_member BOOLEAN := FALSE;
BEGIN
    -- Verificar se é SuperAdmin
    SELECT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = _user_id AND 'SuperAdm' = ANY(p.funcoes)
    ) INTO is_super_admin;

    -- SuperAdm tem acesso total
    IF is_super_admin THEN 
        RETURN TRUE; 
    END IF;

    -- Verificar se é membro da equipe
    SELECT EXISTS (
        SELECT 1 FROM bd_equipes eq
        JOIN bd_funcionarios func ON (
            eq.apontador_id = func.id OR 
            eq.encarregado_id = func.id OR 
            func.equipe_id = eq.id
        )
        JOIN profiles prof ON func.email = prof.email
        WHERE prof.id = _user_id AND eq.id = _equipe_id
    ) INTO is_team_member;

    RETURN is_team_member;
END;
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`
- ⚠️ Usa campo `funcoes` em vez de `funcao_permissao`

### 4. usuario_gerencia_funcionario(user_id uuid, funcionario_id uuid)

**Propósito**: Verificar se um usuário pode gerenciar um funcionário específico.

**Uso**: Controle hierárquico de acesso.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.usuario_gerencia_funcionario(user_id uuid, funcionario_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
    -- Verificar se o usuário é apontador ou encarregado da equipe do funcionário
    RETURN EXISTS (
        SELECT 1 FROM bd_equipes e
        JOIN bd_funcionarios f_gestor ON (e.apontador_id = f_gestor.id OR e.encarregado_id = f_gestor.id)
        JOIN bd_funcionarios f_membro ON f_membro.equipe_id = e.id
        JOIN profiles p ON p.email = f_gestor.email
        WHERE p.id = user_id
        AND f_membro.id = funcionario_id
        AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
    );
END;
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`
- ⚠️ Usa campo `funcoes` em vez de `funcao_permissao`

### 5. get_current_user_role()

**Propósito**: Obter a função atual do usuário logado.

**Uso**: Para verificações de role em políticas.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    user_role text;
BEGIN
    -- Buscar a função do usuário através da tabela bd_funcoes_permissao
    SELECT fp.nome_funcao INTO user_role
    FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid();
    
    -- Se não encontrou o perfil, retornar 'user'
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`

### 6. user_has_permission(user_id uuid, permission_name text)

**Propósito**: Verificar se um usuário tem uma permissão específica.

**Uso**: Controle granular de permissões.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`

### 7. user_has_permission_hybrid(user_id uuid, permission_name text)

**Propósito**: Verificar permissões com compatibilidade para sistemas antigo e novo.

**Uso**: Para transição entre sistemas.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.user_has_permission_hybrid(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  -- Verificar via funcao_permissao (sistema hierárquico)
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  )
  OR
  -- Verificar via funcoes (array legacy)
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON fp.nome_funcao = ANY(p.funcoes)
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`
- ⚠️ Depende de campo `funcoes` que pode ser removido

### 8. get_user_permissions_hybrid(user_id uuid)

**Propósito**: Obter todas as permissões de um usuário (sistemas antigo e novo).

**Uso**: Para verificação de múltiplas permissões.

**Código**:
```sql
CREATE OR REPLACE FUNCTION public.get_user_permissions_hybrid(user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  -- Combinar permissões do sistema hierárquico e legacy
  SELECT ARRAY(
    SELECT DISTINCT perm.nome_permissao
    FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id OR fp.nome_funcao = ANY(p.funcoes))
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id
  );
$function$
```

**Problemas Identificados**:
- ❌ Falta `SET search_path = ''`
- ⚠️ Depende de campo `funcoes` que pode ser removido

## Funções Secundárias

### debug_user_access()

**Propósito**: Debugging de acesso de usuário.

**Uso**: Para depuração de problemas de acesso.

### get_user_allowed_teams()

**Propósito**: Obter equipes que o usuário pode acessar.

**Uso**: Para filtragem de equipes.

## Problemas Críticos Identificados

### 1. Falta de search_path (CRÍTICO)

**Problema**: Todas as funções `SECURITY DEFINER` não definem `search_path`, permitindo ataques de escalação de privilégios.

**Solução**: Adicionar `SET search_path = ''` em todas as funções.

### 2. Dependência de Campo Legacy (ALTO)

**Problema**: Várias funções ainda dependem do campo `funcoes` que pode ser removido.

**Solução**: Atualizar todas as funções para usar apenas `funcao_permissao`.

### 3. Ausência de Qualificação de Schema (MÉDIO)

**Problema**: Tabelas não são qualificadas com schema `public.`.

**Solução**: Usar `public.table_name` em todas as referências.

## Script de Correção

```sql
-- 1. Corrigir check_is_super_admin_new
CREATE OR REPLACE FUNCTION public.check_is_super_admin_new(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  );
$function$;

-- 2. Corrigir usuario_acessa_equipe
CREATE OR REPLACE FUNCTION public.usuario_acessa_equipe(_user_id uuid, _equipe_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    is_super_admin BOOLEAN := FALSE;
    is_team_member BOOLEAN := FALSE;
BEGIN
    -- Verificar se é SuperAdmin usando novo sistema
    SELECT public.check_is_super_admin_new(_user_id) INTO is_super_admin;

    -- SuperAdm tem acesso total
    IF is_super_admin THEN 
        RETURN TRUE; 
    END IF;

    -- Verificar se é membro da equipe
    SELECT EXISTS (
        SELECT 1 FROM public.bd_equipes eq
        JOIN public.bd_funcionarios func ON (
            eq.apontador_id = func.id OR 
            eq.encarregado_id = func.id OR 
            func.equipe_id = eq.id
        )
        JOIN public.profiles prof ON func.email = prof.email
        WHERE prof.id = _user_id AND eq.id = _equipe_id
    ) INTO is_team_member;

    RETURN is_team_member;
END;
$function$;

-- 3. Corrigir usuario_gerencia_funcionario
CREATE OR REPLACE FUNCTION public.usuario_gerencia_funcionario(user_id uuid, funcionario_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Verificar se o usuário é apontador ou encarregado da equipe do funcionário
    RETURN EXISTS (
        SELECT 1 FROM public.bd_equipes e
        JOIN public.bd_funcionarios f_gestor ON (e.apontador_id = f_gestor.id OR e.encarregado_id = f_gestor.id)
        JOIN public.bd_funcionarios f_membro ON f_membro.equipe_id = e.id
        JOIN public.profiles p ON p.email = f_gestor.email
        JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
        WHERE p.id = user_id
        AND f_membro.id = funcionario_id
        AND fp.nome_funcao = ANY(ARRAY['Apontador', 'Encarregado'])
    );
END;
$function$;

-- 4. Corrigir get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    user_role text;
BEGIN
    -- Buscar a função do usuário através da tabela bd_funcoes_permissao
    SELECT fp.nome_funcao INTO user_role
    FROM public.profiles p
    JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid();
    
    -- Se não encontrou o perfil, retornar 'user'
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$function$;

-- 5. Corrigir user_has_permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN public.bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$function$;
```

## Recomendações

1. **URGENTE**: Implementar correções de `search_path` em todas as funções
2. **ALTO**: Remover dependências do campo `funcoes` legacy
3. **ALTO**: Qualificar todas as tabelas com schema `public.`
4. **MÉDIO**: Implementar testes automatizados para funções de segurança
5. **MÉDIO**: Adicionar logs de auditoria nas funções críticas
6. **BAIXO**: Criar documentação detalhada para desenvolvedores

## Testes Recomendados

```sql
-- Teste 1: Verificar se SuperAdmin tem acesso
SELECT check_is_super_admin_new('uuid-do-superadmin');

-- Teste 2: Verificar acesso a equipe
SELECT usuario_acessa_equipe('uuid-do-usuario', 'uuid-da-equipe');

-- Teste 3: Verificar gerenciamento de funcionário
SELECT usuario_gerencia_funcionario('uuid-do-gestor', 'uuid-do-funcionario');

-- Teste 4: Verificar permissão específica
SELECT user_has_permission('uuid-do-usuario', 'nome-da-permissao');

-- Teste 5: Obter role atual
SELECT get_current_user_role();
```