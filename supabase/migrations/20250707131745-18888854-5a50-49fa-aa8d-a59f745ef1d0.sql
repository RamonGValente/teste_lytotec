-- Criar permissões faltantes para os relatórios
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES 
('relatorio_aplicacao_view', 'Visualizar Relatório de Aplicação Diária', '/relatorio-aplicacao-diaria'),
('gestao_maquinas_relatorio_medicao_view', 'Visualizar Relatório de Medição', '/gestao-maquinas/relatorio-medicao')
ON CONFLICT (nome_permissao) DO NOTHING;

-- Verificar se existem outras permissões necessárias para completar o sistema
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES 
('dashboard_cbuq_view', 'Visualizar Dashboard CBUQ', '/dashboard-cbuq')
ON CONFLICT (nome_permissao) DO NOTHING;