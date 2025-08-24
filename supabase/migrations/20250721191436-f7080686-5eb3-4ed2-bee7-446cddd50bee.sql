-- Transferir a referência restante e excluir definitivamente o duplicado
-- Primeiro, transferir a referência restante
UPDATE bd_registro_apontamento_cam_equipa 
SET operador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
    updated_at = NOW()
WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Verificar se não existem mais referências
SELECT 
  COUNT(*) as total_referencias_restantes
FROM (
  SELECT operador_id FROM bd_registro_apontamento_cam_equipa WHERE operador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
  UNION ALL
  SELECT apontador_id FROM bd_equipes WHERE apontador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
  UNION ALL
  SELECT encarregado_id FROM bd_equipes WHERE encarregado_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
  UNION ALL
  SELECT colaborador_id FROM bd_avaliacao_equipe WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
  UNION ALL
  SELECT colaborador_id FROM bd_apontamento_equipe WHERE colaborador_id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1'
) refs;

-- Excluir diretamente o registro duplicado
DELETE FROM bd_funcionarios 
WHERE id = 'f8f77d09-b5e6-4dbd-9c62-73348d8db7e1';

-- Verificar resultado final - deve existir apenas 1 registro
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