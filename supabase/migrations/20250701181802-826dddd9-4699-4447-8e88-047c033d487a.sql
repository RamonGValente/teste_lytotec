
-- Corrigir erro de stack depth - Remover TODAS as dependências das funções
-- Incluindo dependências em bd_funcionarios e profiles

-- Fase 1: Remover políticas de bd_funcionarios que dependem de get_current_user_role
DROP POLICY IF EXISTS "SuperAdm and AdmRH can view all employees" ON bd_funcionarios;
DROP POLICY IF EXISTS "SuperAdm and AdmRH can modify employees" ON bd_funcionarios;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON bd_funcionarios;
DROP POLICY IF EXISTS "Allow email verification for registration" ON bd_funcionarios;
DROP POLICY IF EXISTS "Users can view own employee record" ON bd_funcionarios;

-- Fase 2: Remover políticas de profiles que dependem de get_current_user_role
DROP POLICY IF EXISTS "SuperAdm can view all profiles" ON profiles;
DROP POLICY IF EXISTS "SuperAdm can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Fase 3: Remover todas as políticas de apontamento e avaliação (já feito mas garantindo)
DROP POLICY IF EXISTS "SuperAdm can access all appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "AdmRH can access all appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Apontador can access team appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Encarregado can access team appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Operador can only see own appointments" ON bd_apontamento_equipe;
DROP POLICY IF EXISTS "Allow authenticated access to apontamento_equipe" ON bd_apontamento_equipe;

DROP POLICY IF EXISTS "SuperAdm can access all evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "AdmRH can access all evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Apontador can access team evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Encarregado can access team evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Operador can only see own evaluations" ON bd_avaliacao_equipe;
DROP POLICY IF EXISTS "Allow authenticated access to avaliacao_equipe" ON bd_avaliacao_equipe;

-- Fase 4: Remover políticas de bd_equipes
DROP POLICY IF EXISTS "SuperAdm can access all teams" ON bd_equipes;
DROP POLICY IF EXISTS "AdmRH can access all teams" ON bd_equipes;
DROP POLICY IF EXISTS "Users can access allowed teams" ON bd_equipes;
DROP POLICY IF EXISTS "Everyone can delete teams" ON bd_equipes;
DROP POLICY IF EXISTS "Everyone can insert teams" ON bd_equipes;
DROP POLICY IF EXISTS "Everyone can update teams" ON bd_equipes;
DROP POLICY IF EXISTS "Everyone can view teams" ON bd_equipes;

-- Fase 5: Agora podemos remover as funções sem dependências
DROP FUNCTION IF EXISTS get_user_allowed_teams();
DROP FUNCTION IF EXISTS get_current_user_role();

-- Fase 6: Recriar as funções sem dependências circulares
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

CREATE OR REPLACE FUNCTION get_user_allowed_teams()
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND 'SuperAdm' = ANY(funcoes)
    ) THEN 
      ARRAY(SELECT id FROM bd_equipes)
    WHEN EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND ('AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
    ) THEN
      ARRAY(SELECT id FROM bd_equipes)
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

-- Fase 7: Recriar políticas para bd_funcionarios
CREATE POLICY "Admin roles can view all employees"
ON bd_funcionarios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

CREATE POLICY "Admin roles can modify employees"
ON bd_funcionarios
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('SuperAdm' = ANY(funcoes) OR 'AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

CREATE POLICY "Users can view own employee record"
ON bd_funcionarios
FOR SELECT
TO authenticated
USING (
  email = (
    SELECT profiles.email
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Allow email verification for registration"
ON bd_funcionarios
FOR SELECT
TO authenticated
USING (true);

-- Fase 8: Recriar políticas para profiles
CREATE POLICY "Admin roles can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND ('SuperAdm' = ANY(p2.funcoes) OR 'AdmRH' = ANY(p2.funcoes) OR 'Administrador' = ANY(p2.funcoes))
  )
);

CREATE POLICY "Admin roles can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND ('SuperAdm' = ANY(p2.funcoes) OR 'AdmRH' = ANY(p2.funcoes) OR 'Administrador' = ANY(p2.funcoes))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() 
    AND ('SuperAdm' = ANY(p2.funcoes) OR 'AdmRH' = ANY(p2.funcoes) OR 'Administrador' = ANY(p2.funcoes))
  )
);

CREATE POLICY "Allow profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Fase 9: Recriar políticas para bd_apontamento_equipe
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

CREATE POLICY "Operador can only see own appointments"
ON bd_apontamento_equipe
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'Operador' = ANY(funcoes)
  )
  AND colaborador_id IN (
    SELECT bd_funcionarios.id
    FROM bd_funcionarios
    WHERE bd_funcionarios.email = (
      SELECT profiles.email
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
);

-- Fase 10: Recriar políticas para bd_avaliacao_equipe
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

CREATE POLICY "Operador can only see own evaluations"
ON bd_avaliacao_equipe
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'Operador' = ANY(funcoes)
  )
  AND colaborador_id IN (
    SELECT bd_funcionarios.id
    FROM bd_funcionarios
    WHERE bd_funcionarios.email = (
      SELECT profiles.email
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  )
);

-- Fase 11: Recriar políticas para bd_equipes
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

CREATE POLICY "Everyone can insert teams"
ON bd_equipes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Everyone can update teams"
ON bd_equipes
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Everyone can delete teams"
ON bd_equipes
FOR DELETE
TO authenticated
USING (true);

-- Fase 12: Função de debug
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
