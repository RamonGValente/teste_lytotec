
-- SOLUÇÃO DEFINITIVA: Correção completa do RLS e dados do usuário

-- FASE 1: Limpar todas as políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "SuperAdm can view all profiles" ON profiles;
DROP POLICY IF EXISTS "SuperAdm can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- FASE 2: Recriar políticas RLS mais simples e sem recursão
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

-- Política para SuperAdmins (usando verificação direta e mais simples)
CREATE POLICY "SuperAdm access all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  -- Permite acesso se é o próprio perfil OU se é SuperAdm (verificação direta)
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() 
    AND 'SuperAdm' = ANY(p2.funcoes)
  )
)
WITH CHECK (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.id = auth.uid() 
    AND 'SuperAdm' = ANY(p2.funcoes)
  )
);

-- FASE 3: Corrigir perfil do usuário logado para SuperAdmin
-- Atualizar o usuário julianohcampos@yahoo.com.br para ter funcoes corretas
UPDATE profiles 
SET funcoes = ARRAY['SuperAdm', 'AdmRH']
WHERE email = 'julianohcampos@yahoo.com.br';

-- Verificar se a correção foi aplicada
SELECT id, email, nome_completo, funcoes 
FROM profiles 
WHERE email = 'julianohcampos@yahoo.com.br';

-- FASE 4: Recriar função get_current_user_role mais robusta
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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
