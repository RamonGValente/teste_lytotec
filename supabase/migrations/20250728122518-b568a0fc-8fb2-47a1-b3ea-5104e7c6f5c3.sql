-- Primeiro: deletar registros filhos (detalhes) para evitar trigger
DELETE FROM bd_registro_aplicacao_detalhes;

-- Segundo: deletar registros principais
DELETE FROM bd_registro_apontamento_aplicacao;

-- Terceiro: modificar a constraint para ON DELETE CASCADE

-- Remover a constraint atual
ALTER TABLE bd_registro_aplicacao_detalhes 
DROP CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey;

-- Recriar a constraint com ON DELETE CASCADE
ALTER TABLE bd_registro_aplicacao_detalhes 
ADD CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey 
FOREIGN KEY (registro_aplicacao_id) 
REFERENCES bd_registro_apontamento_aplicacao(id) 
ON DELETE CASCADE;