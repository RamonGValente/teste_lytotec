-- FASE 1: Modificar a Constraint para ON DELETE CASCADE

-- Remover a constraint atual
ALTER TABLE bd_registro_aplicacao_detalhes 
DROP CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey;

-- Recriar a constraint com ON DELETE CASCADE
ALTER TABLE bd_registro_aplicacao_detalhes 
ADD CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey 
FOREIGN KEY (registro_aplicacao_id) 
REFERENCES bd_registro_apontamento_aplicacao(id) 
ON DELETE CASCADE;

-- FASE 2: Limpar Dados Existentes

-- Deletar registros da tabela principal (os relacionados serão automaticamente excluídos)
DELETE FROM bd_registro_apontamento_aplicacao;

-- Limpar também a tabela de detalhes (caso algum registro órfão tenha sobrado)
DELETE FROM bd_registro_aplicacao_detalhes;

-- FASE 3: Validação - Verificar se as tabelas estão limpas
-- Esta parte será validada após a execução