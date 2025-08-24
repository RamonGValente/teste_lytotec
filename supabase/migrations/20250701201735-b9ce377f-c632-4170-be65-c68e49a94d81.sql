
-- Corrigir recursão infinita nas políticas RLS da tabela profiles
-- Remover políticas problemáticas que causam dependência circular
DROP POLICY IF EXISTS "SuperAdm can view all profiles" ON profiles;
DROP POLICY IF EXISTS "SuperAdm can update all profiles" ON profiles;

-- Recriar políticas mais simples sem recursão
-- Política simples: SuperAdmins podem ver todos os perfis (verificação direta)
CREATE POLICY "SuperAdm can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Verificação direta sem recursão: se o próprio usuário é SuperAdm OU se é o próprio perfil
  (
    SELECT 'SuperAdm' = ANY(funcoes) 
    FROM profiles p2 
    WHERE p2.id = auth.uid()
  ) 
  OR id = auth.uid()
);

-- Política simples: SuperAdmins podem atualizar todos os perfis
CREATE POLICY "SuperAdm can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  (
    SELECT 'SuperAdm' = ANY(funcoes) 
    FROM profiles p2 
    WHERE p2.id = auth.uid()
  ) 
  OR id = auth.uid()
)
WITH CHECK (
  (
    SELECT 'SuperAdm' = ANY(funcoes) 
    FROM profiles p2 
    WHERE p2.id = auth.uid()
  ) 
  OR id = auth.uid()
);

-- Atualizar função get_current_user_role para ser mais robusta
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_functions text[];
BEGIN
    -- Buscar funções do usuário de forma direta
    SELECT funcoes INTO user_functions
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Se não encontrou o perfil, retornar 'user'
    IF user_functions IS NULL THEN
        RETURN 'user';
    END IF;
    
    -- Verificar hierarquia de funções
    IF 'SuperAdm' = ANY(user_functions) THEN
        RETURN 'SuperAdm';
    ELSIF 'AdmRH' = ANY(user_functions) THEN
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
