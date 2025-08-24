# Tabelas com RLS Habilitado

## 1. profiles (4 políticas)

### Políticas Ativas:
- **Allow profile creation** (INSERT)
- **SuperAdmin can access all profiles** (ALL)
- **Users can update own profile** (UPDATE)
- **Users can view own profile** (SELECT)

### Código RLS:
```sql
-- Política para inserção de perfis
CREATE POLICY "Allow profile creation" ON profiles
FOR INSERT TO authenticated
WITH CHECK (true);

-- Política para SuperAdmin
CREATE POLICY "SuperAdmin can access all profiles" ON profiles
FOR ALL TO authenticated
USING ((id = auth.uid()) OR check_is_super_admin_hybrid(auth.uid()))
WITH CHECK ((id = auth.uid()) OR check_is_super_admin_hybrid(auth.uid()));

-- Política para usuários atualizarem próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Política para usuários verem próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (id = auth.uid());
```

## 2. bd_apontamento_equipe (1 política)

### Políticas Ativas:
- **Acesso RLS por equipe** (ALL)

### Código RLS:
```sql
CREATE POLICY "Acesso RLS por equipe" ON bd_apontamento_equipe
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  )) OR
  usuario_acessa_equipe(auth.uid(), equipe_id) OR
  (registrado_por = auth.uid())
);
```

## 3. bd_avaliacao_equipe (1 política)

### Políticas Ativas:
- **Acesso RLS avaliações** (ALL)

### Código RLS:
```sql
CREATE POLICY "Acesso RLS avaliações" ON bd_avaliacao_equipe
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra'])
  )) OR
  usuario_acessa_equipe(auth.uid(), equipe_id) OR
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f
    JOIN profiles p ON (f.email = p.email)
    WHERE p.id = auth.uid() AND f.id = bd_avaliacao_equipe.colaborador_id
  )) OR
  (criado_por = auth.uid())
);
```

## 4. bd_caminhoes_equipamentos (1 política)

### Políticas Ativas:
- **Allow SuperAdmin access to caminhoes** (ALL)

### Código RLS:
```sql
CREATE POLICY "Allow SuperAdmin access to caminhoes" ON bd_caminhoes_equipamentos
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

## 5. bd_chamados_os (1 política)

### Políticas Ativas:
- **RLS Chamados OS Dinamica** (ALL)

### Código RLS:
```sql
CREATE POLICY "RLS Chamados OS Dinamica" ON bd_chamados_os
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  )) OR
  (solicitante_id = auth.uid())
);
```

## 6. bd_empresas (4 políticas)

### Políticas Ativas:
- **Authenticated users can insert companies** (INSERT)
- **Authenticated users can update companies** (UPDATE)
- **Authenticated users can view all companies** (SELECT)
- **Only admins can delete companies** (DELETE)

### Código RLS:
```sql
CREATE POLICY "Authenticated users can view all companies" ON bd_empresas
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert companies" ON bd_empresas
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies" ON bd_empresas
FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Only admins can delete companies" ON bd_empresas
FOR DELETE TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

## 7. bd_equipes (1 política)

### Políticas Ativas:
- **Acesso RLS equipes** (ALL)

### Código RLS:
```sql
CREATE POLICY "Acesso RLS equipes" ON bd_equipes
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra'])
  )) OR
  usuario_acessa_equipe(auth.uid(), id)
);
```

## 8. bd_funcionarios (1 política)

### Políticas Ativas:
- **Acesso dinâmico por RH ou próprio** (ALL)

### Código RLS:
```sql
CREATE POLICY "Acesso dinâmico por RH ou próprio" ON bd_funcionarios
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra'])
  )) OR
  (email = (SELECT email FROM profiles WHERE id = auth.uid())) OR
  usuario_gerencia_funcionario(auth.uid(), id)
);
```

## 9. bd_funcoes (1 política)

### Políticas Ativas:
- **Allow all operations for authenticated users** (ALL)

### Código RLS:
```sql
CREATE POLICY "Allow all operations for authenticated users" ON bd_funcoes
FOR ALL TO authenticated
USING (true);
```

## 10. bd_lista_programacao_entrega (1 política)

### Políticas Ativas:
- **SuperAdmin can access all deliveries** (ALL)

### Código RLS:
```sql
CREATE POLICY "SuperAdmin can access all deliveries" ON bd_lista_programacao_entrega
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

## 11. bd_ordens_servico (1 política)

### Políticas Ativas:
- **RLS Ordens Servico Dinamica** (ALL)

### Código RLS:
```sql
CREATE POLICY "RLS Ordens Servico Dinamica" ON bd_ordens_servico
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
  )) OR
  ((solicitante_id = auth.uid()) OR (executado_por_id = auth.uid()) OR (encerrado_por_id = auth.uid()))
);
```

## 12. bd_registro_apontamento_aplicacao (1 política)

### Políticas Ativas:
- **RLS Aplicacao Dinamica** (ALL)

### Código RLS:
```sql
CREATE POLICY "RLS Aplicacao Dinamica" ON bd_registro_apontamento_aplicacao
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
    WHERE lpe.id = bd_registro_apontamento_aplicacao.lista_entrega_id 
    AND usuario_acessa_equipe(auth.uid(), e.id)
  ))
);
```

## 13. bd_registro_apontamento_cam_equipa (1 política)

### Políticas Ativas:
- **Acesso RLS veículo com horímetro** (ALL)

### Código RLS:
```sql
CREATE POLICY "Acesso RLS veículo com horímetro" ON bd_registro_apontamento_cam_equipa
FOR ALL TO authenticated
USING (
  check_is_super_admin_new(auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id)
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  )) OR
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f
    JOIN profiles p ON (f.email = p.email)
    WHERE p.id = auth.uid() AND f.id = bd_registro_apontamento_cam_equipa.operador_id
  )) OR
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f_operador
    JOIN profiles p ON (p.id = auth.uid())
    WHERE f_operador.id = bd_registro_apontamento_cam_equipa.operador_id 
    AND (usuario_gerencia_funcionario(auth.uid(), f_operador.id) OR 'Apontador' = ANY(p.funcoes))
  ))
);
```

## 14. bd_registro_cargas (1 política)

### Políticas Ativas:
- **SuperAdmin can access all cargo records** (ALL)

### Código RLS:
```sql
CREATE POLICY "SuperAdmin can access all cargo records" ON bd_registro_cargas
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

## 15. bd_requisicoes (2 políticas)

### Políticas Ativas:
- **Allow SuperAdmin access to requisicoes** (ALL)
- **Allow all access to requisitions** (ALL)

### Código RLS:
```sql
CREATE POLICY "Allow SuperAdmin access to requisicoes" ON bd_requisicoes
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));

CREATE POLICY "Allow all access to requisitions" ON bd_requisicoes
FOR ALL TO authenticated
USING (true);
```

## 16. bd_ruas_requisicao (1 política)

### Políticas Ativas:
- **Allow all access to requisition streets** (ALL)

### Código RLS:
```sql
CREATE POLICY "Allow all access to requisition streets" ON bd_ruas_requisicao
FOR ALL TO authenticated
USING (true);
```

## 17. bd_usinas (1 política)

### Políticas Ativas:
- **Allow SuperAdmin access to usinas** (ALL)

### Código RLS:
```sql
CREATE POLICY "Allow SuperAdmin access to usinas" ON bd_usinas
FOR ALL TO authenticated
USING (check_is_super_admin_new(auth.uid()));
```

## Observações Importantes

1. **Padrão SuperAdmin**: Maioria das políticas permite acesso total para SuperAdmin
2. **Hierarquia de Funções**: Diferentes níveis de acesso baseados em funções
3. **Acesso por Equipe**: Políticas específicas para controle de acesso por equipes
4. **Acesso Próprio**: Usuários podem acessar apenas seus próprios dados
5. **Funções Híbridas**: Algumas políticas usam funções híbridas para compatibilidade