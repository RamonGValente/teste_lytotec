
-- Criar função para atualizar status de equipamentos não apontados
CREATE OR REPLACE FUNCTION atualizar_status_equipamentos_nao_apontados()
RETURNS INTEGER 
LANGUAGE plpgsql
AS $$
DECLARE
    equipamentos_atualizados INTEGER;
BEGIN
    -- Atualizar para 'Disponível' todos os equipamentos que:
    -- 1. NÃO foram apontados hoje
    -- 2. NÃO estão 'Em Manutenção' no cadastro
    UPDATE bd_caminhoes_equipamentos 
    SET situacao = 'Disponível',
        updated_at = NOW()
    WHERE id NOT IN (
        SELECT DISTINCT caminhao_equipamento_id 
        FROM bd_registro_apontamento_cam_equipa 
        WHERE data = CURRENT_DATE
        AND caminhao_equipamento_id IS NOT NULL
    )
    AND situacao != 'Em Manutenção';
    
    GET DIAGNOSTICS equipamentos_atualizados = ROW_COUNT;
    
    -- Log da operação
    RAISE NOTICE 'Função atualizar_status_equipamentos_nao_apontados executada. Equipamentos atualizados: %', equipamentos_atualizados;
    
    RETURN equipamentos_atualizados;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION atualizar_status_equipamentos_nao_apontados() IS 
'Atualiza para Disponível todos os equipamentos que não foram apontados hoje, exceto os que estão Em Manutenção';
