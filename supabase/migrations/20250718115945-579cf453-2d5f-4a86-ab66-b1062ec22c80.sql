-- Transferir todas as referências restantes e excluir duplicado
-- 1. Dar CPF temporário ao registro duplicado primeiro
UPDATE bd_funcionarios 
SET cpf = '000.000.000-00'
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- 2. Transferir CPF correto para o registro antigo
UPDATE bd_funcionarios 
SET cpf = '164.862.817-66'
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';

-- 3. Transferir TODAS as referências do duplicado para o antigo
-- Apontamentos de caminhão
UPDATE bd_registro_apontamento_cam_equipa 
SET operador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Apontamentos de equipe
UPDATE bd_apontamento_equipe 
SET colaborador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Avaliações de equipe
UPDATE bd_avaliacao_equipe 
SET colaborador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Equipes como encarregado
UPDATE bd_equipes 
SET encarregado_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE encarregado_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Equipes como apontador
UPDATE bd_equipes 
SET apontador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE apontador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- 4. Agora excluir o registro duplicado
DELETE FROM bd_funcionarios 
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';