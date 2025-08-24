
-- 1. Criar permissões faltantes
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) 
VALUES 
  ('dashboard_cbuq_view', 'Visualizar Dashboard CBUQ', '/dashboard-cbuq'),
  ('requisicoes_programacao_entrega_view', 'Visualizar Programação de Entrega', '/programacao-entrega'),
  ('requisicoes_registro_aplicacao_view', 'Visualizar Registro de Aplicação', '/registro-aplicacao'),
  ('requisicoes_registro_cargas_view', 'Visualizar Registro de Cargas', '/requisicoes/registro-cargas')
ON CONFLICT (nome_permissao) DO NOTHING;

-- 2. Atualizar função "Apontador" para incluir Registro de Cargas
UPDATE bd_funcoes_permissao 
SET permissoes = permissoes || ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_cargas_view')
]::uuid[]
WHERE nome_funcao = 'Apontador'
AND NOT ((SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_cargas_view') = ANY(permissoes));

-- 3. Verificar e corrigir permissões para função "Encarregado" 
INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes)
SELECT 'Encarregado', 'Responsável por supervisionar equipes de trabalho', ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_rh_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_maquinas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'gestao_rh_equipes_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_apontamento_equipe_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_apontamento_caminhoes_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_cargas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_aplicacao_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_programacao_entrega_view')
]::uuid[]
WHERE NOT EXISTS (
  SELECT 1 FROM bd_funcoes_permissao WHERE nome_funcao = 'Encarregado'
);

-- 4. Verificar e corrigir permissões para função "Operador"
INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes)
SELECT 'Operador', 'Operador de equipamentos e veículos', ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_maquinas_view')
]::uuid[]
WHERE NOT EXISTS (
  SELECT 1 FROM bd_funcoes_permissao WHERE nome_funcao = 'Operador'
);

-- 5. Garantir que "Mestre de Obra" tem permissões completas
UPDATE bd_funcoes_permissao 
SET permissoes = ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_rh_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_maquinas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'gestao_rh_equipes_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_apontamento_equipe_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_apontamento_caminhoes_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_cargas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_aplicacao_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_programacao_entrega_view')
]::uuid[]
WHERE nome_funcao = 'Mestre de Obra';

-- 6. Atualizar função "Apontador" com permissões mais completas
UPDATE bd_funcoes_permissao 
SET permissoes = ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_cargas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_registro_aplicacao_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_programacao_entrega_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'requisicoes_apontamento_equipe_view')
]::uuid[]
WHERE nome_funcao = 'Apontador';
