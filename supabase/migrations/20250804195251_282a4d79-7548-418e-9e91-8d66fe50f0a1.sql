-- Correção definitiva: Atualizar created_by dos registros onde o operador tem funcionario_id
-- mas não tem perfil ainda, mantendo a referência correta do criador

-- 1. Para registros onde o operador_id existe no bd_funcionarios mas não tem perfil,
--    vamos atualizar o created_by para refletir que foi o próprio operador quem criou
UPDATE bd_registro_apontamento_cam_equipa r
SET created_by = (
  -- Buscar se existe um perfil para este funcionário
  SELECT p.id 
  FROM profiles p 
  WHERE p.funcionario_id = r.operador_id
  LIMIT 1
)
WHERE r.operador_id IS NOT NULL 
  AND r.created_by IS NOT NULL
  AND r.operador_id != r.created_by
  AND EXISTS (
    SELECT 1 FROM bd_funcionarios f 
    WHERE f.id = r.operador_id
  )
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.funcionario_id = r.operador_id
  );

-- 2. Para casos onde o funcionário existe mas não tem perfil ainda,
--    vamos criar um registro básico na tabela profiles
INSERT INTO profiles (id, funcionario_id, email, nome_completo, funcao_sistema)
SELECT 
  gen_random_uuid(),
  f.id,
  f.email,
  f.nome_completo,
  'Usuário'
FROM bd_funcionarios f
WHERE f.id IN (
  SELECT DISTINCT r.operador_id 
  FROM bd_registro_apontamento_cam_equipa r
  WHERE r.operador_id IS NOT NULL 
    AND r.created_by IS NOT NULL
    AND r.operador_id != r.created_by
    AND NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.funcionario_id = r.operador_id
    )
)
ON CONFLICT (funcionario_id) DO NOTHING;

-- 3. Agora atualizar os registros restantes onde o operador não tinha perfil
UPDATE bd_registro_apontamento_cam_equipa r
SET created_by = (
  SELECT p.id 
  FROM profiles p 
  WHERE p.funcionario_id = r.operador_id
  LIMIT 1
)
WHERE r.operador_id IS NOT NULL 
  AND r.created_by IS NOT NULL
  AND r.operador_id != r.created_by
  AND EXISTS (
    SELECT 1 FROM bd_funcionarios f 
    WHERE f.id = r.operador_id
  )
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.funcionario_id = r.operador_id
  );