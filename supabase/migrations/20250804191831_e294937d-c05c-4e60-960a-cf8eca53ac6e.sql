-- FASE 1: Correção do perfil do Lucas
UPDATE profiles 
SET 
  funcionario_id = '28120ca7-1fed-47d7-bf19-89cd10b2c65f',
  funcao_sistema = 'Apontador',
  updated_at = now()
WHERE email = 'lucasurselino@hotmail.com';

-- FASE 2: Adicionar coluna created_by na tabela de apontamentos de caminhões
ALTER TABLE bd_registro_apontamento_cam_equipa 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Atualizar registros existentes para ter um created_by (temporariamente o Lucas)
UPDATE bd_registro_apontamento_cam_equipa 
SET created_by = (SELECT id FROM profiles WHERE email = 'lucasurselino@hotmail.com')
WHERE created_by IS NULL;

-- FASE 3: Aplicar RLS na tabela de apontamentos de caminhões
ALTER TABLE bd_registro_apontamento_cam_equipa ENABLE ROW LEVEL SECURITY;

-- Política para visualização
CREATE POLICY "Apontamentos cam/equip: usuários podem ver baseado em permissões"
ON bd_registro_apontamento_cam_equipa
FOR SELECT
TO authenticated
USING (
  -- SuperAdmins podem ver tudo
  check_is_super_admin(auth.uid()) OR
  -- Admins podem ver tudo
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema IN ('Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos')
  ) OR
  -- Usuários podem ver apenas seus próprios registros
  created_by = auth.uid()
);

-- Política para inserção
CREATE POLICY "Apontamentos cam/equip: usuários autenticados podem inserir"
ON bd_registro_apontamento_cam_equipa
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Política para atualização
CREATE POLICY "Apontamentos cam/equip: usuários podem atualizar seus registros"
ON bd_registro_apontamento_cam_equipa
FOR UPDATE
TO authenticated
USING (
  check_is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema IN ('Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos')
  ) OR
  created_by = auth.uid()
);

-- Política para exclusão
CREATE POLICY "Apontamentos cam/equip: usuários podem deletar seus registros"
ON bd_registro_apontamento_cam_equipa
FOR DELETE
TO authenticated
USING (
  check_is_super_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.funcao_sistema IN ('Administrador', 'AdmRH', 'AdmLogistica', 'AdmEquipamentos')
  ) OR
  created_by = auth.uid()
);