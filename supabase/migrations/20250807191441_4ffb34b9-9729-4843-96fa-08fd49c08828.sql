-- Secure RLS for team attendance (bd_apontamento_equipe)
-- 1) Helper function to check if a user can access a specific team
CREATE OR REPLACE FUNCTION public.usuario_acessa_equipe(p_user_id uuid, p_equipe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    -- Super admin has full access
    check_is_super_admin(p_user_id)
    OR
    -- Admin roles have full access
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = p_user_id
        AND p.funcao_sistema IN ('Administrador','AdmRH','AdmLogistica','AdmEquipamentos')
    )
    OR
    -- Apontador/Encarregado: access only their teams
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.bd_equipes e ON e.id = p_equipe_id
      WHERE p.id = p_user_id
        AND p.funcionario_id IS NOT NULL
        AND (p.funcionario_id = e.apontador_id OR p.funcionario_id = e.encarregado_id)
    );
$$;

-- 2) Ensure RLS is enabled
ALTER TABLE public.bd_apontamento_equipe ENABLE ROW LEVEL SECURITY;

-- 3) Drop overly-permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'bd_apontamento_equipe' 
      AND policyname = 'Usuários autenticados podem acessar apontamentos de equipe'
  ) THEN
    EXECUTE 'DROP POLICY "Usuários autenticados podem acessar apontamentos de equipe" ON public.bd_apontamento_equipe';
  END IF;
END $$;

-- 4) Create granular policies
-- SELECT: SuperAdm/Admins; Apontadores/Encarregados for their teams; Operators for own records; creator of record
CREATE POLICY "Apontamento equipe: seleção por regras"
ON public.bd_apontamento_equipe
FOR SELECT
TO authenticated
USING (
  check_is_super_admin()
  OR usuario_acessa_equipe(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.funcionario_id = colaborador_id
  )
  OR registrado_por = auth.uid()
);

-- INSERT: SuperAdm/Admins; Apontadores/Encarregados for their teams; Operators for self records
CREATE POLICY "Apontamento equipe: inserção por regras"
ON public.bd_apontamento_equipe
FOR INSERT
TO authenticated
WITH CHECK (
  check_is_super_admin()
  OR usuario_acessa_equipe(auth.uid(), equipe_id)
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.funcionario_id = colaborador_id
  )
);

-- UPDATE: SuperAdm/Admins; Apontadores/Encarregados for their teams; creator of record
CREATE POLICY "Apontamento equipe: atualização por regras"
ON public.bd_apontamento_equipe
FOR UPDATE
TO authenticated
USING (
  check_is_super_admin()
  OR usuario_acessa_equipe(auth.uid(), equipe_id)
  OR registrado_por = auth.uid()
)
WITH CHECK (
  check_is_super_admin()
  OR usuario_acessa_equipe(auth.uid(), equipe_id)
  OR registrado_por = auth.uid()
);

-- DELETE: SuperAdm/Admins; Apontadores/Encarregados for their teams; creator of record
CREATE POLICY "Apontamento equipe: exclusão por regras"
ON public.bd_apontamento_equipe
FOR DELETE
TO authenticated
USING (
  check_is_super_admin()
  OR usuario_acessa_equipe(auth.uid(), equipe_id)
  OR registrado_por = auth.uid()
);
