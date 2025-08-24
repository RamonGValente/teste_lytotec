-- Solução definitiva: Excluir o registro inconsistente
-- Como é apenas 1 registro e está causando problema no sistema,
-- é melhor removê-lo para resolver o problema do RLS

DELETE FROM bd_registro_apontamento_cam_equipa
WHERE id = '78dcd8e1-7e4e-471c-87d7-bf5350a48a3e'
  AND operador_id != created_by;