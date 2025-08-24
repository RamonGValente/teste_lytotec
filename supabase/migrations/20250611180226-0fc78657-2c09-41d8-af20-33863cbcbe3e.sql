
-- Primeiro, vamos limpar todos os equipe_id órfãos na tabela bd_funcionarios
-- que não correspondem a equipes existentes
UPDATE bd_funcionarios 
SET equipe_id = NULL 
WHERE equipe_id IS NOT NULL 
AND equipe_id NOT IN (SELECT id FROM bd_equipes);

-- Verificar e corrigir funcionários que estão marcados como membros de equipes
-- mas não estão na lista de membros da equipe correspondente
UPDATE bd_funcionarios 
SET equipe_id = NULL 
WHERE equipe_id IS NOT NULL 
AND id NOT IN (
    SELECT UNNEST(equipe) 
    FROM bd_equipes 
    WHERE bd_funcionarios.equipe_id = bd_equipes.id
);

-- Garantir que funcionários que estão na lista de membros de uma equipe
-- tenham o equipe_id correto
UPDATE bd_funcionarios 
SET equipe_id = eq.id
FROM bd_equipes eq
WHERE bd_funcionarios.id = ANY(eq.equipe)
AND (bd_funcionarios.equipe_id IS NULL OR bd_funcionarios.equipe_id != eq.id);
