-- Correção imediata: Atualizar funcao_sistema para SuperAdm para usuários que já são SuperAdm em funcoes
UPDATE profiles 
SET funcao_sistema = 'SuperAdm', updated_at = now()
WHERE 'SuperAdm' = ANY(funcoes) AND funcao_sistema != 'SuperAdm';