-- Corrigir consolidação: remover CPF do duplicado antes de transferir
-- 1. Limpar CPF do registro duplicado primeiro
UPDATE bd_funcionarios 
SET cpf = NULL
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- 2. Agora transferir CPF para o registro antigo
UPDATE bd_funcionarios 
SET cpf = '164.862.817-66'
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';

-- 3. Excluir o registro duplicado
DELETE FROM bd_funcionarios 
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- 4. Verificar resultado final
SELECT 
  id,
  nome_completo,
  cpf,
  data_admissao,
  status
FROM bd_funcionarios 
WHERE UPPER(nome_completo) LIKE '%JHONATHAN%MARTINS%SILVEIRA%';