-- Habilitar RLS e criar políticas básicas para tabelas essenciais dos dropdowns (nomes corretos)

-- Habilitar RLS nas tabelas principais
ALTER TABLE bd_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_caminhoes_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_usinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_lista_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_ruas_requisicao ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas temporárias para desenvolvimento
-- bd_equipes
CREATE POLICY "Allow all access to equipes during development" ON bd_equipes FOR ALL USING (true) WITH CHECK (true);

-- bd_funcionarios  
CREATE POLICY "Allow all access to funcionarios during development" ON bd_funcionarios FOR ALL USING (true) WITH CHECK (true);

-- bd_caminhoes_equipamentos
CREATE POLICY "Allow all access to caminhoes_equipamentos during development" ON bd_caminhoes_equipamentos FOR ALL USING (true) WITH CHECK (true);

-- bd_usinas
CREATE POLICY "Allow all access to usinas during development" ON bd_usinas FOR ALL USING (true) WITH CHECK (true);

-- bd_requisicoes
CREATE POLICY "Allow all access to requisicoes during development" ON bd_requisicoes FOR ALL USING (true) WITH CHECK (true);

-- bd_centros_custo
CREATE POLICY "Allow all access to centros_custo during development" ON bd_centros_custo FOR ALL USING (true) WITH CHECK (true);

-- bd_programacao_entrega
CREATE POLICY "Allow all access to programacao_entrega during development" ON bd_programacao_entrega FOR ALL USING (true) WITH CHECK (true);

-- bd_lista_programacao_entrega
CREATE POLICY "Allow all access to lista_programacao_entrega during development" ON bd_lista_programacao_entrega FOR ALL USING (true) WITH CHECK (true);

-- bd_ruas_requisicao
CREATE POLICY "Allow all access to ruas_requisicao during development" ON bd_ruas_requisicao FOR ALL USING (true) WITH CHECK (true);