-- Corrigir políticas RLS da tabela profiles para operações de permissão
-- Problema: Usuários não-SuperAdmin podem ver todos os perfis na gestão de permissões

-- FASE 1: Atualizar política de SELECT para ser mais restritiva
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Nova política mais restritiva para SELECT
CREATE POLICY "Restricted profile access" 
ON profiles 
FOR SELECT 
USING (
  -- Usuário pode ver seu próprio perfil
  id = auth.uid() 
  OR 
  -- SuperAdmin pode ver todos os perfis
  check_is_super_admin(auth.uid())
);

-- FASE 2: Política especial para gestão de permissões
CREATE POLICY "Permission management access" 
ON profiles 
FOR SELECT 
TO authenticated
USING (
  -- SuperAdmin tem acesso total
  check_is_super_admin(auth.uid())
  OR
  -- Administrador tem acesso limitado
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'Administrador' = ANY(funcoes)
  )
);