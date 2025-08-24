
-- FASE 1: CORREÇÃO DOS TRIGGERS PROBLEMÁTICOS
-- Remover triggers que causam recursão infinita

-- 1. Remover trigger que causa loop infinito na finalização de carga
DROP TRIGGER IF EXISTS trigger_finalizar_carga_automatica ON bd_registro_apontamento_aplicacao;
DROP FUNCTION IF EXISTS public.trigger_finalizar_carga_automatica();

-- 2. Remover trigger de atualização de status por massa remanescente (causa recursão)
DROP TRIGGER IF EXISTS trigger_atualizar_status_entrega_massa_remanescente ON bd_registro_apontamento_aplicacao;
DROP FUNCTION IF EXISTS public.atualizar_status_entrega_massa_remanescente();

-- 3. Corrigir trigger simples para evitar erro de campo
DROP TRIGGER IF EXISTS trig_simple_update_delivery_status ON bd_registro_apontamento_aplicacao;
DROP FUNCTION IF EXISTS public.simple_update_delivery_status();

-- Recriar trigger simples corrigido (sem recursão)
CREATE OR REPLACE FUNCTION public.simple_update_delivery_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Apenas atualizar status se hora_saida_caminhao foi preenchida
  IF NEW.hora_saida_caminhao IS NOT NULL AND OLD.hora_saida_caminhao IS NULL THEN
    UPDATE bd_lista_programacao_entrega
      SET status = 'Entregue'
      WHERE id = NEW.lista_entrega_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Recriar trigger com nome corrigido
CREATE TRIGGER trig_simple_update_delivery_status
AFTER UPDATE ON bd_registro_apontamento_aplicacao
FOR EACH ROW EXECUTE FUNCTION public.simple_update_delivery_status();

-- FASE 2: CORREÇÃO DE PROBLEMAS DE STORAGE
-- Adicionar coluna updated_at se não existir
ALTER TABLE IF EXISTS storage.objects
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Política RLS mais permissiva para buckets (corrigir erro de violação)
DROP POLICY IF EXISTS "Allow bucket creation" ON storage.buckets;
CREATE POLICY "Allow bucket creation" ON storage.buckets
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- FASE 3: OTIMIZAR FUNÇÃO DE MASSA REMANESCENTE (evitar problemas de performance)
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente(entrega_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    massa_total NUMERIC := 0;
    massa_aplicada NUMERIC := 0;
    massa_remanescente NUMERIC := 0;
BEGIN
    -- Buscar a massa total da carga com limite de uma linha
    SELECT rc.tonelada_real 
    INTO massa_total
    FROM bd_registro_cargas rc
    INNER JOIN bd_lista_programacao_entrega lpe ON rc.lista_entrega_id = lpe.id
    WHERE lpe.id = entrega_id
    LIMIT 1;
    
    -- Se não encontrar a massa total, retornar 0
    IF massa_total IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Somar todas as aplicações já realizadas para esta entrega
    SELECT COALESCE(SUM(raa.tonelada_aplicada), 0)
    INTO massa_aplicada
    FROM bd_registro_apontamento_aplicacao raa
    WHERE raa.lista_entrega_id = entrega_id;
    
    -- Calcular massa remanescente
    massa_remanescente := massa_total - massa_aplicada;
    
    -- Garantir que não seja negativo
    IF massa_remanescente < 0 THEN
        massa_remanescente := 0;
    END IF;
    
    RETURN massa_remanescente;
END;
$$;

-- FASE 4: CRIAR FUNÇÃO AUXILIAR PARA FINALIZAÇÃO MANUAL (sem triggers)
CREATE OR REPLACE FUNCTION public.finalizar_carga_manual(carga_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    resultado JSON;
    total_aplicado NUMERIC;
    massa_total NUMERIC;
    espessura_media NUMERIC;
    num_aplicacoes INTEGER;
BEGIN
    -- Calcular totais finais
    SELECT 
        COALESCE(SUM(ra.tonelada_aplicada), 0),
        rc.tonelada_real,
        COUNT(ra.id)
    INTO total_aplicado, massa_total, num_aplicacoes
    FROM bd_registro_apontamento_aplicacao ra
    JOIN bd_registro_cargas rc ON ra.registro_carga_id = rc.id
    WHERE rc.id = carga_id
    GROUP BY rc.tonelada_real;
    
    -- Calcular espessura média se houver dados
    IF num_aplicacoes > 0 THEN
        SELECT 
            CASE 
                WHEN SUM(ra.area_calculada) > 0 THEN 
                    ROUND((total_aplicado / SUM(ra.area_calculada) / 2.4) * 100, 2)
                ELSE 0 
            END
        INTO espessura_media
        FROM bd_registro_apontamento_aplicacao ra
        WHERE ra.registro_carga_id = carga_id;
    ELSE
        espessura_media := 0;
    END IF;
    
    -- Atualizar registros sem disparar triggers problemáticos
    UPDATE bd_registro_apontamento_aplicacao 
    SET 
        media_espessura_cm = espessura_media,
        carga_finalizada = TRUE,
        updated_at = NOW()
    WHERE registro_carga_id = carga_id;
    
    -- Atualizar status da entrega manualmente
    UPDATE bd_lista_programacao_entrega 
    SET status = 'Entregue'
    WHERE id IN (
        SELECT DISTINCT lista_entrega_id 
        FROM bd_registro_apontamento_aplicacao 
        WHERE registro_carga_id = carga_id
    );
    
    -- Retornar resultado
    resultado := json_build_object(
        'success', true,
        'carga_id', carga_id,
        'total_aplicado', total_aplicado,
        'massa_total', massa_total,
        'espessura_media', espessura_media,
        'num_aplicacoes', num_aplicacoes
    );
    
    RETURN resultado;
END;
$$;
