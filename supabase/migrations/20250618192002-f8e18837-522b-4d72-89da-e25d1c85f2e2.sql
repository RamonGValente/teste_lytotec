
-- Habilitar RLS nas tabelas principais
ALTER TABLE bd_apontamento_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_avaliacao_equipe ENABLE ROW LEVEL SECURITY;

-- Função para obter o papel do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT CASE 
      WHEN 'SuperAdm' = ANY(funcoes) THEN 'SuperAdm'
      WHEN 'Apontador' = ANY(funcoes) THEN 'Apontador'
      WHEN 'Encarregado' = ANY(funcoes) THEN 'Encarregado'
      WHEN 'Operador' = ANY(funcoes) THEN 'Operador'
      WHEN 'AdmRH' = ANY(funcoes) THEN 'AdmRH'
      ELSE 'user'
    END
    FROM profiles 
    WHERE id = auth.uid()),
    'user'
  );
$$;

-- Função para obter equipes permitidas para o usuário atual
CREATE OR REPLACE FUNCTION get_user_allowed_teams()
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN get_current_user_role() = 'SuperAdm' THEN 
      ARRAY(SELECT id FROM bd_equipes)
    WHEN get_current_user_role() IN ('AdmRH', 'Administrador') THEN
      ARRAY(SELECT id FROM bd_equipes)
    ELSE
      ARRAY(
        SELECT id FROM bd_equipes 
        WHERE apontador_id IN (
          SELECT id FROM bd_funcionarios WHERE email = (
            SELECT email FROM profiles WHERE id = auth.uid()
          )
        )
        OR encarregado_id IN (
          SELECT id FROM bd_funcionarios WHERE email = (
            SELECT email FROM profiles WHERE id = auth.uid()
          )
        )
      )
  END;
$$;

-- RLS para bd_apontamento_equipe
CREATE POLICY "SuperAdm can access all appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (get_current_user_role() = 'SuperAdm');

CREATE POLICY "AdmRH can access all appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (get_current_user_role() = 'AdmRH');

CREATE POLICY "Apontador can access team appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'Apontador' 
  AND equipe_id = ANY(get_user_allowed_teams())
);

CREATE POLICY "Encarregado can access team appointments"
ON bd_apontamento_equipe
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'Encarregado' 
  AND equipe_id = ANY(get_user_allowed_teams())
);

CREATE POLICY "Operador can only see own appointments"
ON bd_apontamento_equipe
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'Operador' 
  AND colaborador_id IN (
    SELECT id FROM bd_funcionarios WHERE email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  )
);

-- RLS para bd_equipes
CREATE POLICY "SuperAdm can access all teams"
ON bd_equipes
FOR ALL
TO authenticated
USING (get_current_user_role() = 'SuperAdm');

CREATE POLICY "AdmRH can access all teams"
ON bd_equipes
FOR ALL
TO authenticated
USING (get_current_user_role() = 'AdmRH');

CREATE POLICY "Users can access allowed teams"
ON bd_equipes
FOR ALL
TO authenticated
USING (
  get_current_user_role() IN ('Apontador', 'Encarregado')
  AND id = ANY(get_user_allowed_teams())
);

-- RLS para bd_avaliacao_equipe
CREATE POLICY "SuperAdm can access all evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (get_current_user_role() = 'SuperAdm');

CREATE POLICY "AdmRH can access all evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (get_current_user_role() = 'AdmRH');

CREATE POLICY "Apontador can access team evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'Apontador' 
  AND equipe_id = ANY(get_user_allowed_teams())
);

CREATE POLICY "Encarregado can access team evaluations"
ON bd_avaliacao_equipe
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'Encarregado' 
  AND equipe_id = ANY(get_user_allowed_teams())
);

CREATE POLICY "Operador can only see own evaluations"
ON bd_avaliacao_equipe
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'Operador' 
  AND colaborador_id IN (
    SELECT id FROM bd_funcionarios WHERE email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  )
);
