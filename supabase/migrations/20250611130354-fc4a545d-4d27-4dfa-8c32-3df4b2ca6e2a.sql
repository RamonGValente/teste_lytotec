
-- Etapa 1: Limpar permissões existentes e criar permissões padronizadas
DELETE FROM bd_permissoes;

-- Inserir permissões organizadas por módulo
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES
-- Dashboard
('dashboard_view', 'Visualizar dashboard principal', '/dashboard'),
('dashboard_rh_view', 'Visualizar dashboard de RH', '/gestao-rh/dashboard'),

-- Gestão de RH
('gestao_rh_empresas_view', 'Visualizar cadastro de empresas', '/gestao-rh/empresas'),
('gestao_rh_departamentos_view', 'Visualizar cadastro de departamentos', '/gestao-rh/departamentos'),
('gestao_rh_centros_custo_view', 'Visualizar cadastro de centros de custo', '/gestao-rh/centros-custo'),
('gestao_rh_funcoes_view', 'Visualizar cadastro de funções', '/gestao-rh/funcoes'),
('gestao_rh_funcionarios_view', 'Visualizar gestão de funcionários', '/gestao-rh/funcionarios'),
('gestao_rh_equipes_view', 'Visualizar cadastro de equipes', '/gestao-rh/equipes'),

-- Gestão de Máquinas/Equipamentos
('gestao_maquinas_caminhoes_view', 'Visualizar cadastro de caminhões e equipamentos', '/gestao-maquinas/caminhoes-equipamentos'),
('gestao_maquinas_usinas_view', 'Visualizar cadastro de usinas', '/gestao-maquinas/usinas'),
('gestao_maquinas_relatorio_medicao_view', 'Visualizar relatório de medição', '/gestao-maquinas/relatorio-medicao'),

-- Requisições e Logística
('requisicoes_cadastro_view', 'Visualizar cadastro de requisições', '/requisicoes/cadastro'),
('requisicoes_programacao_entrega_view', 'Visualizar programação de entrega', '/requisicoes/programacao-entrega'),
('requisicoes_registro_cargas_view', 'Visualizar registro de cargas', '/requisicoes/registro-cargas'),
('requisicoes_registro_aplicacao_view', 'Visualizar registro de aplicação', '/requisicoes/registro-aplicacao'),
('requisicoes_apontamento_equipe_view', 'Visualizar apontamento de equipe', '/requisicoes/apontamento-equipe'),
('requisicoes_apontamento_caminhoes_view', 'Visualizar apontamento de caminhões', '/requisicoes/apontamento-caminhoes'),
('requisicoes_chamados_os_view', 'Visualizar chamados para OS', '/requisicoes/chamados-os'),
('requisicoes_gestao_os_view', 'Visualizar gestão de ordens de serviço', '/requisicoes/gestao-os'),

-- Administração
('admin_permissoes_view', 'Visualizar gestão de permissões', '/admin/permissoes');

-- Etapa 2: Limpar e criar funções de permissão padronizadas
DELETE FROM bd_funcoes_permissao;

-- Criar funções com permissões específicas
INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes) VALUES
-- SuperAdmin tem acesso a tudo
('SuperAdm', 'Super Administrador com acesso total', ARRAY(SELECT id FROM bd_permissoes)),

-- AdmRH - Apenas RH
('AdmRH', 'Administrador de Recursos Humanos', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'dashboard_rh_view',
    'gestao_rh_empresas_view',
    'gestao_rh_departamentos_view',
    'gestao_rh_centros_custo_view',
    'gestao_rh_funcoes_view',
    'gestao_rh_funcionarios_view',
    'gestao_rh_equipes_view'
  )
)),

-- AdmEquipamentos - Apenas Máquinas/Equipamentos
('AdmEquipamentos', 'Administrador de Equipamentos', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'gestao_maquinas_caminhoes_view',
    'gestao_maquinas_usinas_view',
    'gestao_maquinas_relatorio_medicao_view'
  )
)),

-- AdmLogistica - Apenas Requisições e Logística
('AdmLogistica', 'Administrador de Logística', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'requisicoes_cadastro_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_cargas_view',
    'requisicoes_registro_aplicacao_view',
    'requisicoes_apontamento_equipe_view',
    'requisicoes_apontamento_caminhoes_view',
    'requisicoes_chamados_os_view',
    'requisicoes_gestao_os_view'
  )
)),

-- AdmRequisicoes - Foco em requisições
('AdmRequisicoes', 'Administrador de Requisições', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'requisicoes_cadastro_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_cargas_view',
    'requisicoes_registro_aplicacao_view'
  )
)),

-- AdmAdmin - Apenas administração
('AdmAdmin', 'Administrador do Sistema', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'admin_permissoes_view'
  )
)),

-- Apontador - Apenas aplicação e programação
('Apontador', 'Apontador de Campo', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_aplicacao_view'
  )
)),

-- Encarregado - Apontamentos e relatórios específicos
('Encarregado', 'Encarregado de Obra', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_aplicacao_view',
    'requisicoes_apontamento_equipe_view',
    'gestao_maquinas_relatorio_medicao_view'
  )
)),

-- Engenheiro Civil - Requisições e registros técnicos
('Engenheiro Civil', 'Engenheiro Civil', ARRAY(
  SELECT id FROM bd_permissoes WHERE nome_permissao IN (
    'dashboard_view',
    'requisicoes_cadastro_view',
    'requisicoes_programacao_entrega_view',
    'requisicoes_registro_cargas_view',
    'requisicoes_registro_aplicacao_view'
  )
));

-- Etapa 3: Migrar usuários existentes para o novo sistema
-- Atualizar profiles para usar o novo sistema de permissões baseado em funcao_permissao
UPDATE profiles 
SET funcao_permissao = (
  SELECT id FROM bd_funcoes_permissao 
  WHERE nome_funcao = (
    CASE 
      WHEN 'SuperAdm' = ANY(funcoes) THEN 'SuperAdm'
      WHEN 'AdmRH' = ANY(funcoes) THEN 'AdmRH'
      WHEN 'AdmEquipamentos' = ANY(funcoes) THEN 'AdmEquipamentos'
      WHEN 'AdmLogistica' = ANY(funcoes) THEN 'AdmLogistica'
      WHEN 'AdmRequisicoes' = ANY(funcoes) THEN 'AdmRequisicoes'
      WHEN 'AdmAdmin' = ANY(funcoes) THEN 'AdmAdmin'
      WHEN 'Apontador' = ANY(funcoes) THEN 'Apontador'
      WHEN 'Encarregado' = ANY(funcoes) THEN 'Encarregado'
      WHEN 'Engenheiro Civil' = ANY(funcoes) THEN 'Engenheiro Civil'
      ELSE 'Apontador' -- Default para usuários sem função específica
    END
  )
)
WHERE funcao_permissao IS NULL AND funcoes IS NOT NULL;

-- Definir função padrão para usuários sem permissão
UPDATE profiles 
SET funcao_permissao = (SELECT id FROM bd_funcoes_permissao WHERE nome_funcao = 'Apontador' LIMIT 1)
WHERE funcao_permissao IS NULL;
