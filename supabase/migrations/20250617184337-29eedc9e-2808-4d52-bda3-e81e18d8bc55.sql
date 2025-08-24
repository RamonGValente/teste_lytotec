
-- Primeiro, criar constraint única para nome_permissao se não existir
ALTER TABLE bd_permissoes 
ADD CONSTRAINT unique_nome_permissao UNIQUE (nome_permissao);

-- Criar a permissão missing para dashboard de máquinas
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) 
SELECT 'dashboard_maquinas_view', 'Visualizar Dashboard de Máquinas', '/gestao-maquinas/dashboard'
WHERE NOT EXISTS (
    SELECT 1 FROM bd_permissoes WHERE nome_permissao = 'dashboard_maquinas_view'
);

-- Adicionar outras permissões que podem estar missing
INSERT INTO bd_permissoes (nome_permissao, descricao, rota) 
SELECT 'gestao_maquinas_relatorio_medicao_view', 'Visualizar Relatório de Medição', '/gestao-maquinas/relatorio-medicao'
WHERE NOT EXISTS (
    SELECT 1 FROM bd_permissoes WHERE nome_permissao = 'gestao_maquinas_relatorio_medicao_view'
);

INSERT INTO bd_permissoes (nome_permissao, descricao, rota) 
SELECT 'admin_permissoes_view', 'Gerenciar Permissões do Sistema', '/admin/permissoes'
WHERE NOT EXISTS (
    SELECT 1 FROM bd_permissoes WHERE nome_permissao = 'admin_permissoes_view'
);

-- Atualizar SuperAdm com todas as permissões necessárias
DO $$
DECLARE
    superadm_id UUID;
    perm_ids UUID[];
BEGIN
    -- Buscar ID da função SuperAdm
    SELECT id INTO superadm_id 
    FROM bd_funcoes_permissao 
    WHERE nome_funcao = 'SuperAdm';
    
    -- Buscar IDs das novas permissões
    SELECT ARRAY_AGG(id) INTO perm_ids
    FROM bd_permissoes 
    WHERE nome_permissao IN (
        'dashboard_maquinas_view',
        'gestao_maquinas_relatorio_medicao_view', 
        'admin_permissoes_view'
    );
    
    -- Se encontrou, adicionar as permissões
    IF superadm_id IS NOT NULL AND perm_ids IS NOT NULL THEN
        UPDATE bd_funcoes_permissao 
        SET permissoes = (
            SELECT ARRAY_AGG(DISTINCT unnest_val)
            FROM unnest(COALESCE(permissoes, ARRAY[]::UUID[]) || perm_ids) AS unnest_val
        )
        WHERE id = superadm_id;
    END IF;
END $$;
