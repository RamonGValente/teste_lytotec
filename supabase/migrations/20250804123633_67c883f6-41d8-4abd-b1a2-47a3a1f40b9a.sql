-- Atualizar função check_is_super_admin para verificar array funcoes[]
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    -- Verificar se 'SuperAdm' está no array funcoes[]
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND 'SuperAdm' = ANY(p.funcoes)
  ) OR EXISTS (
    -- Fallback para emails SuperAdmin específicos
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND p.email IN ('julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com')
  );
$function$;

-- Remover política RLS atual de UPDATE na tabela profiles
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- Criar nova política RLS: apenas SuperAdmins podem atualizar qualquer perfil
CREATE POLICY "Apenas SuperAdmins podem atualizar perfis" 
ON public.profiles 
FOR UPDATE 
USING (public.check_is_super_admin());