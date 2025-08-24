-- CORREÇÃO URGENTE: Aplicação do plano de segurança

-- 1. Corrigir perfil do Lucas
UPDATE profiles 
SET 
  funcionario_id = '28120ca7-1fed-47d7-bf19-89cd10b2c65f',
  funcao_sistema = 'Apontador',
  updated_at = now()
WHERE email = 'lucasnombredeus7@gmail.com';

-- 2. Popular created_by para registros existentes (temporariamente atribuir ao Lucas)
UPDATE bd_registro_apontamento_cam_equipa 
SET created_by = (
  SELECT id FROM profiles WHERE email = 'lucasnombredeus7@gmail.com' LIMIT 1
)
WHERE created_by IS NULL;

-- 3. Garantir que created_by seja sempre populado automaticamente
CREATE OR REPLACE FUNCTION auto_set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para auto-popular created_by
DROP TRIGGER IF EXISTS trigger_auto_set_created_by ON bd_registro_apontamento_cam_equipa;
CREATE TRIGGER trigger_auto_set_created_by
  BEFORE INSERT ON bd_registro_apontamento_cam_equipa
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_created_by();

-- 4. Verificar e recriar políticas RLS se necessário
DROP POLICY IF EXISTS "Apontamentos cam/equip: usuários podem ver baseado em permiss" ON bd_registro_apontamento_cam_equipa;
DROP POLICY IF EXISTS "Apontamentos cam/equip: usuários autenticados podem inserir" ON bd_registro_apontamento_cam_equipa;
DROP POLICY IF EXISTS "Apontamentos cam/equip: usuários podem atualizar seus registro" ON bd_registro_apontamento_cam_equipa;
DROP POLICY IF EXISTS "Apontamentos cam/equip: usuários podem deletar seus registros" ON bd_registro_apontamento_cam_equipa;

-- Recriar políticas RLS
CREATE POLICY "Apontamentos cam/equip: visualização baseada em permissões"
ON bd_registro_apontamento_cam_equipa
FOR SELECT
TO authenticated
USING (
  check_is_super_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema = ANY(ARRAY['Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos'])
  ) OR 
  created_by = auth.uid()
);

CREATE POLICY "Apontamentos cam/equip: inserção autenticada"
ON bd_registro_apontamento_cam_equipa
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Apontamentos cam/equip: atualização baseada em permissões"
ON bd_registro_apontamento_cam_equipa
FOR UPDATE
TO authenticated
USING (
  check_is_super_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema = ANY(ARRAY['Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos'])
  ) OR 
  created_by = auth.uid()
);

CREATE POLICY "Apontamentos cam/equip: exclusão baseada em permissões"
ON bd_registro_apontamento_cam_equipa
FOR DELETE
TO authenticated
USING (
  check_is_super_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema = ANY(ARRAY['Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos'])
  ) OR 
  created_by = auth.uid()
);