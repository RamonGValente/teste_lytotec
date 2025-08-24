
-- Verificar se RLS está habilitado na tabela bd_funcionarios
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'bd_funcionarios';

-- Verificar políticas existentes na tabela bd_funcionarios
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bd_funcionarios';

-- Habilitar RLS na tabela bd_funcionarios se não estiver habilitado
ALTER TABLE bd_funcionarios ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir verificação de email durante registro
-- Esta política permite SELECT na coluna email para verificar se o email existe
CREATE POLICY "Allow email verification for registration"
ON bd_funcionarios
FOR SELECT
TO anon, authenticated
USING (true);

-- Política para usuários autenticados verem apenas seus próprios dados
CREATE POLICY "Users can view own employee record"
ON bd_funcionarios
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);

-- Política para SuperAdm e AdmRH verem todos os funcionários
CREATE POLICY "SuperAdm and AdmRH can view all employees"
ON bd_funcionarios
FOR ALL
TO authenticated
USING (
  get_current_user_role() IN ('SuperAdm', 'AdmRH', 'Administrador')
);

-- Política para permitir que apenas SuperAdm e AdmRH modifiquem funcionários
CREATE POLICY "SuperAdm and AdmRH can modify employees"
ON bd_funcionarios
FOR ALL
TO authenticated
USING (
  get_current_user_role() IN ('SuperAdm', 'AdmRH', 'Administrador')
)
WITH CHECK (
  get_current_user_role() IN ('SuperAdm', 'AdmRH', 'Administrador')
);
