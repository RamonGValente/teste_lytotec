-- Adicionar campo carga_origem_id à tabela bd_registro_apontamento_aplicacao
ALTER TABLE bd_registro_apontamento_aplicacao 
ADD COLUMN carga_origem_id uuid REFERENCES bd_registro_cargas(id);

-- Comentário explicativo do campo
COMMENT ON COLUMN bd_registro_apontamento_aplicacao.carga_origem_id IS 'Referência para a carga de origem em aplicações múltiplas';