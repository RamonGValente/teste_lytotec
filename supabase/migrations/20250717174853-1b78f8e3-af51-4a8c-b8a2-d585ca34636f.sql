-- FASE 1: Habilitar RLS nas tabelas críticas que não possuem
ALTER TABLE bd_lista_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_apontamento_aplicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_cargas ENABLE ROW LEVEL SECURITY;

-- FASE 2: Remover políticas conflitantes existentes
DROP POLICY IF EXISTS "SuperAdmin can access all deliveries" ON bd_lista_programacao_entrega;
DROP POLICY IF EXISTS "RLS Aplicacao Dinamica" ON bd_registro_apontamento_aplicacao;
DROP POLICY IF EXISTS "SuperAdmin can access all cargo records" ON bd_registro_cargas;

-- FASE 3: Melhorar função de verificação de equipes do usuário
CREATE OR REPLACE FUNCTION public.get_user_teams(user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE 
    -- SuperAdmin tem acesso a todas as equipes
    WHEN check_is_super_admin_hybrid(user_id) THEN 
      ARRAY(SELECT id FROM bd_equipes)
    -- Admins têm acesso a todas as equipes
    WHEN EXISTS (
      SELECT 1 FROM profiles p
      JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
      WHERE p.id = user_id 
      AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
    ) THEN
      ARRAY(SELECT id FROM bd_equipes)
    -- Demais usuários: apenas equipes que gerenciam ou participam
    ELSE
      ARRAY(
        SELECT DISTINCT e.id 
        FROM bd_equipes e
        JOIN bd_funcionarios f ON (
          e.apontador_id = f.id OR 
          e.encarregado_id = f.id OR 
          f.equipe_id = e.id
        )
        JOIN profiles p ON f.email = p.email
        WHERE p.id = user_id
      )
  END;
$$;

-- FASE 4: Criar políticas RLS para bd_lista_programacao_entrega
CREATE POLICY "Acesso hierárquico entregas"
ON bd_lista_programacao_entrega
FOR ALL
TO authenticated
USING (
  -- SuperAdmin tem acesso total
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins têm acesso total
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Apontadores e operadores: apenas suas equipes
  equipe_id = ANY(get_user_teams(auth.uid()))
)
WITH CHECK (
  -- SuperAdmin pode inserir/atualizar tudo
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins podem inserir/atualizar tudo
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Apontadores podem inserir/atualizar apenas suas equipes
  equipe_id = ANY(get_user_teams(auth.uid()))
);

-- FASE 5: Criar políticas RLS para bd_registro_apontamento_aplicacao
CREATE POLICY "Acesso hierárquico aplicações"
ON bd_registro_apontamento_aplicacao
FOR ALL
TO authenticated
USING (
  -- SuperAdmin tem acesso total
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins têm acesso total
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Criador do registro pode acessar
  created_by = auth.uid() OR
  -- Apontadores podem acessar aplicações de suas equipes
  EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    WHERE lpe.id = lista_entrega_id
    AND lpe.equipe_id = ANY(get_user_teams(auth.uid()))
  )
)
WITH CHECK (
  -- SuperAdmin pode inserir/atualizar tudo
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins podem inserir/atualizar tudo
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Criador pode inserir/atualizar seus próprios registros
  created_by = auth.uid() OR
  -- Apontadores podem inserir/atualizar aplicações de suas equipes
  EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    WHERE lpe.id = lista_entrega_id
    AND lpe.equipe_id = ANY(get_user_teams(auth.uid()))
  )
);

-- FASE 6: Criar políticas RLS para bd_registro_cargas
CREATE POLICY "Acesso hierárquico cargas"
ON bd_registro_cargas
FOR ALL
TO authenticated
USING (
  -- SuperAdmin tem acesso total
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins têm acesso total
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Apontadores podem acessar cargas de suas equipes
  EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    WHERE lpe.id = lista_entrega_id
    AND lpe.equipe_id = ANY(get_user_teams(auth.uid()))
  )
)
WITH CHECK (
  -- SuperAdmin pode inserir/atualizar tudo
  check_is_super_admin_hybrid(auth.uid()) OR
  -- Admins podem inserir/atualizar tudo
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
  ) OR
  -- Apontadores podem inserir/atualizar cargas de suas equipes
  EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    WHERE lpe.id = lista_entrega_id
    AND lpe.equipe_id = ANY(get_user_teams(auth.uid()))
  )
);

-- FASE 7: Criar políticas RLS para bd_funcoes_permissao (apenas leitura para maioria)
CREATE POLICY "Acesso funcoes permissao"
ON bd_funcoes_permissao
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas SuperAdmin pode modificar funcoes permissao"
ON bd_funcoes_permissao
FOR ALL
TO authenticated
USING (check_is_super_admin_hybrid(auth.uid()))
WITH CHECK (check_is_super_admin_hybrid(auth.uid()));

-- FASE 8: Criar políticas RLS para bd_permissoes (apenas leitura para maioria)
CREATE POLICY "Acesso permissoes"
ON bd_permissoes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas SuperAdmin pode modificar permissoes"
ON bd_permissoes
FOR ALL
TO authenticated
USING (check_is_super_admin_hybrid(auth.uid()))
WITH CHECK (check_is_super_admin_hybrid(auth.uid()));

-- FASE 9: Função para debug - verificar acesso do usuário
CREATE OR REPLACE FUNCTION public.debug_user_access_detailed()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'user_id', auth.uid(),
    'email', (SELECT email FROM profiles WHERE id = auth.uid()),
    'user_role', get_current_user_role(),
    'is_super_admin', check_is_super_admin_hybrid(auth.uid()),
    'allowed_teams', get_user_teams(auth.uid()),
    'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()),
    'funcionario_exists', EXISTS(
      SELECT 1 FROM bd_funcionarios f 
      JOIN profiles p ON f.email = p.email 
      WHERE p.id = auth.uid()
    ),
    'user_functions', (SELECT funcoes FROM profiles WHERE id = auth.uid()),
    'funcao_permissao', (
      SELECT fp.nome_funcao 
      FROM profiles p 
      JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id 
      WHERE p.id = auth.uid()
    ),
    'timestamp', now()
  );
$$;

-- FASE 10: Comentários para documentação
COMMENT ON FUNCTION public.get_user_teams(uuid) IS 
'Retorna array de UUIDs das equipes que o usuário pode acessar baseado em sua função';

COMMENT ON FUNCTION public.debug_user_access_detailed() IS 
'Função para debug - mostra informações detalhadas sobre o acesso do usuário atual';

-- FASE 11: Inserir permissões padrão se não existirem
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES
('entregas_view', 'Visualizar entregas', '/entregas'),
('entregas_create', 'Criar entregas', '/entregas/criar'),
('entregas_edit', 'Editar entregas', '/entregas/editar'),
('entregas_delete', 'Excluir entregas', '/entregas/excluir'),
('aplicacoes_view', 'Visualizar aplicações', '/aplicacoes'),
('aplicacoes_create', 'Criar aplicações', '/aplicacoes/criar'),
('aplicacoes_edit', 'Editar aplicações', '/aplicacoes/editar'),
('aplicacoes_delete', 'Excluir aplicações', '/aplicacoes/excluir')
ON CONFLICT (nome_permissao) DO NOTHING;