
-- Corrigir erro de stack depth causado por recursão infinita
-- Refatorar get_user_allowed_teams para não depender de get_current_user_role

-- Dropar a função atual que causa recursão
DROP FUNCTION IF EXISTS get_user_allowed_teams();

-- Recriar a função sem dependência circular
CREATE OR REPLACE FUNCTION get_user_allowed_teams()
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    -- Verificar diretamente na tabela profiles se é SuperAdm
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND 'SuperAdm' = ANY(funcoes)
    ) THEN 
      ARRAY(SELECT id FROM bd_equipes)
    -- Verificar se é AdmRH ou Administrador
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND ('AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
    ) THEN
      ARRAY(SELECT id FROM bd_equipes)
    -- Para outras funções, buscar equipes específicas
    ELSE
      ARRAY(
        SELECT DISTINCT e.id 
        FROM bd_equipes e
        INNER JOIN bd_funcionarios f ON (
          e.apontador_id = f.id OR e.encarregado_id = f.id
        )
        INNER JOIN profiles p ON f.email = p.email
        WHERE p.id = auth.uid()
      )
  END;
$$;

-- Simplificar get_current_user_role para evitar conflitos
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT CASE 
      WHEN 'SuperAdm' = ANY(funcoes) THEN 'SuperAdm'
      WHEN 'AdmRH' = ANY(funcoes) THEN 'AdmRH'
      WHEN 'Administrador' = ANY(funcoes) THEN 'Administrador'
      WHEN 'Apontador' = ANY(funcoes) THEN 'Apontador'
      WHEN 'Encarregado' = ANY(funcoes) THEN 'Encarregado'
      WHEN 'Operador' = ANY(funcoes) THEN 'Operador'
      ELSE 'user'
    END
    FROM profiles 
    WHERE id = auth.uid()),
    'user'
  );
$$;

-- Recriar políticas RLS mais simples para evitar chamadas circulares
DROP POLICY IF EXISTS "SuperAdm can access all appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "AdmRH can access all appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Apontador can access team appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Encarregado can access team appointments" ON bd_apontamento_equipe;

-- Políticas mais diretas sem chamadas recursivas
CREATE POLICY "Admin roles can access all appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

CREATE POLICY "Team members can access their team appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (
  -- Verificar se o usuário tem acesso à equipe específica
  equipe_id IN (
    SELECT DISTINCT e.id 
    FROM bd_equipes e
    INNER JOIN bd_funcionarios f ON (
      e.apontador_id = f.id OR e.encarregado_id = f.id
    )
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
);

-- Recriar políticas similares para bd_avaliacao_equipe
DROP POLICY IF EXISTS "SuperAdm can access all evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "AdmRH can access all evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Apontador can access team evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Encarregado can access team evaluations" ON bd_avaliacao_equipe;

CREATE POLICY "Admin roles can access all evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

CREATE POLICY "Team members can access their team evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (
  equipe_id IN (
    SELECT DISTINCT e.id 
    FROM bd_equipes e
    INNER JOIN bd_funcionarios f ON (
      e.apontador_id = f.id OR e.encarregado_id = f.id
    )
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
);

-- Recriar políticas para bd_equipes
DROP POLICY IF EXISTS "SuperAdm can access all teams" ON bd_equipes;
DROP POLICY IF EXISTS "AdmRH can access all teams" ON bd_equipes;
DROP POLICY IF EXISTS "Users can access allowed teams" ON bd_equipes;

CREATE POLICY "Admin roles can access all teams"
ON bd_equipes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

CREATE POLICY "Team members can access their teams"
ON bd_equipes
FOR ALL
TO authenticated
USING (
  id IN (
    SELECT DISTINCT e.id 
    FROM bd_equipes e
    INNER JOIN bd_funcionarios f ON (
      e.apontador_id = f.id OR e.encarregado_id = f.id
    )
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
);

-- Adicionar função de debug para verificar se as funções estão funcionando
CREATE OR REPLACE FUNCTION debug_user_access()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'user_id', auth.uid(),
    'user_role', get_current_user_role(),
    'allowed_teams', get_user_allowed_teams(),
    'profile_exists', EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()),
    'user_functions', (SELECT funcoes FROM profiles WHERE id = auth.uid())
  );
$$;
