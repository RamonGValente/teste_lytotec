
-- Limpar triggers problemáticos que causam recursão infinita
DROP TRIGGER IF EXISTS trigger_sync_aplicacao_detalhes ON bd_registro_aplicacao_detalhes;
DROP TRIGGER IF EXISTS trigger_atualizar_status_entrega_massa ON bd_registro_apontamento_aplicacao;
DROP TRIGGER IF EXISTS trig_simple_update_delivery_status ON bd_registro_apontamento_aplicacao;
DROP TRIGGER IF EXISTS trigger_sincronizar_status_entrega ON bd_registro_aplicacao_detalhes;

-- Remover funções que causam problemas
DROP FUNCTION IF EXISTS sync_registro_aplicacao_tables();
DROP FUNCTION IF EXISTS atualizar_status_entrega_com_massa();
DROP FUNCTION IF EXISTS simple_update_delivery_status();
DROP FUNCTION IF EXISTS trigger_atualizar_status_entrega_completo();

-- Criar função segura SEM recursão para sincronização
CREATE OR REPLACE FUNCTION safe_sync_aplicacao_data()
RETURNS TRIGGER AS $$
DECLARE
    total_tonelada NUMERIC := 0;
    total_area NUMERIC := 0;
    media_espessura NUMERIC := 0;
    massa_remanescente NUMERIC := 0;
    registro_pai_id UUID;
BEGIN
    -- Determinar ID do registro pai
    registro_pai_id := COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
    
    -- Calcular totais dos detalhes
    SELECT 
        COALESCE(SUM(tonelada_aplicada), 0),
        COALESCE(SUM(area_aplicada), 0)
    INTO total_tonelada, total_area
    FROM bd_registro_aplicacao_detalhes
    WHERE registro_aplicacao_id = registro_pai_id;
    
    -- Calcular espessura média
    IF total_area > 0 AND total_tonelada > 0 THEN
        media_espessura := (total_tonelada / total_area / 2.4) * 100;
    END IF;
    
    -- Atualizar APENAS os campos calculados na tabela pai (SEM TRIGGERS)
    UPDATE bd_registro_apontamento_aplicacao 
    SET 
        tonelada_aplicada = total_tonelada,
        area_calculada = total_area,
        espessura_calculada = CASE WHEN total_area > 0 THEN media_espessura ELSE NULL END,
        updated_at = NOW()
    WHERE id = registro_pai_id;
    
    -- Verificar se precisa atualizar status da entrega (SEM TRIGGERS)
    SELECT calcular_massa_remanescente(
        (SELECT lista_entrega_id FROM bd_registro_apontamento_aplicacao WHERE id = registro_pai_id)
    ) INTO massa_remanescente;
    
    -- Se massa remanescente for <= 0.001, marcar entrega como finalizada
    IF massa_remanescente <= 0.001 THEN
        UPDATE bd_lista_programacao_entrega
        SET status = 'Entregue', updated_at = NOW()
        WHERE id = (
            SELECT lista_entrega_id 
            FROM bd_registro_apontamento_aplicacao 
            WHERE id = registro_pai_id
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar APENAS UM trigger na tabela de detalhes (SEM trigger na tabela pai)
CREATE TRIGGER trigger_safe_sync_aplicacao
    AFTER INSERT OR UPDATE OR DELETE ON bd_registro_aplicacao_detalhes
    FOR EACH ROW
    EXECUTE FUNCTION safe_sync_aplicacao_data();

-- Corrigir dados existentes inconsistentes
UPDATE bd_registro_apontamento_aplicacao
SET 
    tonelada_aplicada = (
        SELECT COALESCE(SUM(rad.tonelada_aplicada), 0)
        FROM bd_registro_aplicacao_detalhes rad
        WHERE rad.registro_aplicacao_id = bd_registro_apontamento_aplicacao.id
    ),
    area_calculada = (
        SELECT COALESCE(SUM(rad.area_aplicada), 0)
        FROM bd_registro_aplicacao_detalhes rad
        WHERE rad.registro_aplicacao_id = bd_registro_apontamento_aplicacao.id
    ),
    espessura_calculada = (
        SELECT CASE 
            WHEN SUM(rad.area_aplicada) > 0 AND SUM(rad.tonelada_aplicada) > 0 
            THEN (SUM(rad.tonelada_aplicada) / SUM(rad.area_aplicada) / 2.4) * 100
            ELSE NULL 
        END
        FROM bd_registro_aplicacao_detalhes rad
        WHERE rad.registro_aplicacao_id = bd_registro_apontamento_aplicacao.id
    ),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM bd_registro_aplicacao_detalhes rad
    WHERE rad.registro_aplicacao_id = bd_registro_apontamento_aplicacao.id
);

-- Atualizar status das entregas que deveriam estar como 'Entregue'
UPDATE bd_lista_programacao_entrega
SET status = 'Entregue', updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT lista_entrega_id
    FROM bd_registro_apontamento_aplicacao
    WHERE calcular_massa_remanescente(lista_entrega_id) <= 0.001
) AND status != 'Entregue';
