-- Finalizar consolidação: transferir CPF e excluir duplicado
-- 1. Transferir CPF para o registro antigo
UPDATE bd_funcionarios 
SET cpf = '164.862.817-66',
    updated_at = NOW()
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';

-- 2. Excluir fisicamente o registro duplicado
DELETE FROM bd_funcionarios 
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- 3. Verificar resultado final
SELECT 
  id,
  nome_completo,
  cpf,
  data_admissao,
  status,
  created_at
FROM bd_funcionarios 
WHERE UPPER(nome_completo) LIKE '%JHONATHAN%MARTINS%SILVEIRA%';