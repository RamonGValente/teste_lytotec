-- Remover políticas RLS temporárias e desabilitar RLS para facilitar desenvolvimento

-- Remover políticas temporárias das tabelas principais
DROP POLICY IF EXISTS "Allow all access to equipes during development" ON bd_equipes;
DROP POLICY IF EXISTS "Allow all access to funcionarios during development" ON bd_funcionarios;
DROP POLICY IF EXISTS "Allow all access to caminhoes_equipamentos during development" ON bd_caminhoes_equipamentos;
DROP POLICY IF EXISTS "Allow all access to usinas during development" ON bd_usinas;
DROP POLICY IF EXISTS "Allow all access to requisicoes during development" ON bd_requisicoes;
DROP POLICY IF EXISTS "Allow all access to centros_custo during development" ON bd_centros_custo;
DROP POLICY IF EXISTS "Allow all access to programacao_entrega during development" ON bd_programacao_entrega;
DROP POLICY IF EXISTS "Allow all access to lista_programacao_entrega during developmen" ON bd_lista_programacao_entrega;
DROP POLICY IF EXISTS "Allow all access to ruas_requisicao during development" ON bd_ruas_requisicao;

-- Desabilitar RLS nas tabelas de desenvolvimento para eliminar overhead
ALTER TABLE bd_equipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_funcionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_caminhoes_equipamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_usinas DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_requisicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_programacao_entrega DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_lista_programacao_entrega DISABLE ROW LEVEL SECURITY;
ALTER TABLE bd_ruas_requisicao DISABLE ROW LEVEL SECURITY;

-- Remover também a política restritiva de inspeção temporariamente para desenvolvimento
DROP POLICY IF EXISTS "Users can manage their own inspection records" ON bd_registro_apontamento_inspecao;
ALTER TABLE bd_registro_apontamento_inspecao DISABLE ROW LEVEL SECURITY;

-- Comentário para documentação
COMMENT ON TABLE bd_equipes IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_funcionarios IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_caminhoes_equipamentos IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_usinas IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_requisicoes IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_centros_custo IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_programacao_entrega IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_lista_programacao_entrega IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_ruas_requisicao IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';
COMMENT ON TABLE bd_registro_apontamento_inspecao IS 'RLS desabilitado temporariamente - reativar na fase de produção com políticas adequadas';