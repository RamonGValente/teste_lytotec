
-- FASE 1: Consolidar dados no registro antigo
-- Atualizar o registro antigo (0ad8d8d9-e853-4263-8dd0-8dd5613db6be) com o CPF do registro recente
UPDATE bd_funcionarios 
SET cpf = '164.862.817-66',
    updated_at = NOW()
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';

-- FASE 2: Transferir referências do registro recente para o antigo
-- Transferir apontamentos de caminhão (operador_id)
UPDATE bd_registro_apontamento_cam_equipa 
SET operador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- FASE 3: Verificar se ainda existem referências ao registro recente
-- Esta consulta deve retornar 0 em todas as tabelas para confirmar que é seguro excluir
SELECT 
  'bd_registro_apontamento_cam_equipa' as tabela,
  COUNT(*) as referencias
FROM bd_registro_apontamento_cam_equipa 
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_equipes_encarregado' as tabela,
  COUNT(*) as referencias
FROM bd_equipes 
WHERE encarregado_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_equipes_apontador' as tabela,
  COUNT(*) as referencias
FROM bd_equipes 
WHERE apontador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
UNION ALL
SELECT 
  'bd_avaliacao_equipe' as tabela,
  COUNT(*) as referencias
FROM bd_avaliacao_equipe 
WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- FASE 4: Excluir o registro recente usando a função de bypass do SuperAdmin
-- Esta função permite excluir mesmo com referências (caso existam algumas que não foram transferidas)
SELECT delete_funcionario_with_admin_bypass('f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'::uuid) as exclusao_realizada;

-- FASE 5: Verificar resultado final
-- Confirmar que existe apenas um registro para Jhonathan
SELECT 
  id,
  nome_completo,
  cpf,
  data_admissao,
  status,
  created_at
FROM bd_funcionarios 
WHERE UPPER(nome_completo) LIKE '%JHONATHAN%MARTINS%SILVEIRA%'
ORDER BY created_at;
