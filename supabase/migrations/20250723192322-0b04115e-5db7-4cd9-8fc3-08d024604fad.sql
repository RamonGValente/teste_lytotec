-- FASE 1: SOLUÇÃO IMEDIATA - Criar perfil para o usuário atual
INSERT INTO profiles (id, email, nome_completo, funcao_permissao)
VALUES (
  '0920853d-44ab-4753-9f95-eea52153245a',
  'julianohcampos@yahoo.com.br', 
  'Juliano Campos',
  NULL -- Aguardando aprovação do SuperAdmin
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nome_completo = EXCLUDED.nome_completo;

-- FASE 2: IMPLEMENTAR TRIGGER AUTOMÁTICO para novos usuários
-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo, funcao_permissao)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', NEW.email),
    NULL -- Usuário precisa ser aprovado por SuperAdmin
  );
  RETURN NEW;
END;
$$;

-- Trigger que executa a função quando usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FASE 3: AJUSTAR SISTEMA DE PERMISSÕES
-- Criar função para verificar se usuário é SuperAdmin (melhorada)
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  ) OR EXISTS (
    -- Fallback para emails SuperAdmin mesmo sem funcao_permissao
    SELECT 1 FROM profiles p
    WHERE p.id = user_id 
    AND p.email IN ('julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com')
  );
$function$;

-- FASE 4: MIGRAÇÃO DOS USUÁRIOS EXISTENTES
-- Inserir perfis para todos os usuários que existem em auth.users mas não em profiles
INSERT INTO profiles (id, email, nome_completo, funcao_permissao)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'nome_completo', au.email) as nome_completo,
  NULL as funcao_permissao -- Aguardando aprovação
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Dar permissão SuperAdmin para emails específicos
UPDATE profiles 
SET funcao_permissao = (
  SELECT id FROM bd_funcoes_permissao 
  WHERE nome_funcao = 'SuperAdm' 
  LIMIT 1
)
WHERE email IN ('julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com')
AND funcao_permissao IS NULL;