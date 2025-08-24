-- 1. Primeiro, vamos corrigir os dados inconsistentes atuais
-- Corrigir Jhonathan para ter função "Apontador" em vez de "AdmRH"
UPDATE profiles 
SET funcao_permissao = 'd639bc87-2933-49f0-a529-25f1318620e5'
WHERE email = 'jhonathanmartins4545@gmail.com';

-- Corrigir usuários que têm "Apontador" em funcoes mas funcao_permissao NULL
UPDATE profiles 
SET funcao_permissao = 'd639bc87-2933-49f0-a529-25f1318620e5'
WHERE 'Apontador' = ANY(funcoes) AND funcao_permissao IS NULL;

-- Corrigir usuários que têm "Encarregado" em funcoes mas funcao_permissao NULL
UPDATE profiles 
SET funcao_permissao = (SELECT id FROM bd_funcoes_permissao WHERE nome_funcao = 'Encarregado' LIMIT 1)
WHERE 'Encarregado' = ANY(funcoes) AND funcao_permissao IS NULL;

-- Corrigir usuários que têm "Operador" em funcoes mas funcao_permissao NULL
UPDATE profiles 
SET funcao_permissao = (SELECT id FROM bd_funcoes_permissao WHERE nome_funcao = 'Operador' LIMIT 1)
WHERE 'Operador' = ANY(funcoes) AND funcao_permissao IS NULL;

-- 2. Criar função para verificar se usuário é SuperAdmin baseado na função de permissão
CREATE OR REPLACE FUNCTION public.check_is_super_admin_new(user_id uuid)
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

-- 3. Atualizar a função get_current_user_role para usar o novo sistema
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
DECLARE
    user_role text;
BEGIN
    -- Buscar a função do usuário através da tabela bd_funcoes_permissao
    SELECT fp.nome_funcao INTO user_role
    FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid();
    
    -- Se não encontrou o perfil, retornar 'user'
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$function$;

-- 4. Atualizar todas as policies para usar o novo sistema
-- Policy para bd_empresas
DROP POLICY IF EXISTS "Only admins can delete companies" ON bd_empresas;
CREATE POLICY "Only admins can delete companies" 
ON bd_empresas 
FOR DELETE 
USING (check_is_super_admin_new(auth.uid()));

-- Policy para bd_lista_programacao_entrega  
DROP POLICY IF EXISTS "SuperAdmin can access all deliveries" ON bd_lista_programacao_entrega;
CREATE POLICY "SuperAdmin can access all deliveries" 
ON bd_lista_programacao_entrega 
FOR ALL 
USING (check_is_super_admin_new(auth.uid()));

-- Policy para bd_registro_cargas
DROP POLICY IF EXISTS "SuperAdmin can access all cargo records" ON bd_registro_cargas;
CREATE POLICY "SuperAdmin can access all cargo records" 
ON bd_registro_cargas 
FOR ALL 
USING (check_is_super_admin_new(auth.uid()));

-- Policy para bd_caminhoes_equipamentos
DROP POLICY IF EXISTS "Allow SuperAdmin access to caminhoes" ON bd_caminhoes_equipamentos;
CREATE POLICY "Allow SuperAdmin access to caminhoes" 
ON bd_caminhoes_equipamentos 
FOR ALL 
USING (check_is_super_admin_new(auth.uid()));

-- Policy para bd_usinas
DROP POLICY IF EXISTS "Allow SuperAdmin access to usinas" ON bd_usinas;
CREATE POLICY "Allow SuperAdmin access to usinas" 
ON bd_usinas 
FOR ALL 
USING (check_is_super_admin_new(auth.uid()));

-- Policy para bd_requisicoes (manter a policy "Allow all access" também)
DROP POLICY IF EXISTS "Allow SuperAdmin access to requisicoes" ON bd_requisicoes;
CREATE POLICY "Allow SuperAdmin access to requisicoes" 
ON bd_requisicoes 
FOR ALL 
USING (check_is_super_admin_new(auth.uid()));