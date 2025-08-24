
-- CORREÇÃO CRÍTICA: Atualizar perfil do usuário para SuperAdmin
-- Identificar e corrigir o perfil que tem funcoes incorretas

-- Primeiro, vamos verificar o perfil atual
SELECT id, email, nome_completo, funcoes, funcao_permissao 
FROM profiles 
WHERE email = 'wallinsonvs@gmail.com';

-- Corrigir o perfil para ter as funções corretas de SuperAdmin
UPDATE profiles 
SET funcoes = ARRAY['SuperAdm', 'AdmRH']
WHERE email = 'wallinsonvs@gmail.com';

-- Verificar se a correção foi aplicada
SELECT id, email, nome_completo, funcoes, funcao_permissao 
FROM profiles 
WHERE email = 'wallinsonvs@gmail.com';

-- Garantir que não há outros perfis com problema similar
SELECT id, email, nome_completo, funcoes 
FROM profiles 
WHERE 'Operador' = ANY(funcoes) 
AND email LIKE '%@gmail.com%';
