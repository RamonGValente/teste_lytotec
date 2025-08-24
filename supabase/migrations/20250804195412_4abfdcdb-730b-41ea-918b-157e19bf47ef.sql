-- Correção definitiva: Criar perfis para operadores e corrigir created_by

-- 1. Adicionar constraint UNIQUE em funcionario_id na tabela profiles (se não existir)
ALTER TABLE profiles ADD CONSTRAINT profiles_funcionario_id_key UNIQUE (funcionario_id);

-- 2. Criar perfis para funcionários que aparecem como operadores mas não têm perfil
INSERT INTO profiles (id, funcionario_id, email, nome_completo, funcao_sistema)
SELECT 
  gen_random_uuid(),
  f.id,
  f.email,
  f.nome_completo,
  'Apontador'
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

-- 3. Atualizar created_by dos registros para que reflitam o verdadeiro criador
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
    SELECT 1 FROM profiles p 
    WHERE p.funcionario_id = r.operador_id
  );