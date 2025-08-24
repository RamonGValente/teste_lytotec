-- Restaurar o campo funcoes na tabela profiles
ALTER TABLE profiles ADD COLUMN funcoes text[];

-- Sincronizar dados existentes: popular funcoes baseado no nome_funcao de bd_funcoes_permissao
UPDATE profiles 
SET funcoes = ARRAY[fp.nome_funcao]
FROM bd_funcoes_permissao fp
WHERE profiles.funcao_permissao = fp.id;

-- Criar função para verificar permissões via sistema híbrido
CREATE OR REPLACE FUNCTION public.user_has_permission_hybrid(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Verificar via funcao_permissao (sistema hierárquico)
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  )
  OR
  -- Verificar via funcoes (array legacy)
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON fp.nome_funcao = ANY(p.funcoes)
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$$;

-- Criar função para obter todas as permissões do usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions_hybrid(user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Combinar permissões do sistema hierárquico e legacy
  SELECT ARRAY(
    SELECT DISTINCT perm.nome_permissao
    FROM profiles p
    JOIN bd_funcoes_permissao fp ON (p.funcao_permissao = fp.id OR fp.nome_funcao = ANY(p.funcoes))
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id
  );
$$;

-- Criar função para verificar se usuário é super admin via sistema híbrido
CREATE OR REPLACE FUNCTION public.check_is_super_admin_hybrid(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND 'SuperAdm' = ANY(p.funcoes)
  );
$$;

-- Criar trigger para sincronizar funcoes quando funcao_permissao é alterada
CREATE OR REPLACE FUNCTION public.sync_funcoes_on_funcao_permissao_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar funcoes array baseado na funcao_permissao
  IF NEW.funcao_permissao IS NOT NULL THEN
    SELECT ARRAY[fp.nome_funcao] INTO NEW.funcoes
    FROM bd_funcoes_permissao fp
    WHERE fp.id = NEW.funcao_permissao;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER sync_funcoes_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_funcoes_on_funcao_permissao_change();

-- Atualizar políticas RLS para usar sistema híbrido
DROP POLICY IF EXISTS "SuperAdmin can access all profiles" ON profiles;
CREATE POLICY "SuperAdmin can access all profiles" ON profiles
  FOR ALL
  USING (
    (id = auth.uid()) OR 
    check_is_super_admin_hybrid(auth.uid())
  )
  WITH CHECK (
    (id = auth.uid()) OR 
    check_is_super_admin_hybrid(auth.uid())
  );