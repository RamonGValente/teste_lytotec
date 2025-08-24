
# Documentação do Banco de Dados 🗄️

## Visão Geral

O sistema utiliza PostgreSQL como banco de dados principal, hospedado no Supabase, com Row Level Security (RLS) implementado para controle de acesso granular.

## Estrutura Principal

### Tabelas de Configuração

#### `bd_empresas`
Empresas do sistema.

```sql
CREATE TABLE bd_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    telefone TEXT,
    situacao VARCHAR DEFAULT 'Ativo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `bd_centros_custo`
Centros de custo para controle financeiro.

```sql
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
```

### Gestão de Recursos Humanos

#### `bd_funcionarios`
Cadastro completo de funcionários.

```sql
CREATE TABLE bd_funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### `bd_equipes`
Organização de equipes de trabalho.

```sql
CREATE TABLE bd_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_equipe TEXT NOT NULL,
    encarregado_id UUID REFERENCES bd_funcionarios(id),
    apontador_id UUID REFERENCES bd_funcionarios(id),
    equipe UUID[] DEFAULT '{}', -- Array de IDs dos membros
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `bd_apontamento_equipe`
Registro de presença e atividades das equipes.

```sql
CREATE TABLE bd_apontamento_equipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_id UUID NOT NULL REFERENCES bd_equipes(id),
    colaborador_id UUID REFERENCES bd_funcionarios(id),
    nome_colaborador TEXT NOT NULL,
    data_registro DATE NOT NULL,
    presente BOOLEAN DEFAULT false,
    hora_inicio TIME,
    hora_fim TIME,
    lista_entrega_id UUID REFERENCES bd_lista_programacao_entrega(id),
    registrado_por UUID REFERENCES bd_funcionarios(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Gestão de Máquinas e Equipamentos

#### `bd_caminhoes_equipamentos`
Cadastro de veículos e equipamentos.

```sql
CREATE TABLE bd_caminhoes_equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frota TEXT,
    numero_frota TEXT,
    placa TEXT,
    tipo_veiculo TEXT, -- 'Caminhão', 'Equipamento', 'Prancha', etc.
    marca TEXT,
    modelo TEXT,
    ano_fabricacao TEXT,
    motor TEXT,
    cor TEXT,
    tipo_combustivel TEXT,
    capacidade TEXT,
    aluguel TEXT, -- Valor mensal de locação
    situacao TEXT DEFAULT 'Ativo',
    status_ipva TEXT,
    empresa_id UUID REFERENCES bd_empresas(id),
    departamento_id UUID REFERENCES bd_departamentos(id),
    imagem_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `bd_registro_apontamento_cam_equipa`
Apontamentos operacionais de veículos e equipamentos.

```sql
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
    situacao TEXT, -- 'Operando', 'Disponível', 'Em Manutenção', etc.
    abastecimento NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Sistema de Ordens de Serviço

#### `bd_chamados_os`
Abertura de chamados técnicos.

```sql
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
    prioridade TEXT, -- 'Baixa', 'Média', 'Alta', 'Crítica'
    status TEXT DEFAULT 'Aberto', -- 'Aberto', 'Em Andamento', 'Fechado'
    fotos_avarias TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Logística e Operações

#### `bd_requisicoes`
Requisições de obra para pavimentação.

```sql
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
```

#### `bd_ruas_requisicao`
Logradouros incluídos nas requisições.

```sql
CREATE TABLE bd_ruas_requisicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisicao_id UUID REFERENCES bd_requisicoes(id),
    logradouro TEXT NOT NULL,
    bairro TEXT,
    comprimento NUMERIC NOT NULL,
    largura NUMERIC NOT NULL,
    espessura NUMERIC NOT NULL,
    area NUMERIC, -- Calculado: comprimento × largura
    volume NUMERIC, -- Calculado: área × espessura × 2.4
    traco TEXT NOT NULL, -- Tipo de massa asfáltica
    pintura_ligacao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `bd_lista_programacao_entrega`
Programação de entregas de massa asfáltica.

```sql
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
    tipo_lancamento TEXT NOT NULL, -- 'Normal', 'Emergencial'
    status TEXT NOT NULL DEFAULT 'Ativa',
    programacao_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `bd_registro_cargas`
Registro de cargas da usina.

```sql
CREATE TABLE bd_registro_cargas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_entrega_id UUID NOT NULL REFERENCES bd_lista_programacao_entrega(id),
    programacao_id UUID NOT NULL,
    data_saida DATE NOT NULL,
    hora_saida TIME NOT NULL,
    temperatura_saida NUMERIC,
    tonelada_saida NUMERIC NOT NULL,
    tonelada_retorno NUMERIC,
    tonelada_real NUMERIC, -- Calculado: saída - retorno
    status_registro TEXT DEFAULT 'Ativo',
    imagem_ticket_saida TEXT NOT NULL,
    imagem_ticket_retorno TEXT
);
```

### Aplicação de Asfalto

#### `bd_registro_apontamento_aplicacao`
Registro principal da aplicação.

```sql
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
    area NUMERIC, -- Calculado automaticamente
    -- Massa e espessura
    tonelada_aplicada NUMERIC,
    espessura NUMERIC, -- Calculado: (tonelada / área) / 2.4
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
```

#### `bd_registro_aplicacao_detalhes`
Detalhes específicos de cada aplicação.

```sql
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
```

## Views e Consultas Especializadas

### `vw_entregas_com_massa_remanescente`
View que calcula massa remanescente das entregas.

```sql
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
```

### `vw_registro_aplicacao_completo`
View completa dos registros de aplicação.

```sql
CREATE VIEW vw_registro_aplicacao_completo AS
SELECT 
    raa.*,
    le.logradouro,
    le.tipo_lancamento,
    le.quantidade_massa,
    le.status as status_entrega,
    -- Cálculos de área e espessura
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
    -- Cálculo de espessura média por carga
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
    -- Status calculado
    CASE 
        WHEN raa.carga_finalizada = true THEN 'Finalizada'
        WHEN raa.status_aplicacao = 'Em Andamento' THEN 'Em Andamento'
        ELSE 'Pendente'
    END as status_calculado,
    -- Dados da entrega com massa remanescente
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
```

## Queries Específicas para Relatório de Medição

### Buscar Apontamentos para Relatório
```sql
-- Buscar apontamentos de equipamentos/caminhões para relatório
SELECT 
    rac.caminhao_equipamento_id,
    rac.centro_custo_id,
    cc.nome_centro_custo,
    cc.codigo_centro_custo,
    rac.data,
    rac.horimetro_inicial,
    rac.horimetro_final,
    rac.abastecimento,
    rac.situacao,
    ce.frota,
    ce.numero_frota,
    ce.placa,
    ce.modelo,
    ce.tipo_veiculo,
    ce.aluguel
FROM bd_registro_apontamento_cam_equipa rac
INNER JOIN bd_caminhoes_equipamentos ce ON rac.caminhao_equipamento_id = ce.id
LEFT JOIN bd_centros_custo cc ON rac.centro_custo_id = cc.id
WHERE rac.caminhao_equipamento_id = $1
  AND rac.data BETWEEN $2 AND $3
  AND rac.situacao IN ('Operando', 'Disponível')
  AND rac.centro_custo_id IS NOT NULL
ORDER BY rac.data, cc.codigo_centro_custo;
```

### Buscar Apontamentos de Manutenção
```sql
-- Buscar dias em manutenção para desconto
SELECT 
    rac.data,
    rac.situacao
FROM bd_registro_apontamento_cam_equipa rac
WHERE rac.caminhao_equipamento_id = $1
  AND rac.data BETWEEN $2 AND $3
  AND rac.situacao = 'Em Manutenção'
ORDER BY rac.data;
```

### Calcular Desmobilização
```sql
-- Buscar última data de apontamento para cálculo de desmobilização
SELECT 
    MAX(rac.data) as ultima_data_apontamento
FROM bd_registro_apontamento_cam_equipa rac
WHERE rac.caminhao_equipamento_id = $1
  AND rac.data BETWEEN $2 AND $3
  AND rac.situacao IN ('Operando', 'Disponível', 'Em Manutenção');
```

## Fórmulas e Cálculos

### Relatório de Medição - Equipamentos

```sql
-- Cálculo de valor unitário por hora
-- valor_unitario_hora = aluguel_mensal / 200

-- Cálculo de desconto de manutenção (horas)
-- qtd_horas_manutencao = (200 / 30) * dias_manutencao
-- valor_desconto_manutencao = qtd_horas_manutencao * valor_unitario_hora

-- Cálculo de horas disponíveis por centro de custo
-- horas_disponiveis = (horas_restantes / total_dias_operando) * dias_centro_custo

-- Cálculo de produtividade (nova fórmula)
-- produtividade = (total_horimetros_periodo / horas_restantes) * horas_disponiveis
```

### Relatório de Medição - Caminhões

```sql
-- Cálculo de valor diário
-- valor_diario = aluguel_mensal / 30

-- Cálculo de desconto de manutenção (dias)
-- valor_desconto_manutencao = valor_diario * dias_manutencao

-- Cálculo de valor por centro de custo
-- valor_centro = ((aluguel_mensal - total_descontos) / total_dias_operando) * dias_centro_custo
```

### Aplicação de Asfalto

```sql
-- Cálculo de área
-- area = comprimento * largura

-- Cálculo de espessura
-- espessura_cm = (tonelada_aplicada / area_m2) / 2.4 * 100

-- Cálculo de volume
-- volume_m3 = area_m2 * espessura_m * 2.4 (densidade do asfalto)

-- Cálculo de percentual aplicado
-- percentual = (massa_aplicada_total / massa_total_carga) * 100
```

## Índices de Performance

### Índices Principais
```sql
-- Índices para apontamentos (muito utilizados em relatórios)
CREATE INDEX idx_apontamento_cam_equipa_data ON bd_registro_apontamento_cam_equipa(data);
CREATE INDEX idx_apontamento_cam_equipa_veiculo_data ON bd_registro_apontamento_cam_equipa(caminhao_equipamento_id, data);
CREATE INDEX idx_apontamento_cam_equipa_situacao ON bd_registro_apontamento_cam_equipa(situacao);

-- Índices para aplicação
CREATE INDEX idx_aplicacao_lista_entrega ON bd_registro_apontamento_aplicacao(lista_entrega_id);
CREATE INDEX idx_aplicacao_carga ON bd_registro_apontamento_aplicacao(registro_carga_id);
CREATE INDEX idx_aplicacao_data ON bd_registro_apontamento_aplicacao(data_aplicacao);

-- Índices para programação
CREATE INDEX idx_programacao_entrega_data ON bd_lista_programacao_entrega(data_entrega);
CREATE INDEX idx_programacao_entrega_status ON bd_lista_programacao_entrega(status);
```

## Triggers e Functions

### Atualização Automática de Timestamps
```sql
-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas principais
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON bd_funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON bd_caminhoes_equipamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Cálculo Automático de Valores
```sql
-- Function para calcular área em ruas_requisicao
CREATE OR REPLACE FUNCTION calculate_rua_area()
RETURNS TRIGGER AS $$
BEGIN
    NEW.area = NEW.comprimento * NEW.largura;
    NEW.volume = NEW.area * NEW.espessura * 2.4;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_rua_values BEFORE INSERT OR UPDATE ON bd_ruas_requisicao FOR EACH ROW EXECUTE FUNCTION calculate_rua_area();
```

## Row Level Security (RLS)

### Políticas Básicas
```sql
-- Habilitar RLS em tabelas principais
ALTER TABLE bd_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_caminhoes_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bd_registro_apontamento_cam_equipa ENABLE ROW LEVEL SECURITY;

-- Política básica para usuários autenticados
CREATE POLICY "Authenticated users can access" ON bd_funcionarios
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
```

### Políticas por Empresa
```sql
-- Política para isolamento por empresa (quando aplicável)
CREATE POLICY "Users see only their company data" ON bd_funcionarios
    FOR ALL TO authenticated
    USING (empresa_id = get_user_company_id())
    WITH CHECK (empresa_id = get_user_company_id());
```

## Backup e Manutenção

### Backup Automático
- Supabase realiza backup automático diário
- Retenção de 7 dias para plano padrão
- Point-in-time recovery disponível

### Manutenção Recomendada
```sql
-- Análise de performance de queries
EXPLAIN ANALYZE SELECT ...;

-- Reindexação periódica (se necessário)
REINDEX INDEX idx_apontamento_cam_equipa_data;

-- Limpeza de dados antigos (implementar com cuidado)
DELETE FROM bd_registro_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

## Monitoramento

### Queries Lentas
- Monitorar via dashboard do Supabase
- Alertas para queries > 1 segundo
- Análise regular de índices não utilizados

### Crescimento de Dados
- Tabelas com maior crescimento:
  - `bd_registro_apontamento_cam_equipa` (diário)
  - `bd_registro_aplicacao_detalhes` (por aplicação)
  - `bd_apontamento_equipe` (diário)

### Métricas Importantes
- Tempo de resposta dos relatórios de medição
- Volume de apontamentos por dia
- Taxa de crescimento das aplicações

---

**Versão**: 2.1  
**Última Atualização**: Dezembro 2024  
**Responsável**: Equipe de Desenvolvimento
