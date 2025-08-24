
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "SuperAdm can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "SuperAdm can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- Habilitar RLS na tabela profiles se não estiver habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Criar política para SuperAdm ver todos os perfis
CREATE POLICY "SuperAdm can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  get_current_user_role() IN ('SuperAdm', 'Administrador', 'AdmRH')
);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Política para SuperAdm atualizar qualquer perfil (para gerenciar permissões)
CREATE POLICY "SuperAdm can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() IN ('SuperAdm', 'Administrador', 'AdmRH')
)
WITH CHECK (
  get_current_user_role() IN ('SuperAdm', 'Administrador', 'AdmRH')
);

-- Política para inserção de novos perfis (registro de usuários)
CREATE POLICY "Allow profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);
