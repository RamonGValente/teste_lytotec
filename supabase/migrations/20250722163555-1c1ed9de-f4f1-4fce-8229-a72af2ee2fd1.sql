-- =======================================================================================
-- COMPLETE DATABASE STRUCTURE MIGRATION
-- Version: 1.0.0
-- Description: Complete implementation of LYTO system database structure
-- =======================================================================================

-- =======================================================================================
-- 1. CONFIGURATION TABLES
-- =======================================================================================

-- Companies table
CREATE TABLE IF NOT EXISTS public.bd_empresas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cost Centers table
CREATE TABLE IF NOT EXISTS public.bd_centros_custo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_centro_custo TEXT NOT NULL,
    codigo_centro_custo TEXT NOT NULL UNIQUE,
    cnpj_vinculado TEXT,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.bd_departamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_departamento TEXT NOT NULL,
    codigo_departamento TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Functions/Roles table
CREATE TABLE IF NOT EXISTS public.bd_funcoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_funcao TEXT NOT NULL,
    descricao TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plants/Usinas table
CREATE TABLE IF NOT EXISTS public.bd_usinas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_usina TEXT NOT NULL,
    endereco TEXT,
    telefone TEXT,
    responsavel TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =======================================================================================
-- 2. HUMAN RESOURCES TABLES
-- =======================================================================================

-- Teams table
CREATE TABLE IF NOT EXISTS public.bd_equipes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_equipe TEXT NOT NULL,
    encarregado_id UUID,
    apontador_id UUID,
    equipe UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.bd_funcionarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    data_nascimento DATE,
    genero TEXT,
    email TEXT,
    endereco_completo TEXT,
    empresa_id UUID REFERENCES bd_empresas(id),
    departamento_id UUID REFERENCES bd_departamentos(id),
    funcao_id UUID REFERENCES bd_funcoes(id),
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    equipe_id UUID REFERENCES bd_equipes(id),
    data_admissao DATE,
    data_demissao DATE,
    status TEXT DEFAULT 'Ativo',
    salario_base NUMERIC,
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

-- Add foreign key constraints for teams after employees table exists
ALTER TABLE public.bd_equipes 
    ADD CONSTRAINT fk_equipes_encarregado 
    FOREIGN KEY (encarregado_id) REFERENCES bd_funcionarios(id);

ALTER TABLE public.bd_equipes 
    ADD CONSTRAINT fk_equipes_apontador 
    FOREIGN KEY (apontador_id) REFERENCES bd_funcionarios(id);

-- Team attendance table
CREATE TABLE IF NOT EXISTS public.bd_apontamento_equipe (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- =======================================================================================
-- 3. MACHINERY AND EQUIPMENT TABLES
-- =======================================================================================

-- Vehicles and Equipment table
CREATE TABLE IF NOT EXISTS public.bd_caminhoes_equipamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
    aluguel TEXT,
    situacao TEXT DEFAULT 'Ativo',
    status_ipva TEXT,
    empresa_id UUID REFERENCES bd_empresas(id),
    departamento_id UUID REFERENCES bd_departamentos(id),
    imagem_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicle/Equipment operational logs
CREATE TABLE IF NOT EXISTS public.bd_registro_apontamento_cam_equipa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- =======================================================================================
-- 4. SERVICE ORDER SYSTEM
-- =======================================================================================

-- Technical service calls
CREATE TABLE IF NOT EXISTS public.bd_chamados_os (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_chamado TEXT NOT NULL UNIQUE,
    caminhao_equipamento_id UUID REFERENCES bd_caminhoes_equipamentos(id),
    solicitante_id UUID REFERENCES bd_funcionarios(id),
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_solicitacao TIME NOT NULL DEFAULT CURRENT_TIME,
    tipo_falha TEXT,
    descricao_problema TEXT,
    prioridade TEXT,
    status TEXT DEFAULT 'Aberto',
    fotos_avarias TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service orders
CREATE TABLE IF NOT EXISTS public.bd_ordens_servico (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_os TEXT NOT NULL UNIQUE,
    chamado_id UUID REFERENCES bd_chamados_os(id),
    caminhao_equipamento_id UUID REFERENCES bd_caminhoes_equipamentos(id),
    tipo_servico TEXT,
    descricao_servico TEXT,
    data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
    data_previsao DATE,
    data_conclusao DATE,
    status TEXT DEFAULT 'Aberta',
    mecanico_id UUID REFERENCES bd_funcionarios(id),
    pecas_utilizadas JSONB,
    valor_servico NUMERIC,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =======================================================================================
-- 5. LOGISTICS AND OPERATIONS TABLES
-- =======================================================================================

-- Work requisitions
CREATE TABLE IF NOT EXISTS public.bd_requisicoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero TEXT NOT NULL UNIQUE,
    centro_custo_id UUID REFERENCES bd_centros_custo(id),
    engenheiro_id UUID REFERENCES bd_funcionarios(id),
    data_requisicao DATE NOT NULL DEFAULT CURRENT_DATE,
    diretoria TEXT,
    gerencia TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Streets/Roads in requisitions
CREATE TABLE IF NOT EXISTS public.bd_ruas_requisicao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Delivery programming
CREATE TABLE IF NOT EXISTS public.bd_programacao_entrega (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    data_programacao DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Ativa',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery schedule list
CREATE TABLE IF NOT EXISTS public.bd_lista_programacao_entrega (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    programacao_entrega_id UUID REFERENCES bd_programacao_entrega(id),
    requisicao_id UUID NOT NULL REFERENCES bd_requisicoes(id),
    caminhao_id UUID NOT NULL REFERENCES bd_caminhoes_equipamentos(id),
    equipe_id UUID NOT NULL REFERENCES bd_equipes(id),
    apontador_id UUID NOT NULL REFERENCES bd_funcionarios(id),
    usina_id UUID NOT NULL REFERENCES bd_usinas(id),
    data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade_massa NUMERIC NOT NULL,
    logradouro TEXT NOT NULL,
    tipo_lancamento TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Ativa',
    programacao_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Load registrations from plant
CREATE TABLE IF NOT EXISTS public.bd_registro_cargas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- =======================================================================================
-- 6. ASPHALT APPLICATION TABLES
-- =======================================================================================

-- Main application log
CREATE TABLE IF NOT EXISTS public.bd_registro_apontamento_aplicacao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lista_entrega_id UUID REFERENCES bd_lista_programacao_entrega(id),
    registro_carga_id UUID REFERENCES bd_registro_cargas(id),
    data_aplicacao DATE NOT NULL,
    hora_chegada_local TIME NOT NULL,
    temperatura_chegada NUMERIC,
    hora_aplicacao TIME,
    temperatura_aplicacao NUMERIC,
    estaca_inicial NUMERIC,
    estaca_final NUMERIC,
    comprimento NUMERIC,
    largura_media NUMERIC,
    area NUMERIC,
    tonelada_aplicada NUMERIC,
    espessura NUMERIC,
    espessura_calculada NUMERIC,
    hora_saida_caminhao TIME,
    aplicacao_numero INTEGER DEFAULT 1,
    aplicacao_sequencia INTEGER DEFAULT 1,
    status_aplicacao TEXT DEFAULT 'Em Andamento',
    carga_finalizada BOOLEAN DEFAULT false,
    percentual_aplicado NUMERIC DEFAULT 0,
    logradouro_aplicado TEXT,
    logradouro_id UUID,
    bordo TEXT,
    observacoes_gerais TEXT,
    anotacoes_apontador TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Application details
CREATE TABLE IF NOT EXISTS public.bd_registro_aplicacao_detalhes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    registro_aplicacao_id UUID NOT NULL REFERENCES bd_registro_apontamento_aplicacao(id),
    lista_entrega_id UUID NOT NULL REFERENCES bd_lista_programacao_entrega(id),
    registro_carga_id UUID NOT NULL REFERENCES bd_registro_cargas(id),
    sequencia_aplicacao INTEGER NOT NULL DEFAULT 1,
    data_aplicacao DATE NOT NULL DEFAULT CURRENT_DATE,
    logradouro_id UUID,
    logradouro_nome TEXT NOT NULL,
    estaca_inicial NUMERIC,
    estaca_final NUMERIC,
    comprimento NUMERIC,
    largura_media NUMERIC,
    area_aplicada NUMERIC NOT NULL,
    tonelada_aplicada NUMERIC NOT NULL,
    espessura_aplicada NUMERIC,
    espessura_calculada NUMERIC,
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

-- =======================================================================================
-- 7. PERMISSION SYSTEM TABLES
-- =======================================================================================

-- User profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL PRIMARY KEY,
    nome_completo TEXT,
    funcao_sistema TEXT DEFAULT 'Usuário',
    funcionario_id UUID REFERENCES bd_funcionarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- System permissions
CREATE TABLE IF NOT EXISTS public.bd_permissoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_permissao TEXT NOT NULL UNIQUE,
    descricao TEXT,
    modulo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- System functions and their permissions
CREATE TABLE IF NOT EXISTS public.bd_funcoes_permissao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_funcao TEXT NOT NULL UNIQUE,
    descricao TEXT,
    permissoes UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =======================================================================================
-- 8. AUTOMATIC CALCULATION FUNCTIONS
-- =======================================================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate area and volume in streets
CREATE OR REPLACE FUNCTION calculate_rua_values()
RETURNS TRIGGER AS $$
BEGIN
    NEW.area = NEW.comprimento * NEW.largura;
    NEW.volume = NEW.area * NEW.espessura * 2.4;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate real tonnage in load registrations
CREATE OR REPLACE FUNCTION calculate_tonelada_real()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tonelada_retorno IS NOT NULL THEN
        NEW.tonelada_real = NEW.tonelada_saida - NEW.tonelada_retorno;
    ELSE
        NEW.tonelada_real = NEW.tonelada_saida;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =======================================================================================
-- 9. TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =======================================================================================

-- Updated_at triggers for main tables
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON bd_empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_centros_custo_updated_at BEFORE UPDATE ON bd_centros_custo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON bd_funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON bd_equipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON bd_caminhoes_equipamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculation triggers
CREATE TRIGGER calculate_rua_values_trigger BEFORE INSERT OR UPDATE ON bd_ruas_requisicao FOR EACH ROW EXECUTE FUNCTION calculate_rua_values();
CREATE TRIGGER calculate_tonelada_real_trigger BEFORE INSERT OR UPDATE ON bd_registro_cargas FOR EACH ROW EXECUTE FUNCTION calculate_tonelada_real();

-- =======================================================================================
-- 10. SPECIALIZED VIEWS
-- =======================================================================================

-- View for deliveries with remaining mass
CREATE VIEW vw_entregas_com_massa_remanescente AS
SELECT 
    le.*,
    COALESCE(rc.massa_total_carga, 0) as massa_total_carga,
    COALESCE(aa.massa_aplicada_total, 0) as massa_aplicada_total,
    COALESCE(rc.massa_total_carga, 0) - COALESCE(aa.massa_aplicada_total, 0) as massa_remanescente
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
    GROUP BY lista_entrega_id
) aa ON le.id = aa.lista_entrega_id;

-- Complete application log view
CREATE VIEW vw_registro_aplicacao_completo AS
SELECT 
    raa.*,
    le.logradouro,
    le.tipo_lancamento,
    le.quantidade_massa,
    le.status as status_entrega,
    (
        SELECT SUM(area_aplicada) 
        FROM bd_registro_aplicacao_detalhes 
        WHERE registro_aplicacao_id = raa.id
    ) as area_total_aplicada,
    (
        SELECT COUNT(*) 
        FROM bd_registro_aplicacao_detalhes 
        WHERE registro_aplicacao_id = raa.id
    ) as numero_aplicacoes,
    CASE 
        WHEN emr.massa_total_carga > 0 AND (
            SELECT SUM(area_aplicada) 
            FROM bd_registro_aplicacao_detalhes 
            WHERE registro_aplicacao_id = raa.id
        ) > 0 THEN
            (emr.massa_total_carga / (
                SELECT SUM(area_aplicada) 
                FROM bd_registro_aplicacao_detalhes 
                WHERE registro_aplicacao_id = raa.id
            )) / 2.4
        ELSE NULL
    END as espessura_media_cm,
    CASE 
        WHEN raa.carga_finalizada = true THEN 'Finalizada'
        WHEN raa.status_aplicacao = 'Em Andamento' THEN 'Em Andamento'
        ELSE 'Pendente'
    END as status_calculado,
    emr.massa_total_carga,
    emr.massa_aplicada_total as total_aplicado,
    emr.massa_remanescente,
    CASE 
        WHEN emr.massa_total_carga > 0 THEN 
            (emr.massa_aplicada_total / emr.massa_total_carga) * 100
        ELSE 0
    END as percentual_aplicado
FROM bd_registro_apontamento_aplicacao raa
LEFT JOIN bd_lista_programacao_entrega le ON raa.lista_entrega_id = le.id
LEFT JOIN vw_entregas_com_massa_remanescente emr ON raa.lista_entrega_id = emr.id;

-- =======================================================================================
-- 11. PERFORMANCE INDEXES
-- =======================================================================================

-- Main operation indexes
CREATE INDEX IF NOT EXISTS idx_apontamento_cam_equipa_data ON bd_registro_apontamento_cam_equipa(data);
CREATE INDEX IF NOT EXISTS idx_apontamento_cam_equipa_veiculo_data ON bd_registro_apontamento_cam_equipa(caminhao_equipamento_id, data);
CREATE INDEX IF NOT EXISTS idx_apontamento_cam_equipa_situacao ON bd_registro_apontamento_cam_equipa(situacao);

-- Application indexes
CREATE INDEX IF NOT EXISTS idx_aplicacao_lista_entrega ON bd_registro_apontamento_aplicacao(lista_entrega_id);
CREATE INDEX IF NOT EXISTS idx_aplicacao_carga ON bd_registro_apontamento_aplicacao(registro_carga_id);
CREATE INDEX IF NOT EXISTS idx_aplicacao_data ON bd_registro_apontamento_aplicacao(data_aplicacao);

-- Delivery programming indexes
CREATE INDEX IF NOT EXISTS idx_programacao_entrega_data ON bd_lista_programacao_entrega(data_entrega);
CREATE INDEX IF NOT EXISTS idx_programacao_entrega_status ON bd_lista_programacao_entrega(status);

-- Employee and team indexes
CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON bd_funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_departamento ON bd_funcionarios(departamento_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_equipe ON bd_funcionarios(equipe_id);

-- Vehicle indexes
CREATE INDEX IF NOT EXISTS idx_veiculos_empresa ON bd_caminhoes_equipamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_departamento ON bd_caminhoes_equipamentos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_situacao ON bd_caminhoes_equipamentos(situacao);

-- =======================================================================================
-- 12. INITIAL DATA FOR PERMISSION SYSTEM
-- =======================================================================================

-- Insert base permissions (24 permissions from menuStructure.ts)
INSERT INTO bd_permissoes (nome_permissao, descricao, modulo) VALUES
    ('dashboard_view', 'Visualizar Dashboard', 'Dashboard'),
    ('funcionarios_view', 'Visualizar Funcionários', 'RH'),
    ('funcionarios_create', 'Criar Funcionários', 'RH'),
    ('funcionarios_edit', 'Editar Funcionários', 'RH'),
    ('funcionarios_delete', 'Excluir Funcionários', 'RH'),
    ('equipes_view', 'Visualizar Equipes', 'RH'),
    ('equipes_create', 'Criar Equipes', 'RH'),
    ('equipes_edit', 'Editar Equipes', 'RH'),
    ('equipes_delete', 'Excluir Equipes', 'RH'),
    ('veiculos_view', 'Visualizar Veículos', 'Frota'),
    ('veiculos_create', 'Criar Veículos', 'Frota'),
    ('veiculos_edit', 'Editar Veículos', 'Frota'),
    ('veiculos_delete', 'Excluir Veículos', 'Frota'),
    ('requisicoes_view', 'Visualizar Requisições', 'Logística'),
    ('requisicoes_create', 'Criar Requisições', 'Logística'),
    ('requisicoes_edit', 'Editar Requisições', 'Logística'),
    ('programacao_view', 'Visualizar Programação', 'Operações'),
    ('programacao_create', 'Criar Programação', 'Operações'),
    ('programacao_edit', 'Editar Programação', 'Operações'),
    ('aplicacao_view', 'Visualizar Aplicações', 'Operações'),
    ('aplicacao_create', 'Registrar Aplicações', 'Operações'),
    ('aplicacao_edit', 'Editar Aplicações', 'Operações'),
    ('chamados_view', 'Visualizar Chamados', 'Manutenção'),
    ('relatorios_view', 'Visualizar Relatórios', 'Relatórios')
ON CONFLICT (nome_permissao) DO NOTHING;

-- Get permission IDs for function creation
DO $$
DECLARE
    perm_ids UUID[];
BEGIN
    -- Get all permission IDs
    SELECT ARRAY_AGG(id) INTO perm_ids FROM bd_permissoes;
    
    -- Create system functions with permissions
    INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes) VALUES
        ('SuperAdm', 'Super Administrador - Acesso Total', perm_ids),
        ('Administrador', 'Administrador do Sistema', perm_ids),
        ('Gerente', 'Gerente de Operações', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE modulo IN ('Dashboard', 'RH', 'Frota', 'Logística', 'Operações', 'Relatórios'))),
        ('Coordenador', 'Coordenador de Equipe', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE modulo IN ('Dashboard', 'RH', 'Operações'))),
        ('Encarregado', 'Encarregado de Obra', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE modulo IN ('Dashboard', 'Operações') AND nome_permissao LIKE '%_view')),
        ('Apontador', 'Apontador de Obra', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN ('dashboard_view', 'aplicacao_view', 'aplicacao_create', 'aplicacao_edit'))),
        ('Mecânico', 'Mecânico de Manutenção', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao IN ('dashboard_view', 'veiculos_view', 'chamados_view'))),
        ('Usuário', 'Usuário Básico', (SELECT ARRAY_AGG(id) FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'))
    ON CONFLICT (nome_funcao) DO NOTHING;
END
$$;