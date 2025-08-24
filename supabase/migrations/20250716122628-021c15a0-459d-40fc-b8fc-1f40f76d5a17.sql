-- 1. Primeiro, vamos verificar e corrigir usuários que ainda têm funcao_permissao NULL
-- Verificar se função "user" já existe, se não existir, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM bd_funcoes_permissao WHERE nome_funcao = 'user') THEN
    INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes)
    VALUES ('user', 'Usuário básico do sistema', '{}');
  END IF;
END $$;

-- Atribuir função "user" para usuários que ainda não têm funcao_permissao
UPDATE profiles 
SET funcao_permissao = (SELECT id FROM bd_funcoes_permissao WHERE nome_funcao = 'user' LIMIT 1)
WHERE funcao_permissao IS NULL;

-- 2. Atualizar a policy do profiles
DROP POLICY IF EXISTS "SuperAdmin can access all profiles" ON profiles;
CREATE POLICY "SuperAdmin can access all profiles" 
ON profiles 
FOR ALL 
USING (
  (id = auth.uid()) OR 
  check_is_super_admin_new(auth.uid())
)
WITH CHECK (
  (id = auth.uid()) OR 
  check_is_super_admin_new(auth.uid())
);

-- 3. Atualizar a função check_is_super_admin original para usar o novo sistema
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  );
$function$;

-- 4. Remover o campo funcoes da tabela profiles
ALTER TABLE profiles DROP COLUMN funcoes CASCADE;

-- 5. Tornar funcao_permissao obrigatório (NOT NULL)
ALTER TABLE profiles ALTER COLUMN funcao_permissao SET NOT NULL;

-- 6. Criar função auxiliar para obter permissões do usuário baseada no novo sistema
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT fp.permissoes
  FROM profiles p
  JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
  WHERE p.id = user_id;
$function$;

-- 7. Criar função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$function$;