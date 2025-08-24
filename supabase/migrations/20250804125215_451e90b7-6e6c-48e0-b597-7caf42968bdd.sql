-- Remover política RLS atual incorreta
DROP POLICY IF EXISTS "Apenas SuperAdmins podem atualizar perfis" ON public.profiles;

-- Criar nova política RLS correta com nome consistente e WITH CHECK clause
CREATE POLICY "Apenas SuperAdm podem atualizar perfis" 
ON public.profiles 
FOR UPDATE 
USING (public.check_is_super_admin())
WITH CHECK (public.check_is_super_admin());