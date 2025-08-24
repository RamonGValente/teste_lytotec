
-- =============================================
-- MIGRAÇÃO COMPLETA: ESTRUTURA DE BANCO DE DADOS
-- Implementação completa do sistema sem RLS para testes
-- =============================================

-- =============================================
-- 1. TABELAS DE CONFIGURAÇÃO BASE
-- =============================================

-- Limpar e recriar tabela de empresas
DROP TABLE IF EXISTS bd_empresas CASCADE;
CREATE TABLE bd_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de departamentos
DROP TABLE IF EXISTS bd_departamentos CASCADE;
CREATE TABLE bd_departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_departamento TEXT NOT NULL,
    empresa_id UUID REFERENCES bd_empresas(id),
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de centros de custo
DROP TABLE IF EXISTS bd_centros_custo CASCADE;
CREATE TABLE bd_centros_custo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_centro_custo TEXT NOT NULL,
    codigo_centro_custo TEXT NOT NULL UNIQUE,
    cnpj_vinculado TEXT,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de funções
DROP TABLE IF EXISTS bd_funcoes CASCADE;
CREATE TABLE bd_funcoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_funcao TEXT NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de usinas
DROP TABLE IF EXISTS bd_usinas CASCADE;
CREATE TABLE bd_usinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_usina TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. GESTÃO DE RECURSOS HUMANOS
-- =============================================

-- Limpar e recriar tabela de funcionários
DROP TABLE IF EXISTS bd_funcionarios CASCADE;
CREATE TABLE bd_funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE,
    data_nascimento DATE,
    genero TEXT,
    email TEXT,
    endereco_completo TEXT,
    empresa_id UUID REFERENCES bd_empresas(id),
    departamento_id UUID REFERENCES bd_departamentos(id),
    funcao_id UUID REFERENCES bd_funcoes(id),
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    equipe_id UUID,
    data_admissao DATE,
    data_demissao DATE,
    status TEXT DEFAULT 'Ativo',
    salario_base NUMERIC,
    -- Benefícios
    diarias NUMERIC,
    refeicao NUMERIC,
    custo_passagem NUMERIC,
    adicional_noturno NUMERIC,
    gratificacao NUMERIC,
    periculosidade NUMERIC,
    insalubridade NUMERIC,
    data_ferias DATE,
    escolaridade TEXT,
    imagem TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de equipes
DROP TABLE IF EXISTS bd_equipes CASCADE;
CREATE TABLE bd_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_equipe TEXT NOT NULL,
    encarregado_id UUID REFERENCES bd_funcionarios(id),
    apontador_id UUID REFERENCES bd_funcionarios(id),
    equipe UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar foreign key para equipe_id após criar bd_equipes
ALTER TABLE bd_funcionarios ADD CONSTRAINT fk_funcionarios_equipe 
FOREIGN KEY (equipe_id) REFERENCES bd_equipes(id);

-- Limpar e recriar tabela de apontamentos de equipe
DROP TABLE IF EXISTS bd_apontamento_equipe CASCADE;
CREATE TABLE bd_apontamento_equipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID NOT NULL REFERENCES bd_equipes(id),
    colaborador_id UUID REFERENCES bd_funcionarios(id),
    nome_colaborador TEXT NOT NULL,
    data_registro DATE NOT NULL,
    presente BOOLEAN DEFAULT false,
    hora_inicio TIME,
    hora_fim TIME,
    lista_entrega_id UUID,
    registrado_por UUID REFERENCES bd_funcionarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de avaliações de equipe
DROP TABLE IF EXISTS bd_avaliacao_equipe CASCADE;
CREATE TABLE bd_avaliacao_equipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID NOT NULL REFERENCES bd_equipes(id),
    colaborador_id UUID REFERENCES bd_funcionarios(id),
    data_avaliacao DATE NOT NULL,
    avaliador_id UUID REFERENCES bd_funcionarios(id),
    pontuacao NUMERIC,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. GESTÃO DE MÁQUINAS E EQUIPAMENTOS
-- =============================================

-- Limpar e recriar tabela de veículos e equipamentos
DROP TABLE IF EXISTS bd_caminhoes_equipamentos CASCADE;
CREATE TABLE bd_caminhoes_equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frota TEXT,
    numero_frota TEXT,
    placa TEXT,
    tipo_veiculo TEXT,
    marca TEXT,
    modelo TEXT,
    ano_fabricacao TEXT,
    motor TEXT,
    cor TEXT,
    tipo_combustivel TEXT,
    capacidade TEXT,
    aluguel NUMERIC,
    situacao TEXT DEFAULT 'Disponível',
    status_ipva TEXT,
    empresa_id UUID REFERENCES bd_empresas(id),
    departamento_id UUID REFERENCES bd_departamentos(id),
    imagem_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de apontamentos de veículos
DROP TABLE IF EXISTS bd_registro_apontamento_cam_equipa CASCADE;
CREATE TABLE bd_registro_apontamento_cam_equipa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caminhao_equipamento_id UUID REFERENCES bd_caminhoes_equipamentos(id),
    operador_id UUID REFERENCES bd_funcionarios(id),
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    data DATE DEFAULT CURRENT_DATE,
    hora_inicial TIME,
    hora_final TIME,
    horimetro_inicial NUMERIC,
    horimetro_final NUMERIC,
    situacao TEXT,
    abastecimento NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. SISTEMA DE ORDENS DE SERVIÇO
-- =============================================

-- Limpar e recriar tabela de chamados
DROP TABLE IF EXISTS bd_chamados_os CASCADE;
CREATE TABLE bd_chamados_os (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_chamado TEXT NOT NULL UNIQUE,
    caminhao_equipamento_id UUID REFERENCES bd_caminhoes_equipamentos(id),
    solicitante_id UUID REFERENCES bd_funcionarios(id),
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_solicitacao TIME NOT NULL DEFAULT CURRENT_TIME,
    tipo_falha TEXT,
    descricao_problema TEXT,
    prioridade TEXT DEFAULT 'Média',
    status TEXT DEFAULT 'Aberto',
    fotos_avarias TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de ordens de serviço
DROP TABLE IF EXISTS bd_ordens_servico CASCADE;
CREATE TABLE bd_ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID REFERENCES bd_chamados_os(id),
    numero_os TEXT NOT NULL UNIQUE,
    tecnico_responsavel_id UUID REFERENCES bd_funcionarios(id),
    data_inicio DATE,
    data_conclusao DATE,
    servicos_executados TEXT,
    pecas_utilizadas TEXT,
    valor_total NUMERIC,
    status TEXT DEFAULT 'Em Andamento',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 5. LOGÍSTICA E OPERAÇÕES
-- =============================================

-- Limpar e recriar tabela de requisições
DROP TABLE IF EXISTS bd_requisicoes CASCADE;
CREATE TABLE bd_requisicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero TEXT NOT NULL UNIQUE,
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    engenheiro_id UUID REFERENCES bd_funcionarios(id),
    data_requisicao DATE NOT NULL DEFAULT CURRENT_DATE,
    diretoria TEXT,
    gerencia TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de ruas da requisição
DROP TABLE IF EXISTS bd_ruas_requisicao CASCADE;
CREATE TABLE bd_ruas_requisicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisicao_id UUID REFERENCES bd_requisicoes(id),
    logradouro TEXT NOT NULL,
    bairro TEXT,
    comprimento NUMERIC NOT NULL,
    largura NUMERIC NOT NULL,
    espessura NUMERIC NOT NULL,
    area NUMERIC,
    volume NUMERIC,
    traco TEXT NOT NULL,
    pintura_ligacao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de programação de entrega
DROP TABLE IF EXISTS bd_programacao_entrega CASCADE;
CREATE TABLE bd_programacao_entrega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_programacao DATE NOT NULL,
    responsavel_id UUID REFERENCES bd_funcionarios(id),
    status TEXT DEFAULT 'Ativa',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de lista de programação de entrega
DROP TABLE IF EXISTS bd_lista_programacao_entrega CASCADE;
CREATE TABLE bd_lista_programacao_entrega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    programacao_entrega_id UUID REFERENCES bd_programacao_entrega(id),
    requisicao_id UUID NOT NULL REFERENCES bd_requisicoes(id),
    caminhao_id UUID NOT NULL REFERENCES bd_caminhoes_equipamentos(id),
    equipe_id UUID NOT NULL REFERENCES bd_equipes(id),
    apontador_id UUID NOT NULL REFERENCES bd_funcionarios(id),
    usina_id UUID NOT NULL REFERENCES bd_usinas(id),
    data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade_massa NUMERIC NOT NULL,
    logradouro TEXT NOT NULL,
    tipo_lancamento TEXT NOT NULL DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Ativa',
    programacao_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar foreign key para lista_entrega_id onde necessário
ALTER TABLE bd_apontamento_equipe ADD CONSTRAINT fk_apontamento_lista_entrega 
FOREIGN KEY (lista_entrega_id) REFERENCES bd_lista_programacao_entrega(id);

-- Limpar e recriar tabela de registro de cargas
DROP TABLE IF EXISTS bd_registro_cargas CASCADE;
CREATE TABLE bd_registro_cargas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_entrega_id UUID NOT NULL REFERENCES bd_lista_programacao_entrega(id),
    programacao_id UUID NOT NULL,
    data_saida DATE NOT NULL,
    hora_saida TIME NOT NULL,
    temperatura_saida NUMERIC,
    tonelada_saida NUMERIC NOT NULL,
    tonelada_retorno NUMERIC,
    tonelada_real NUMERIC,
    status_registro TEXT DEFAULT 'Ativo',
    imagem_ticket_saida TEXT NOT NULL,
    imagem_ticket_retorno TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 6. APLICAÇÃO DE ASFALTO
-- =============================================

-- Limpar e recriar tabela de registros de aplicação
DROP TABLE IF EXISTS bd_registro_apontamento_aplicacao CASCADE;
CREATE TABLE bd_registro_apontamento_aplicacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_entrega_id UUID REFERENCES bd_lista_programacao_entrega(id),
    registro_carga_id UUID REFERENCES bd_registro_cargas(id),
    data_aplicacao DATE NOT NULL,
    hora_chegada_local TIME NOT NULL,
    temperatura_chegada NUMERIC,
    hora_aplicacao TIME,
    temperatura_aplicacao NUMERIC,
    -- Dimensões da aplicação
    estaca_inicial NUMERIC,
    estaca_final NUMERIC,
    comprimento NUMERIC,
    largura_media NUMERIC,
    area NUMERIC,
    -- Massa e espessura
    tonelada_aplicada NUMERIC,
    espessura NUMERIC,
    espessura_calculada NUMERIC,
    hora_saida_caminhao TIME,
    -- Controle de aplicação
    aplicacao_numero INTEGER DEFAULT 1,
    aplicacao_sequencia INTEGER DEFAULT 1,
    status_aplicacao TEXT DEFAULT 'Em Andamento',
    carga_finalizada BOOLEAN DEFAULT false,
    percentual_aplicado NUMERIC DEFAULT 0,
    -- Outros campos
    logradouro_aplicado TEXT,
    logradouro_id UUID,
    bordo TEXT,
    observacoes_gerais TEXT,
    anotacoes_apontador TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de detalhes de aplicação
DROP TABLE IF EXISTS bd_registro_aplicacao_detalhes CASCADE;
CREATE TABLE bd_registro_aplicacao_detalhes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_aplicacao_id UUID NOT NULL REFERENCES bd_registro_apontamento_aplicacao(id),
    lista_entrega_id UUID NOT NULL REFERENCES bd_lista_programacao_entrega(id),
    registro_carga_id UUID NOT NULL REFERENCES bd_registro_cargas(id),
    sequencia_aplicacao INTEGER NOT NULL DEFAULT 1,
    data_aplicacao DATE NOT NULL DEFAULT CURRENT_DATE,
    logradouro_id UUID,
    logradouro_nome TEXT NOT NULL,
    -- Dimensões específicas
    estaca_inicial NUMERIC,
    estaca_final NUMERIC,
    comprimento NUMERIC,
    largura_media NUMERIC,
    area_aplicada NUMERIC NOT NULL,
    tonelada_aplicada NUMERIC NOT NULL,
    espessura_aplicada NUMERIC,
    espessura_calculada NUMERIC,
    -- Detalhes técnicos
    temperatura_aplicacao NUMERIC,
    hora_inicio_aplicacao TIME,
    hora_fim_aplicacao TIME,
    equipamento_compactacao TEXT,
    numero_passadas INTEGER,
    densidade_compactacao NUMERIC,
    condicoes_climaticas TEXT,
    bordo TEXT,
    fotos_aplicacao TEXT[],
    observacoes_aplicacao TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 7. SISTEMA DE PERMISSÕES
-- =============================================

-- Limpar e recriar tabela de permissões
DROP TABLE IF EXISTS bd_permissoes CASCADE;
CREATE TABLE bd_permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_permissao TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    rota TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Limpar e recriar tabela de funções com permissões
DROP TABLE IF EXISTS bd_funcoes_permissao CASCADE;
CREATE TABLE bd_funcoes_permissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_funcao TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    permissoes UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Atualizar tabela profiles para usar o novo sistema
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nome_completo TEXT,
    funcao_permissao UUID REFERENCES bd_funcoes_permissao(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 8. TRIGGERS PARA CÁLCULOS AUTOMÁTICOS
-- =============================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function para calcular área e volume em ruas
CREATE OR REPLACE FUNCTION calculate_rua_area()
RETURNS TRIGGER AS $$
BEGIN
    NEW.area = NEW.comprimento * NEW.largura;
    NEW.volume = NEW.area * NEW.espessura * 2.4;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function para calcular tonelada real
CREATE OR REPLACE FUNCTION calculate_tonelada_real()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tonelada_saida IS NOT NULL AND NEW.tonelada_retorno IS NOT NULL THEN
        NEW.tonelada_real = NEW.tonelada_saida - NEW.tonelada_retorno;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function para calcular área na aplicação
CREATE OR REPLACE FUNCTION calculate_aplicacao_area()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.comprimento IS NOT NULL AND NEW.largura_media IS NOT NULL THEN
        NEW.area = NEW.comprimento * NEW.largura_media;
    END IF;
    
    -- Calcular espessura se temos tonelada e área
    IF NEW.tonelada_aplicada IS NOT NULL AND NEW.area IS NOT NULL AND NEW.area > 0 THEN
        NEW.espessura_calculada = (NEW.tonelada_aplicada / NEW.area) / 2.4 * 100; -- em cm
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers de updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON bd_empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON bd_funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON bd_caminhoes_equipamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON bd_equipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar triggers de cálculos
CREATE TRIGGER calculate_rua_values BEFORE INSERT OR UPDATE ON bd_ruas_requisicao FOR EACH ROW EXECUTE FUNCTION calculate_rua_area();
CREATE TRIGGER calculate_carga_real BEFORE INSERT OR UPDATE ON bd_registro_cargas FOR EACH ROW EXECUTE FUNCTION calculate_tonelada_real();
CREATE TRIGGER calculate_aplicacao_values BEFORE INSERT OR UPDATE ON bd_registro_apontamento_aplicacao FOR EACH ROW EXECUTE FUNCTION calculate_aplicacao_area();
CREATE TRIGGER calculate_detalhes_values BEFORE INSERT OR UPDATE ON bd_registro_aplicacao_detalhes FOR EACH ROW EXECUTE FUNCTION calculate_aplicacao_area();

-- =============================================
-- 9. VIEWS ESPECIALIZADAS
-- =============================================

-- View para entregas com massa remanescente
CREATE OR REPLACE VIEW vw_entregas_com_massa_remanescente AS
SELECT 
    le.*,
    COALESCE(rc.massa_total_carga, 0) as massa_total_carga,
    COALESCE(aa.massa_aplicada_total, 0) as massa_aplicada_total,
    COALESCE(rc.massa_total_carga, 0) - COALESCE(aa.massa_aplicada_total, 0) as massa_remanescente,
    CASE 
        WHEN COALESCE(rc.massa_total_carga, 0) > 0 THEN 
            (COALESCE(aa.massa_aplicada_total, 0) / rc.massa_total_carga) * 100
        ELSE 0
    END as percentual_aplicado
FROM bd_lista_programacao_entrega le
LEFT JOIN (
    SELECT 
        lista_entrega_id,
        SUM(tonelada_real) as massa_total_carga
    FROM bd_registro_cargas 
    WHERE status_registro = 'Ativo'
    GROUP BY lista_entrega_id
) rc ON le.id = rc.lista_entrega_id
LEFT JOIN (
    SELECT 
        lista_entrega_id,
        SUM(tonelada_aplicada) as massa_aplicada_total
    FROM bd_registro_apontamento_aplicacao
    WHERE tonelada_aplicada IS NOT NULL
    GROUP BY lista_entrega_id
) aa ON le.id = aa.lista_entrega_id;

-- View completa dos registros de aplicação
CREATE OR REPLACE VIEW vw_registro_aplicacao_completo AS
SELECT 
    raa.*,
    le.logradouro,
    le.tipo_lancamento,
    le.quantidade_massa,
    le.status as status_entrega,
    emr.massa_total_carga,
    emr.massa_aplicada_total as total_aplicado,
    emr.massa_remanescente,
    emr.percentual_aplicado,
    -- Dados relacionados
    eq.nome_equipe,
    ce.placa as placa_caminhao,
    ce.modelo as modelo_caminhao,
    us.nome_usina,
    cc.nome_centro_custo,
    req.numero as numero_requisicao
FROM bd_registro_apontamento_aplicacao raa
LEFT JOIN bd_lista_programacao_entrega le ON raa.lista_entrega_id = le.id
LEFT JOIN vw_entregas_com_massa_remanescente emr ON raa.lista_entrega_id = emr.id
LEFT JOIN bd_equipes eq ON le.equipe_id = eq.id
LEFT JOIN bd_caminhoes_equipamentos ce ON le.caminhao_id = ce.id
LEFT JOIN bd_usinas us ON le.usina_id = us.id
LEFT JOIN bd_requisicoes req ON le.requisicao_id = req.id
LEFT JOIN bd_centros_custo cc ON req.centro_custo_id = cc.id;

-- =============================================
-- 10. ÍNDICES DE PERFORMANCE
-- =============================================

-- Índices para apontamentos (muito utilizados em relatórios)
CREATE INDEX idx_apontamento_cam_equipa_data ON bd_registro_apontamento_cam_equipa(data);
CREATE INDEX idx_apontamento_cam_equipa_veiculo_data ON bd_registro_apontamento_cam_equipa(caminhao_equipamento_id, data);
CREATE INDEX idx_apontamento_cam_equipa_situacao ON bd_registro_apontamento_cam_equipa(situacao);
CREATE INDEX idx_apontamento_cam_equipa_centro_custo ON bd_registro_apontamento_cam_equipa(centro_custo_id);

-- Índices para aplicação
CREATE INDEX idx_aplicacao_lista_entrega ON bd_registro_apontamento_aplicacao(lista_entrega_id);
CREATE INDEX idx_aplicacao_carga ON bd_registro_apontamento_aplicacao(registro_carga_id);
CREATE INDEX idx_aplicacao_data ON bd_registro_apontamento_aplicacao(data_aplicacao);
CREATE INDEX idx_aplicacao_status ON bd_registro_apontamento_aplicacao(status_aplicacao);

-- Índices para programação
CREATE INDEX idx_programacao_entrega_data ON bd_lista_programacao_entrega(data_entrega);
CREATE INDEX idx_programacao_entrega_status ON bd_lista_programacao_entrega(status);
CREATE INDEX idx_programacao_entrega_equipe ON bd_lista_programacao_entrega(equipe_id);
CREATE INDEX idx_programacao_entrega_caminhao ON bd_lista_programacao_entrega(caminhao_id);

-- Índices para cargas
CREATE INDEX idx_cargas_lista_entrega ON bd_registro_cargas(lista_entrega_id);
CREATE INDEX idx_cargas_data ON bd_registro_cargas(data_saida);
CREATE INDEX idx_cargas_status ON bd_registro_cargas(status_registro);

-- Índices para funcionários
CREATE INDEX idx_funcionarios_email ON bd_funcionarios(email);
CREATE INDEX idx_funcionarios_cpf ON bd_funcionarios(cpf);
CREATE INDEX idx_funcionarios_empresa ON bd_funcionarios(empresa_id);
CREATE INDEX idx_funcionarios_equipe ON bd_funcionarios(equipe_id);
CREATE INDEX idx_funcionarios_status ON bd_funcionarios(status);

-- Índices para veículos
CREATE INDEX idx_veiculos_placa ON bd_caminhoes_equipamentos(placa);
CREATE INDEX idx_veiculos_tipo ON bd_caminhoes_equipamentos(tipo_veiculo);
CREATE INDEX idx_veiculos_situacao ON bd_caminhoes_equipamentos(situacao);
CREATE INDEX idx_veiculos_empresa ON bd_caminhoes_equipamentos(empresa_id);

-- =============================================
-- 11. POPULAÇÃO INICIAL DAS PERMISSÕES
-- =============================================

-- Inserir as 24 permissões baseadas no menuStructure.ts
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES
-- Dashboard (4 permissões)
('dashboard_view', 'Visualizar Dashboard Principal', '/dashboard'),
('dashboard_rh_view', 'Visualizar Dashboard RH', '/dashboard-rh'),
('dashboard_maquinas_view', 'Visualizar Dashboard Máquinas', '/gestao-maquinas/dashboard'),
('dashboard_cbuq_view', 'Visualizar Dashboard CBUQ', '/dashboard-cbuq'),

-- Gestão RH (6 permissões)
('gestao_rh_empresas_view', 'Gerenciar Empresas', '/gestao-rh/empresas'),
('gestao_rh_departamentos_view', 'Gerenciar Departamentos', '/gestao-rh/departamentos'),
('gestao_rh_centros_custo_view', 'Gerenciar Centros de Custo', '/gestao-rh/centros-custo'),
('gestao_rh_funcoes_view', 'Gerenciar Funções', '/gestao-rh/funcoes'),
('gestao_rh_funcionarios_view', 'Gerenciar Funcionários', '/gestao-rh/funcionarios'),
('gestao_rh_equipes_view', 'Gerenciar Equipes', '/gestao-rh/equipes'),

-- Gestão Máquinas (3 permissões)
('gestao_maquinas_caminhoes_view', 'Gerenciar Caminhões', '/gestao-maquinas/caminhoes'),
('gestao_maquinas_usinas_view', 'Gerenciar Usinas', '/gestao-maquinas/usinas'),
('gestao_maquinas_relatorio_medicao_view', 'Visualizar Relatório de Medição', '/gestao-maquinas/relatorio-medicao'),

-- Requisições (9 permissões)
('requisicoes_cadastro_view', 'Cadastro de Requisições', '/requisicoes/cadastro'),
('requisicoes_programacao_view', 'Programação de Entregas', '/requisicoes/programacao-entrega'),
('requisicoes_aplicacao_view', 'Registro de Aplicação', '/requisicoes/registro-aplicacao'),
('requisicoes_cargas_view', 'Registro de Cargas', '/requisicoes/registro-cargas'),
('requisicoes_apontamentos_view', 'Apontamento de Equipe', '/requisicoes/apontamento-equipe'),
('requisicoes_chamados_view', 'Chamados OS', '/requisicoes/chamados-os'),
('requisicoes_gestao_os_view', 'Gestão de OS', '/requisicoes/gestao-os'),
('requisicoes_relatorio_view', 'Relatório de Aplicação', '/relatorio-aplicacao-diaria'),
('apontamento_caminhoes_view', 'Apontamento de Caminhões', '/apontamento-caminhoes'),

-- Administração (1 permissão)
('admin_permissoes_view', 'Gerenciar Permissões', '/admin/permissoes');

-- Criar as 8 funções com suas respectivas permissões
INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes) VALUES
-- SuperAdm - Todas as permissões
('SuperAdm', 'Super Administrador com acesso total', 
 (SELECT ARRAY_AGG(id) FROM bd_permissoes)),

-- AdmRH - Dashboard + RH
('AdmRH', 'Administrador de Recursos Humanos',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'dashboard_rh_view',
   'gestao_rh_empresas_view', 'gestao_rh_departamentos_view', 
   'gestao_rh_centros_custo_view', 'gestao_rh_funcoes_view', 
   'gestao_rh_funcionarios_view', 'gestao_rh_equipes_view'
 ))),

-- AdmEquipamentos - Dashboard + Máquinas
('AdmEquipamentos', 'Administrador de Equipamentos',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'dashboard_maquinas_view',
   'gestao_maquinas_caminhoes_view', 'gestao_maquinas_usinas_view', 
   'gestao_maquinas_relatorio_medicao_view'
 ))),

-- AdmLogistica - Dashboard + Requisições
('AdmLogistica', 'Administrador de Logística',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'requisicoes_cadastro_view', 'requisicoes_programacao_view',
   'requisicoes_aplicacao_view', 'requisicoes_cargas_view', 'requisicoes_apontamentos_view',
   'requisicoes_chamados_view', 'requisicoes_gestao_os_view', 'requisicoes_relatorio_view',
   'apontamento_caminhoes_view'
 ))),

-- Encarregado - Dashboard + Operacionais específicas
('Encarregado', 'Encarregado de Obra',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'requisicoes_apontamentos_view', 
   'gestao_maquinas_relatorio_medicao_view', 'requisicoes_programacao_view'
 ))),

-- Apontador - Dashboard + Registros operacionais
('Apontador', 'Apontador de Obra',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'requisicoes_aplicacao_view', 'requisicoes_programacao_view'
 ))),

-- Motorista - Dashboard + Veículos + Histórico próprio
('Motorista', 'Motorista',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'apontamento_caminhoes_view'
 ))),

-- Operador - Dashboard + Máquinas + Dados próprios
('Operador', 'Operador de Máquinas',
 (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN (
   'dashboard_view', 'requisicoes_aplicacao_view'
 )));

-- =============================================
-- 12. FUNÇÕES AUXILIARES
-- =============================================

-- Função para verificar se usuário é SuperAdmin
CREATE OR REPLACE FUNCTION public.check_is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = user_id 
    AND fp.nome_funcao = 'SuperAdm'
  );
$function$;

-- Função para obter função do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(fp.nome_funcao, 'user')
  FROM profiles p
  LEFT JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
  WHERE p.id = auth.uid();
$function$;

-- Função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    JOIN bd_permissoes perm ON perm.id = ANY(fp.permissoes)
    WHERE p.id = user_id 
    AND perm.nome_permissao = permission_name
  );
$function$;

-- =============================================
-- FINALIZAÇÃO
-- =============================================

-- Criar usuário SuperAdmin padrão (será atualizado depois)
INSERT INTO bd_funcoes (nome_funcao, descricao) VALUES
('SuperAdm', 'Super Administrador'),
('AdmRH', 'Administrador RH'),
('AdmEquipamentos', 'Administrador Equipamentos'),
('AdmLogistica', 'Administrador Logística'),
('Encarregado', 'Encarregado de Obra'),
('Apontador', 'Apontador'),
('Motorista', 'Motorista'),
('Operador', 'Operador')
ON CONFLICT (nome_funcao) DO NOTHING;

-- Inserir dados base de exemplo
INSERT INTO bd_empresas (nome_empresa, cnpj) VALUES 
('Empresa Principal', '12.345.678/0001-90')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO bd_departamentos (nome_departamento, empresa_id) 
SELECT 'Operacional', id FROM bd_empresas WHERE cnpj = '12.345.678/0001-90'
ON CONFLICT DO NOTHING;

INSERT INTO bd_centros_custo (nome_centro_custo, codigo_centro_custo) VALUES
('Centro Padrão', 'CC001')
ON CONFLICT (codigo_centro_custo) DO NOTHING;

INSERT INTO bd_usinas (nome_usina, endereco) VALUES
('Usina Principal', 'Endereço da Usina')
ON CONFLICT DO NOTHING;

-- Comentário final
COMMENT ON SCHEMA public IS 'Estrutura completa de banco de dados implementada - versão sem RLS para testes';

-- Log da migração
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) VALUES
('migration_log', 'Log da migração completa', '/system/migration')
ON CONFLICT (nome_permissao) DO NOTHING;
