-- SOLUÇÃO DEFINITIVA: Corrigir RLS policies da tabela profiles
-- Remover todas as políticas problemáticas que causam recursão infinita

-- FASE 1: Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "SuperAdmin can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Restricted profile access" ON profiles;
DROP POLICY IF EXISTS "Permission management access" ON profiles;

-- FASE 2: Políticas RLS simples e não-recursivas
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

-- Política especial para SuperAdmins usando função externa para evitar recursão
CREATE POLICY "SuperAdmin can access all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  id = auth.uid() 
  OR 
  check_is_super_admin(auth.uid())
)
WITH CHECK (
  id = auth.uid() 
  OR 
  check_is_super_admin(auth.uid())
);