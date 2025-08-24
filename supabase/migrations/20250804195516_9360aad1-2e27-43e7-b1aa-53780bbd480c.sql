-- Correção simples: Manter registros órfãos com created_by do Lucas
-- mas adicionar um comentário/observação para distinguir

-- Verificar quantos registros temos com operador_id diferente de created_by
SELECT COUNT(*) as total_registros_inconsistentes
FROM bd_registro_apontamento_cam_equipa r
WHERE r.operador_id IS NOT NULL 
  AND r.created_by IS NOT NULL
  AND r.operador_id != r.created_by;