
-- CORREÇÃO FINAL: Eliminar recursão infinita nas políticas RLS da tabela profiles

-- FASE 1: Remover todas as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "SuperAdm access all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- FASE 2: Criar função security definer para verificar SuperAdmin sem recursão
CREATE OR REPLACE FUNCTION check_is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND 'SuperAdm' = ANY(funcoes)
  );
$$;

-- FASE 3: Recriar políticas RLS simples e sem recursão
-- Política básica: usuários podem ver seu próprio perfil
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

-- Política especial para SuperAdmins (usando função externa para evitar recursão)
CREATE POLICY "SuperAdmin can access all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  id = auth.uid() OR 
  check_is_super_admin(auth.uid())
)
WITH CHECK (
  id = auth.uid() OR 
  check_is_super_admin(auth.uid())
);

-- FASE 4: Atualizar função get_current_user_role para ser mais robusta
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_functions text[];
BEGIN
    -- Buscar funções do usuário usando a função auxiliar
    IF check_is_super_admin(auth.uid()) THEN
        RETURN 'SuperAdm';
    END IF;
    
    -- Buscar outras funções
    SELECT funcoes INTO user_functions
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Se não encontrou o perfil, retornar 'user'
    IF user_functions IS NULL THEN
        RETURN 'user';
    END IF;
    
    -- Verificar hierarquia de funções
    IF 'AdmRH' = ANY(user_functions) THEN
        RETURN 'AdmRH';
    ELSIF 'Administrador' = ANY(user_functions) THEN
        RETURN 'Administrador';
    ELSIF 'Apontador' = ANY(user_functions) THEN
        RETURN 'Apontador';
    ELSIF 'Encarregado' = ANY(user_functions) THEN
        RETURN 'Encarregado';
    ELSIF 'Operador' = ANY(user_functions) THEN
        RETURN 'Operador';
    ELSE
        RETURN 'user';
    END IF;
END;
$$;
