# Problemas Críticos de Segurança RLS

## ⚠️ AVISO DE SEGURANÇA CRÍTICA

Este documento lista problemas críticos de segurança identificados na estrutura RLS atual que requerem ação imediata.

## 1. Tabelas Completamente Expostas (CRÍTICO)

### Problema
**17 tabelas não possuem RLS habilitado**, permitindo acesso irrestrito a dados sensíveis.

### Impacto
- Qualquer usuário autenticado pode acessar todos os dados
- Possível vazamento de informações confidenciais
- Violação de princípios de segurança e compliance

### Tabelas Afetadas
- `bd_funcoes_permissao` - **CRÍTICO** (estrutura de permissões)
- `bd_permissoes` - **CRÍTICO** (permissões do sistema)
- `bd_programacao_entrega` - **ALTO** (dados operacionais)
- `bd_registro_aplicacao_detalhes` - **ALTO** (dados operacionais)
- `bd_registro_os` - **ALTO** (ordens de serviço)
- `bd_centros_custo` - **MÉDIO** (dados financeiros)
- `bd_carga_status_historico` - **MÉDIO** (auditoria)
- `bd_os_mao_obra` - **MÉDIO** (custos)
- `bd_os_materiais_utilizados` - **MÉDIO** (custos)
- `bd_registro_apontamento_inspecao` - **MÉDIO** (inspeções)
- `bd_departamentos` - **BAIXO** (estrutura organizacional)
- `bd_os_movimentacoes` - **BAIXO** (movimentações)

### Ação Requerida
```sql
-- EXECUTAR IMEDIATAMENTE
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_aplicacao_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_carga_status_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_materiais_utilizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_apontamento_inspecao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_movimentacoes ENABLE ROW LEVEL SECURITY;
```

## 2. Vulnerabilidades em Funções SECURITY DEFINER (CRÍTICO)

### Problema
**Todas as funções `SECURITY DEFINER` não definem `search_path`**, permitindo ataques de escalação de privilégios.

### Impacto
- Atacantes podem criar funções maliciosas em schemas alternativos
- Possível escalação de privilégios para SuperAdmin
- Comprometimento completo do sistema

### Funções Afetadas
- `check_is_super_admin_new()`
- `check_is_super_admin_hybrid()`
- `usuario_acessa_equipe()`
- `usuario_gerencia_funcionario()`
- `get_current_user_role()`
- `user_has_permission()`
- `user_has_permission_hybrid()`
- `get_user_permissions_hybrid()`

### Exemplo de Correção
```sql
-- ANTES (VULNERÁVEL)
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
$function$;

-- DEPOIS (SEGURO)
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

## 3. Dependência de Campo Legacy (ALTO)

### Problema
Várias funções ainda dependem do campo `funcoes` que pode ser removido conforme a migração 20250716122425.

### Impacto
- Quebra de funcionalidades quando campo for removido
- Inconsistência na aplicação de políticas RLS
- Falhas de autenticação e autorização

### Funções Afetadas
- `usuario_acessa_equipe()` - Usa `'SuperAdm' = ANY(p.funcoes)`
- `usuario_gerencia_funcionario()` - Usa `'Apontador' = ANY(p.funcoes)`
- `check_is_super_admin_hybrid()` - Usa `'SuperAdm' = ANY(p.funcoes)`
- `user_has_permission_hybrid()` - Usa `fp.nome_funcao = ANY(p.funcoes)`
- `get_user_permissions_hybrid()` - Usa `fp.nome_funcao = ANY(p.funcoes)`

### Correção
Atualizar todas as funções para usar apenas `funcao_permissao`:
```sql
-- ANTES (LEGACY)
WHERE 'SuperAdm' = ANY(p.funcoes)

-- DEPOIS (NOVO SISTEMA)
JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
WHERE fp.nome_funcao = 'SuperAdm'
```

## 4. Ausência de Qualificação de Schema (MÉDIO)

### Problema
Tabelas não são qualificadas com schema `public.` em funções `SECURITY DEFINER`.

### Impacto
- Vulnerabilidade de search_path attack
- Possível redirecionamento para objetos maliciosos
- Comprometimento da integridade das consultas

### Correção
```sql
-- ANTES (VULNERÁVEL)
FROM profiles p
JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id

-- DEPOIS (SEGURO)
FROM public.profiles p
JOIN public.bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
```

## 5. Views com Acesso Irrestrito (MÉDIO)

### Problema
Views não herdam RLS das tabelas base quando criadas com `SECURITY DEFINER`.

### Views Afetadas
- `vw_entregas_com_massa_remanescente`
- `vw_registro_aplicacao_completo`
- `bd_usuarios`

### Impacto
- Contorno das políticas RLS
- Acesso a dados que deveriam estar protegidos
- Vazamento de informações através de views

### Correção
```sql
-- Verificar se views são SECURITY DEFINER
SELECT viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('vw_entregas_com_massa_remanescente', 'vw_registro_aplicacao_completo', 'bd_usuarios');

-- Se necessário, recriar views sem SECURITY DEFINER
-- ou implementar RLS nas tabelas base
```

## 6. Políticas RLS Potencialmente Recursivas (BAIXO)

### Problema
Algumas políticas podem causar recursão infinita se não forem bem estruturadas.

### Exemplo Problemático
```sql
-- PODE CAUSAR RECURSÃO
CREATE POLICY "example" ON table_a
FOR SELECT USING (
  (SELECT role FROM table_a WHERE id = auth.uid()) = 'admin'
);
```

### Correção
Usar funções `SECURITY DEFINER` para quebrar a recursão:
```sql
-- SEGURO
CREATE POLICY "example" ON table_a
FOR SELECT USING (
  get_current_user_role() = 'admin'
);
```

## 7. Ausência de Auditoria (BAIXO)

### Problema
Não há sistema de auditoria para monitorar acessos e modificações sensíveis.

### Impacto
- Impossibilidade de rastrear acessos não autorizados
- Dificuldade em investigar incidentes de segurança
- Não compliance com regulamentações

### Recomendação
Implementar triggers de auditoria em tabelas críticas:
```sql
-- Exemplo de trigger de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, user_id, timestamp, old_values, new_values)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), NOW(), 
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END);
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
```

## Plano de Ação Imediata

### Fase 1: Emergência (Executar Imediatamente)
1. **Habilitar RLS em tabelas críticas**:
   - `bd_funcoes_permissao`
   - `bd_permissoes`
   - `bd_programacao_entrega`
   - `bd_registro_aplicacao_detalhes`
   - `bd_registro_os`

2. **Corrigir funções SECURITY DEFINER**:
   - Adicionar `SET search_path = ''`
   - Qualificar tabelas com `public.`

### Fase 2: Consolidação (Próximas 48h)
1. **Habilitar RLS em tabelas restantes**
2. **Criar políticas adequadas para cada tabela**
3. **Remover dependências do campo `funcoes`**

### Fase 3: Validação (Próxima semana)
1. **Testar todas as funcionalidades**
2. **Implementar monitoramento**
3. **Criar testes automatizados**

### Fase 4: Melhoria (Próximo mês)
1. **Implementar auditoria**
2. **Otimizar performance**
3. **Criar documentação completa**

## Scripts de Emergência

### Script 1: Habilitar RLS em Tabelas Críticas
```sql
-- EXECUTAR IMEDIATAMENTE EM PRODUÇÃO
BEGIN;

ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias de emergência - APENAS SUPERADMIN
CREATE POLICY "Emergency SuperAdmin only" ON bd_funcoes_permissao
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

CREATE POLICY "Emergency SuperAdmin only" ON bd_permissoes
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

-- Verificar se funcionou
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('bd_funcoes_permissao', 'bd_permissoes');

COMMIT;
```

### Script 2: Correção de Funções Críticas
```sql
-- EXECUTAR APÓS SCRIPT 1
BEGIN;

-- Corrigir função principal
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

-- Testar função
SELECT check_is_super_admin_new(auth.uid());

COMMIT;
```

## Monitoramento Contínuo

### Queries de Monitoramento
```sql
-- 1. Verificar tabelas sem RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

-- 2. Verificar políticas ativas
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar funções SECURITY DEFINER
SELECT proname, prosecdef, proconfig
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND prosecdef = true;
```

## Conclusão

**A situação atual representa um risco crítico de segurança que requer ação imediata.** Os problemas identificados podem levar a:

- **Vazamento de dados confidenciais**
- **Escalação de privilégios**
- **Comprometimento completo do sistema**
- **Violação de compliance**

**É essencial executar os scripts de emergência imediatamente e implementar o plano de ação completo.**