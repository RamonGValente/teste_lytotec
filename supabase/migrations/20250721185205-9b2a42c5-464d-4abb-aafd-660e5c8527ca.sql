
-- FASE 1: Transferir todas as referências do registro duplicado para o registro original
-- Transferir apontamentos de caminhão/equipamentos
UPDATE bd_registro_apontamento_cam_equipa 
SET operador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Transferir referências em equipes (apontador)
UPDATE bd_equipes 
SET apontador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE apontador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Transferir referências em equipes (encarregado)
UPDATE bd_equipes 
SET encarregado_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE encarregado_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Transferir avaliações de equipe
UPDATE bd_avaliacao_equipe 
SET colaborador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Transferir apontamentos de equipe
UPDATE bd_apontamento_equipe 
SET colaborador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- FASE 2: Garantir que o registro original tenha o CPF correto
UPDATE bd_funcionarios 
SET cpf = '164.862.817-66',
    updated_at = NOW()
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';

-- FASE 3: Verificar se ainda existem referências ao registro duplicado
-- Esta consulta deve retornar 0 em todas as tabelas
SELECT 
  'bd_registro_apontamento_cam_equipa' as tabela,
  COUNT(*) as referencias_restantes
FROM bd_registro_apontamento_cam_equipa 
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_equipes_apontador' as tabela,
  COUNT(*) as referencias_restantes
FROM bd_equipes 
WHERE apontador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_equipes_encarregado' as tabela,
  COUNT(*) as referencias_restantes
FROM bd_equipes 
WHERE encarregado_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_avaliacao_equipe' as tabela,
  COUNT(*) as referencias_restantes
FROM bd_avaliacao_equipe 
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_apontamento_equipe' as tabela,
  COUNT(*) as referencias_restantes
FROM bd_apontamento_equipe 
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- FASE 4: Excluir o registro duplicado usando bypass SuperAdmin
SELECT delete_funcionario_with_admin_bypass('f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'::uuid) as exclusao_realizada;

-- FASE 5: Verificar resultado final - deve existir apenas 1 registro
SELECT 
  id,
  nome_completo,
  cpf,
  data_admissao,
  status,
  created_at,
  updated_at
FROM bd_funcionarios 
WHERE UPPER(nome_completo) LIKE '%JHONATHAN%MARTINS%SILVEIRA%'
ORDER BY created_at;
