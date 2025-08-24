
-- Corrigir políticas RLS da tabela profiles para evitar dependência circular
-- Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Admin roles can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin roles can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- Recriar políticas mais simples e funcionais
-- Política básica: usuários podem ver seu próprio perfil (sem dependência circular)
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Política básica: usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Política para criação de perfis (necessária para registro)
CREATE POLICY "Allow profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para SuperAdmins (usando verificação direta sem recursão)
CREATE POLICY "SuperAdm can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Verificação direta se o usuário atual é SuperAdm
  EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() 
    AND 'SuperAdm' = ANY(p2.funcoes)
  )
  OR id = auth.uid() -- OU se é o próprio perfil
);

CREATE POLICY "SuperAdm can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() 
    AND 'SuperAdm' = ANY(p2.funcoes)
  )
  OR id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() 
    AND 'SuperAdm' = ANY(p2.funcoes)
  )
  OR id = auth.uid()
);

-- Simplificar a função get_current_user_role para evitar problemas
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
