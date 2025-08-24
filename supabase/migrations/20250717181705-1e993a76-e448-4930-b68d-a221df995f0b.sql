-- Função para verificar se o usuário é SuperAdmin e permitir bypass em exclusões
CREATE OR REPLACE FUNCTION public.delete_funcionario_with_admin_bypass(funcionario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super_admin BOOLEAN := FALSE;
  reference_count INTEGER := 0;
BEGIN
  -- Verificar se o usuário é SuperAdmin
  SELECT check_is_super_admin_hybrid(auth.uid()) INTO is_super_admin;
  
  -- Log da operação
  RAISE NOTICE 'Tentativa de exclusão de funcionário % por usuário %', funcionario_id, auth.uid();
  RAISE NOTICE 'Usuário é SuperAdmin: %', is_super_admin;
  
  -- Se for SuperAdmin, permitir exclusão mesmo com referências
  IF is_super_admin THEN
    -- Verificar se há referências (apenas para log)
    SELECT COUNT(*) INTO reference_count FROM (
      SELECT 1 FROM bd_registro_apontamento_cam_equipa WHERE operador_id = funcionario_id
      UNION ALL
      SELECT 1 FROM bd_equipes WHERE encarregado_id = funcionario_id OR apontador_id = funcionario_id
      UNION ALL
      SELECT 1 FROM bd_avaliacao_equipe WHERE colaborador_id = funcionario_id
    ) refs;
    
    IF reference_count > 0 THEN
      RAISE NOTICE 'SuperAdmin forçando exclusão do funcionário % com % referências', funcionario_id, reference_count;
    END IF;
    
    -- Proceder com a exclusão
    DELETE FROM bd_funcionarios WHERE id = funcionario_id;
    
    RAISE NOTICE 'Funcionário % excluído com sucesso pelo SuperAdmin', funcionario_id;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Usuário não é SuperAdmin, aplicando regras normais de exclusão';
    RETURN FALSE;
  END IF;
END;
$$;

-- Função para verificar se o usuário atual tem permissão para excluir funcionários
CREATE OR REPLACE FUNCTION public.can_delete_funcionario()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  can_delete BOOLEAN := FALSE;
BEGIN
  -- Verificar se é SuperAdmin
  SELECT check_is_super_admin_hybrid(auth.uid()) INTO can_delete;
  
  -- Se não for SuperAdmin, verificar se tem permissão AdmRH
  IF NOT can_delete THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles p
      JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
      WHERE p.id = auth.uid() 
      AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador'])
    ) INTO can_delete;
  END IF;
  
  RETURN can_delete;
END;
$$;

-- Função para debug de autenticação e permissões
CREATE OR REPLACE FUNCTION public.debug_user_authentication()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', auth.uid(),
    'session_exists', auth.uid() IS NOT NULL,
    'email', (SELECT email FROM profiles WHERE id = auth.uid()),
    'is_super_admin', check_is_super_admin_hybrid(auth.uid()),
    'user_role', get_current_user_role(),
    'can_delete_funcionarios', can_delete_funcionario(),
    'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()),
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$;