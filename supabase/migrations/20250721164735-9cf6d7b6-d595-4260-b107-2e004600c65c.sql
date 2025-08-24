
-- Função para sincronizar dados entre tabelas pai e filha
CREATE OR REPLACE FUNCTION sync_registro_aplicacao_tables()
RETURNS TRIGGER AS $$
DECLARE
    total_tonelada NUMERIC := 0;
    total_area NUMERIC := 0;
    media_espessura NUMERIC := 0;
BEGIN
    -- Calcular totais dos detalhes para o registro pai
    SELECT 
        COALESCE(SUM(tonelada_aplicada), 0),
        COALESCE(SUM(area_aplicada), 0)
    INTO total_tonelada, total_area
    FROM bd_registro_aplicacao_detalhes
    WHERE registro_aplicacao_id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
    
    -- Calcular espessura média se há área aplicada
    IF total_area > 0 AND total_tonelada > 0 THEN
        media_espessura := (total_tonelada / total_area / 2.4) * 100;
    END IF;
    
    -- Atualizar registro pai com dados sincronizados
    UPDATE bd_registro_apontamento_aplicacao 
    SET 
        tonelada_aplicada = total_tonelada,
        area_calculada = total_area,
        espessura_calculada = CASE WHEN total_area > 0 THEN media_espessura ELSE NULL END,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronização automática após INSERT/UPDATE/DELETE nos detalhes
DROP TRIGGER IF EXISTS trigger_sync_aplicacao_detalhes ON bd_registro_aplicacao_detalhes;
CREATE TRIGGER trigger_sync_aplicacao_detalhes
    AFTER INSERT OR UPDATE OR DELETE ON bd_registro_aplicacao_detalhes
    FOR EACH ROW
    EXECUTE FUNCTION sync_registro_aplicacao_tables();

-- Função para atualizar status da entrega quando hora_saida_caminhao é preenchida
CREATE OR REPLACE FUNCTION atualizar_status_entrega_com_massa()
RETURNS TRIGGER AS $$
DECLARE
    massa_remanescente NUMERIC := 0;
BEGIN
    -- Só proceder se hora_saida_caminhao foi preenchida (de NULL para valor)
    IF NEW.hora_saida_caminhao IS NOT NULL AND (OLD.hora_saida_caminhao IS NULL OR OLD.hora_saida_caminhao != NEW.hora_saida_caminhao) THEN
        
        -- Calcular massa remanescente
        SELECT calcular_massa_remanescente(NEW.lista_entrega_id) INTO massa_remanescente;
        
        -- Se massa remanescente for <= 0.001, marcar como entregue
        IF massa_remanescente <= 0.001 THEN
            UPDATE bd_lista_programacao_entrega
            SET status = 'Entregue', updated_at = NOW()
            WHERE id = NEW.lista_entrega_id;
            
            RAISE NOTICE 'Entrega % marcada como Entregue - massa remanescente: %', NEW.lista_entrega_id, massa_remanescente;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger atualizado no registro de aplicação
DROP TRIGGER IF EXISTS trigger_atualizar_status_entrega_massa ON bd_registro_apontamento_aplicacao;
CREATE TRIGGER trigger_atualizar_status_entrega_massa
    AFTER UPDATE ON bd_registro_apontamento_aplicacao
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_entrega_com_massa();

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
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT registro_aplicacao_id 
    FROM bd_registro_aplicacao_detalhes
) AND (tonelada_aplicada IS NULL OR tonelada_aplicada = 0);
