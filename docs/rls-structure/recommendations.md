# Recomendações para Melhoria da Estrutura RLS

## Visão Geral

Este documento apresenta recomendações detalhadas para corrigir os problemas identificados na estrutura RLS e implementar melhorias de segurança.

## Recomendações por Prioridade

### 🔴 CRÍTICO - Ação Imediata (0-24h)

#### 1. Habilitar RLS em Tabelas Críticas

**Problema**: Tabelas de permissões completamente expostas.

**Solução**:
```sql
-- Executar imediatamente
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;

-- Política restritiva temporária
CREATE POLICY "Emergency SuperAdmin only" ON bd_funcoes_permissao
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

CREATE POLICY "Emergency SuperAdmin only" ON bd_permissoes
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

**Benefícios**:
- Proteção imediata dos dados mais sensíveis
- Prevenção de escalação de privilégios
- Conformidade com princípios de segurança

#### 2. Corrigir Funções SECURITY DEFINER

**Problema**: Vulnerabilidade de search_path em funções críticas.

**Solução**:
```sql
-- Exemplo para função principal
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
```

**Benefícios**:
- Eliminação de vulnerabilidades de escalação
- Proteção contra search_path attacks
- Melhoria na integridade das consultas

### 🟠 ALTO - Próximas 48h

#### 3. Implementar RLS em Tabelas Operacionais

**Problema**: Dados operacionais expostos.

**Solução**:
```sql
-- Tabelas operacionais críticas
ALTER TABLE bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_aplicacao_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_os ENABLE ROW LEVEL SECURITY;

-- Políticas baseadas em função e equipe
CREATE POLICY "Team and admin access" ON bd_programacao_entrega
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica'])
  ))
);
```

#### 4. Remover Dependências Legacy

**Problema**: Funções dependem do campo `funcoes` que será removido.

**Solução**:
```sql
-- Atualizar usuario_acessa_equipe
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
    -- Usar nova função
    SELECT public.check_is_super_admin_new(_user_id) INTO is_super_admin;
    
    IF is_super_admin THEN 
        RETURN TRUE; 
    END IF;
    
    -- Verificar membros da equipe
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
```

### 🟡 MÉDIO - Próxima Semana

#### 5. Implementar RLS em Tabelas Restantes

**Problema**: Tabelas secundárias sem proteção.

**Solução**:
```sql
-- Tabelas de estrutura organizacional
ALTER TABLE bd_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo ENABLE ROW LEVEL SECURITY;

-- Políticas administrativas
CREATE POLICY "Admin access to departments" ON bd_departamentos
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  ))
);

-- Tabelas de auditoria
ALTER TABLE bd_carga_status_historico ENABLE ROW LEVEL SECURITY;

-- Política de auditoria - leitura para operadores, escrita para admins
CREATE POLICY "Audit read access" ON bd_carga_status_historico
FOR SELECT TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Apontador'])
  ))
);

CREATE POLICY "Audit write access" ON bd_carga_status_historico
FOR INSERT, UPDATE, DELETE TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  ))
);
```

#### 6. Otimizar Políticas Existentes

**Problema**: Algumas políticas podem ser otimizadas para performance.

**Solução**:
```sql
-- Exemplo: Otimizar política do bd_funcionarios
-- Criar índices para melhorar performance das políticas
CREATE INDEX IF NOT EXISTS idx_profiles_funcao_permissao ON profiles(funcao_permissao);
CREATE INDEX IF NOT EXISTS idx_bd_funcionarios_email ON bd_funcionarios(email);
CREATE INDEX IF NOT EXISTS idx_bd_equipes_membros ON bd_equipes(apontador_id, encarregado_id);

-- Otimizar política usando CTE para melhor performance
CREATE OR REPLACE FUNCTION public.get_user_accessible_funcionarios(user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  WITH user_context AS (
    SELECT 
      p.id,
      p.email,
      fp.nome_funcao,
      CASE WHEN fp.nome_funcao = 'SuperAdm' THEN true ELSE false END as is_super_admin
    FROM public.profiles p
    JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id
  )
  SELECT ARRAY(
    SELECT f.id
    FROM public.bd_funcionarios f
    CROSS JOIN user_context uc
    WHERE uc.is_super_admin = true
    OR uc.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra'])
    OR f.email = uc.email
    OR public.usuario_gerencia_funcionario(user_id, f.id)
  );
$function$;
```

### 🔵 BAIXO - Próximo Mês

#### 7. Implementar Sistema de Auditoria

**Problema**: Ausência de rastreamento de acessos e modificações.

**Solução**:
```sql
-- Criar tabela de auditoria
CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text NOT NULL,
    operation text NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    timestamp timestamp with time zone DEFAULT now(),
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Política para auditoria - apenas admins podem ver
CREATE POLICY "Audit log access" ON public.audit_log
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = 'AdmRH'
  ))
);

-- Função de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.audit_log (
        table_name, 
        operation, 
        user_id, 
        old_values, 
        new_values,
        ip_address
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        inet_client_addr()
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$function$;

-- Aplicar triggers em tabelas críticas
CREATE TRIGGER audit_bd_funcionarios
    AFTER INSERT OR UPDATE OR DELETE ON bd_funcionarios
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_bd_equipes
    AFTER INSERT OR UPDATE OR DELETE ON bd_equipes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

#### 8. Implementar Monitoramento Proativo

**Problema**: Ausência de monitoramento de segurança.

**Solução**:
```sql
-- Função para detectar tentativas de acesso negado
CREATE OR REPLACE FUNCTION public.monitor_access_violations()
RETURNS TABLE(
    user_id uuid,
    user_email text,
    attempted_table text,
    attempt_time timestamp,
    violation_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  -- Esta função seria integrada com logs do PostgreSQL
  -- Para detectar tentativas de acesso negado por RLS
  SELECT 
    auth.uid() as user_id,
    p.email as user_email,
    'monitoring' as attempted_table,
    now() as attempt_time,
    0 as violation_count
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 0; -- Placeholder - implementar com logs reais
$function$;

-- View para dashboard de segurança
CREATE VIEW public.security_dashboard AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    table_name,
    operation,
    COUNT(*) as operation_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.audit_log
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), table_name, operation
ORDER BY hour DESC;
```

#### 9. Implementar Testes Automatizados

**Problema**: Ausência de testes para validar políticas RLS.

**Solução**:
```sql
-- Função para testar políticas RLS
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE(
    test_name text,
    table_name text,
    policy_name text,
    test_result boolean,
    error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Teste 1: SuperAdmin deve ter acesso total
    RETURN QUERY
    SELECT 
        'SuperAdmin full access'::text,
        'bd_funcionarios'::text,
        'Acesso dinâmico por RH ou próprio'::text,
        (SELECT COUNT(*) > 0 FROM public.bd_funcionarios WHERE public.check_is_super_admin_new(auth.uid()))::boolean,
        CASE 
            WHEN (SELECT COUNT(*) > 0 FROM public.bd_funcionarios WHERE public.check_is_super_admin_new(auth.uid())) 
            THEN NULL 
            ELSE 'SuperAdmin não tem acesso aos funcionários'::text 
        END;
    
    -- Teste 2: Usuário comum não deve ver outros funcionários
    RETURN QUERY
    SELECT 
        'Regular user restricted access'::text,
        'bd_funcionarios'::text,
        'Acesso dinâmico por RH ou próprio'::text,
        true::boolean, -- Placeholder
        NULL::text;
        
    -- Adicionar mais testes conforme necessário
END;
$function$;
```

## Implementação Gradual

### Fase 1: Emergência (24h)
```sql
-- Script de emergência completo
BEGIN;

-- 1. Habilitar RLS em tabelas críticas
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;

-- 2. Políticas restritivas temporárias
CREATE POLICY "Emergency SuperAdmin only" ON bd_funcoes_permissao
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

CREATE POLICY "Emergency SuperAdmin only" ON bd_permissoes
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

-- 3. Corrigir função principal
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

-- 4. Testar se funcionou
SELECT 'RLS habilitado em bd_funcoes_permissao' as status 
WHERE EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'bd_funcoes_permissao' 
    AND rowsecurity = true
);

COMMIT;
```

### Fase 2: Consolidação (48h)
```sql
-- Habilitar RLS em todas as tabelas restantes
-- Implementar políticas adequadas
-- Corrigir todas as funções SECURITY DEFINER
```

### Fase 3: Otimização (1 semana)
```sql
-- Otimizar políticas existentes
-- Implementar índices para performance
-- Criar funções auxiliares otimizadas
```

### Fase 4: Monitoramento (1 mês)
```sql
-- Implementar auditoria completa
-- Criar dashboard de segurança
-- Implementar alertas automáticos
```

## Verificação e Validação

### Checklist de Segurança
- [ ] Todas as tabelas têm RLS habilitado
- [ ] Todas as funções SECURITY DEFINER têm search_path definido
- [ ] Todas as tabelas são qualificadas com schema
- [ ] Políticas testadas com diferentes tipos de usuários
- [ ] Sistema de auditoria implementado
- [ ] Monitoramento proativo em funcionamento
- [ ] Testes automatizados executando
- [ ] Documentação atualizada

### Queries de Verificação
```sql
-- 1. Verificar RLS em todas as tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ Protegido' 
        ELSE '❌ EXPOSTO' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- 2. Verificar funções SECURITY DEFINER
SELECT 
    proname,
    prosecdef,
    proconfig,
    CASE 
        WHEN prosecdef AND proconfig IS NOT NULL AND 'search_path=' = ANY(proconfig) THEN '✅ Seguro'
        WHEN prosecdef THEN '❌ VULNERÁVEL'
        ELSE '✅ Normal'
    END as security_status
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY prosecdef DESC, proname;

-- 3. Verificar políticas ativas
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    array_agg(policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
```

## Benefícios Esperados

### Segurança
- **Proteção completa de dados sensíveis**
- **Eliminação de vulnerabilidades críticas**
- **Controle granular de acesso**
- **Auditoria completa de ações**

### Compliance
- **Conformidade com LGPD/GDPR**
- **Rastreabilidade de acessos**
- **Princípio do menor privilégio**
- **Segregação de funções**

### Operacional
- **Redução de riscos de segurança**
- **Melhoria na confiabilidade**
- **Facilidade de manutenção**
- **Monitoramento proativo**

## Considerações Finais

A implementação dessas recomendações é **essencial** para garantir a segurança do sistema. O plano deve ser executado de forma gradual, com testes extensivos em cada fase.

**Prioridades**:
1. **Executar Fase 1 imediatamente** - Risco crítico
2. **Planejar Fase 2 para próximas 48h** - Risco alto
3. **Implementar Fases 3 e 4 gradualmente** - Melhorias contínuas

**Recursos necessários**:
- Acesso administrativo ao banco
- Ambiente de teste adequado
- Plano de rollback
- Janela de manutenção (para produção)

A **segurança não pode ser postergada** - cada dia de atraso aumenta o risco de incidentes graves.