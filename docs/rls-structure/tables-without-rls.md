# Tabelas sem RLS Habilitado ⚠️ CRÍTICO

## ⚠️ AVISO DE SEGURANÇA

**17 tabelas estão completamente expostas sem controle de acesso RLS. Isso representa um risco crítico de segurança, pois qualquer usuário autenticado pode acessar, modificar ou deletar dados de todas essas tabelas.**

## Tabelas Desprotegidas

### 1. bd_funcoes_permissao
- **Risco**: CRÍTICO
- **Dados expostos**: Todas as funções e permissões do sistema
- **Impacto**: Usuários podem ver/modificar estrutura de permissões

### 2. bd_permissoes
- **Risco**: CRÍTICO
- **Dados expostos**: Todas as permissões do sistema
- **Impacto**: Escalação de privilégios possível

### 3. bd_departamentos
- **Risco**: BAIXO
- **Dados expostos**: Estrutura departamental
- **Impacto**: Informações organizacionais expostas

### 4. bd_centros_custo
- **Risco**: MÉDIO
- **Dados expostos**: Centros de custo e informações financeiras
- **Impacto**: Dados financeiros expostos

### 5. bd_programacao_entrega
- **Risco**: ALTO
- **Dados expostos**: Programações de entrega
- **Impacto**: Informações operacionais críticas

### 6. bd_registro_aplicacao_detalhes
- **Risco**: ALTO
- **Dados expostos**: Detalhes de aplicações
- **Impacto**: Dados operacionais sensíveis

### 7. bd_registro_apontamento_inspecao
- **Risco**: MÉDIO
- **Dados expostos**: Inspeções de veículos
- **Impacto**: Dados de segurança e manutenção

### 8. bd_carga_status_historico
- **Risco**: MÉDIO
- **Dados expostos**: Histórico de status de cargas
- **Impacto**: Auditoria e rastreabilidade comprometidas

### 9. bd_os_mao_obra
- **Risco**: MÉDIO
- **Dados expostos**: Custos de mão de obra
- **Impacto**: Informações financeiras expostas

### 10. bd_os_materiais_utilizados
- **Risco**: MÉDIO
- **Dados expostos**: Materiais e custos
- **Impacto**: Informações de custos expostas

### 11. bd_os_movimentacoes
- **Risco**: BAIXO
- **Dados expostos**: Movimentações de OS
- **Impacto**: Histórico de movimentações

### 12. bd_registro_os
- **Risco**: ALTO
- **Dados expostos**: Registros de ordens de serviço
- **Impacto**: Informações operacionais críticas

### 13. bd_usuarios (VIEW)
- **Risco**: BAIXO
- **Dados expostos**: Informações básicas de usuários
- **Impacto**: Dados de usuários expostos

### 14. vw_entregas_com_massa_remanescente (VIEW)
- **Risco**: ALTO
- **Dados expostos**: Entregas com massa remanescente
- **Impacto**: Dados operacionais críticos

### 15. vw_registro_aplicacao_completo (VIEW)
- **Risco**: ALTO
- **Dados expostos**: Registros completos de aplicação
- **Impacto**: Dados operacionais sensíveis

## Políticas RLS Recomendadas

### Para Tabelas Críticas (bd_funcoes_permissao, bd_permissoes)

```sql
-- Habilitar RLS
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;

-- Apenas SuperAdmin pode acessar
CREATE POLICY "SuperAdmin only access" ON bd_funcoes_permissao
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

CREATE POLICY "SuperAdmin only access" ON bd_permissoes
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

### Para Tabelas Organizacionais (bd_departamentos, bd_centros_custo)

```sql
-- Habilitar RLS
ALTER TABLE bd_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo ENABLE ROW LEVEL SECURITY;

-- Acesso para roles administrativos
CREATE POLICY "Admin access to departments" ON bd_departamentos
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  ))
);

CREATE POLICY "Admin access to cost centers" ON bd_centros_custo
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  ))
);
```

### Para Tabelas Operacionais (bd_programacao_entrega, bd_registro_aplicacao_detalhes)

```sql
-- Habilitar RLS
ALTER TABLE bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_aplicacao_detalhes ENABLE ROW LEVEL SECURITY;

-- Acesso baseado em equipe e função
CREATE POLICY "Team and admin access to delivery schedule" ON bd_programacao_entrega
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra'])
  ))
);

CREATE POLICY "Team access to application details" ON bd_registro_aplicacao_detalhes
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  )) OR
  (created_by = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    JOIN bd_equipes e ON (lpe.equipe_id = e.id)
    WHERE lpe.id = bd_registro_aplicacao_detalhes.lista_entrega_id 
    AND usuario_acessa_equipe(auth.uid(), e.id)
  ))
);
```

### Para Tabelas de Auditoria (bd_carga_status_historico)

```sql
-- Habilitar RLS
ALTER TABLE bd_carga_status_historico ENABLE ROW LEVEL SECURITY;

-- Acesso apenas para leitura para operadores, full para admins
CREATE POLICY "Audit access to cargo status history" ON bd_carga_status_historico
FOR SELECT TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra', 'Apontador'])
  ))
);

CREATE POLICY "Admin full access to cargo status history" ON bd_carga_status_historico
FOR INSERT, UPDATE, DELETE TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  ))
);
```

### Para Tabelas de OS (bd_os_mao_obra, bd_os_materiais_utilizados, bd_os_movimentacoes)

```sql
-- Habilitar RLS
ALTER TABLE bd_os_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_materiais_utilizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_movimentacoes ENABLE ROW LEVEL SECURITY;

-- Acesso baseado na OS relacionada
CREATE POLICY "OS related access to labor" ON bd_os_mao_obra
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  )) OR
  (EXISTS (
    SELECT 1 FROM bd_ordens_servico os
    WHERE os.id = bd_os_mao_obra.os_id
    AND (os.solicitante_id = auth.uid() OR os.executado_por_id = auth.uid() OR os.encerrado_por_id = auth.uid())
  ))
);

-- Políticas similares para bd_os_materiais_utilizados e bd_os_movimentacoes
```

## Ações Imediatas Requeridas

1. **URGENTE**: Habilitar RLS em todas as tabelas listadas
2. **URGENTE**: Implementar políticas apropriadas para cada tabela
3. **ALTO**: Testar políticas com diferentes tipos de usuários
4. **ALTO**: Implementar monitoramento de acesso
5. **MÉDIO**: Criar documentação de políticas para desenvolvedores

## Script de Habilitação RLS

```sql
-- Script para habilitar RLS em todas as tabelas desprotegidas
-- EXECUTE COM CUIDADO E TESTE EM AMBIENTE DE DESENVOLVIMENTO PRIMEIRO

-- Tabelas críticas
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;

-- Tabelas organizacionais
ALTER TABLE bd_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo ENABLE ROW LEVEL SECURITY;

-- Tabelas operacionais
ALTER TABLE bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_aplicacao_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_apontamento_inspecao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_os ENABLE ROW LEVEL SECURITY;

-- Tabelas de auditoria
ALTER TABLE bd_carga_status_historico ENABLE ROW LEVEL SECURITY;

-- Tabelas de OS
ALTER TABLE bd_os_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_materiais_utilizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_os_movimentacoes ENABLE ROW LEVEL SECURITY;

-- Nota: Views não podem ter RLS habilitado, mas herdam das tabelas subjacentes
```

## Impacto da Implementação

### Positivo:
- Segurança drasticamente melhorada
- Controle granular de acesso
- Compliance com melhores práticas
- Auditoria adequada

### Possíveis Problemas:
- Queries existentes podem falhar
- Performance pode ser impactada
- Código da aplicação pode precisar de ajustes
- Testes extensivos necessários

## Recomendação

**Implementar RLS imediatamente em ambiente de desenvolvimento, testar extensivamente e depois aplicar em produção em janela de manutenção.**