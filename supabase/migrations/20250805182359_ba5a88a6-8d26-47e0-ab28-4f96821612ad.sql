-- CORREÇÃO DE STATUS E MASSA REMANESCENTE
-- Plano: Corrigir unidades, converter registros existentes e forçar atualização de status

-- 1. CORRIGIR FUNÇÃO DE CONVERSÃO DE UNIDADES
CREATE OR REPLACE FUNCTION public.converter_kg_para_toneladas(p_valor numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Lógica mais robusta para detectar e converter unidades
  -- Se valor > 1000, definitivamente está em kg
  IF p_valor > 1000 THEN
    RETURN p_valor / 1000;
  -- Se valor entre 100-1000, verificar contexto (assumir kg para valores altos)
  ELSIF p_valor > 100 THEN
    RETURN p_valor / 1000;
  ELSE
    -- Já está em toneladas
    RETURN p_valor;
  END IF;
END;
$function$;

-- 2. CONVERTER REGISTROS EXISTENTES DE KG PARA TONELADAS
-- Primeiro, criar tabela de backup para auditoria
CREATE TABLE IF NOT EXISTS bd_auditoria_correcao_registros_carga (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_carga_id UUID NOT NULL,
  tonelada_saida_anterior NUMERIC NOT NULL,
  tonelada_saida_corrigida NUMERIC NOT NULL,
  tonelada_retorno_anterior NUMERIC,
  tonelada_retorno_corrigida NUMERIC,
  tonelada_real_anterior NUMERIC,
  tonelada_real_corrigida NUMERIC,
  motivo TEXT NOT NULL DEFAULT 'Correção de unidades kg para toneladas',
  data_correcao TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE bd_auditoria_correcao_registros_carga ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados
CREATE POLICY "Usuários autenticados podem acessar auditoria correção cargas"
ON bd_auditoria_correcao_registros_carga
FOR ALL USING (true);

-- Fazer backup e corrigir registros com valores em kg (> 100)
INSERT INTO bd_auditoria_correcao_registros_carga (
  registro_carga_id,
  tonelada_saida_anterior,
  tonelada_saida_corrigida,
  tonelada_retorno_anterior, 
  tonelada_retorno_corrigida,
  tonelada_real_anterior,
  tonelada_real_corrigida
)
SELECT 
  rc.id,
  rc.tonelada_saida,
  converter_kg_para_toneladas(rc.tonelada_saida),
  rc.tonelada_retorno,
  CASE WHEN rc.tonelada_retorno IS NOT NULL THEN converter_kg_para_toneladas(rc.tonelada_retorno) ELSE NULL END,
  rc.tonelada_real,
  CASE 
    WHEN rc.tonelada_retorno IS NOT NULL THEN 
      converter_kg_para_toneladas(rc.tonelada_saida) - converter_kg_para_toneladas(rc.tonelada_retorno)
    ELSE 
      converter_kg_para_toneladas(rc.tonelada_saida)
  END
FROM bd_registro_cargas rc
WHERE rc.tonelada_saida > 100; -- Valores provavelmente em kg

-- Atualizar registros com valores corrigidos
UPDATE bd_registro_cargas 
SET 
  tonelada_saida = converter_kg_para_toneladas(tonelada_saida),
  tonelada_retorno = CASE 
    WHEN tonelada_retorno IS NOT NULL THEN converter_kg_para_toneladas(tonelada_retorno) 
    ELSE NULL 
  END,
  tonelada_real = CASE 
    WHEN tonelada_retorno IS NOT NULL THEN 
      converter_kg_para_toneladas(tonelada_saida) - converter_kg_para_toneladas(tonelada_retorno)
    ELSE 
      converter_kg_para_toneladas(tonelada_saida)
  END,
  updated_at = now()
WHERE tonelada_saida > 100;

-- 3. FUNÇÃO PARA FORÇAR ATUALIZAÇÃO DE STATUS DAS ENTREGAS
CREATE OR REPLACE FUNCTION public.force_update_all_delivery_statuses()
RETURNS TABLE(
  entrega_id UUID,
  status_anterior TEXT,
  status_novo TEXT,
  massa_remanescente NUMERIC,
  percentual_aplicado NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  entrega_record RECORD;
  massa_total NUMERIC;
  massa_aplicada NUMERIC;
  massa_remanescente_calc NUMERIC;
  percentual_calc NUMERIC;
  status_atual TEXT;
  novo_status TEXT;
BEGIN
  -- Iterar por todas as entregas que têm registro de carga
  FOR entrega_record IN 
    SELECT DISTINCT lpe.id, lpe.status, lpe.quantidade_massa
    FROM bd_lista_programacao_entrega lpe
    INNER JOIN bd_registro_cargas rc ON rc.lista_entrega_id = lpe.id
    WHERE lpe.status != 'Entregue'
  LOOP
    -- Calcular massa total disponível
    SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, entrega_record.quantidade_massa, 0)
    INTO massa_total
    FROM bd_registro_cargas rc
    WHERE rc.lista_entrega_id = entrega_record.id
    ORDER BY rc.created_at DESC
    LIMIT 1;
    
    -- Calcular massa aplicada
    SELECT COALESCE(SUM(rad.tonelada_aplicada), 0)
    INTO massa_aplicada
    FROM bd_registro_apontamento_aplicacao raa
    LEFT JOIN bd_registro_aplicacao_detalhes rad ON rad.registro_aplicacao_id = raa.id
    WHERE raa.lista_entrega_id = entrega_record.id;
    
    -- Calcular massa remanescente e percentual
    massa_remanescente_calc := GREATEST(massa_total - massa_aplicada, 0);
    
    IF massa_total > 0 THEN
      percentual_calc := (massa_aplicada / massa_total * 100);
    ELSE
      percentual_calc := 0;
    END IF;
    
    -- Determinar novo status
    status_atual := entrega_record.status;
    
    IF massa_remanescente_calc <= 0.001 THEN
      novo_status := 'Entregue';
    ELSIF massa_aplicada > 0 THEN
      novo_status := 'Em Aplicação';
    ELSIF EXISTS (SELECT 1 FROM bd_registro_cargas WHERE lista_entrega_id = entrega_record.id) THEN
      novo_status := 'Enviada';
    ELSE
      novo_status := 'Ativa';
    END IF;
    
    -- Atualizar status se necessário
    IF status_atual != novo_status THEN
      PERFORM atualizar_status_entrega_automatico(
        entrega_record.id,
        novo_status,
        percentual_calc,
        massa_remanescente_calc
      );
      
      -- Retornar dados da atualização
      RETURN QUERY SELECT 
        entrega_record.id,
        status_atual,
        novo_status,
        massa_remanescente_calc,
        percentual_calc;
    END IF;
  END LOOP;
END;
$function$;

-- 4. EXECUTAR CORREÇÃO DE STATUS PARA TODAS AS ENTREGAS
SELECT * FROM force_update_all_delivery_statuses();

-- 5. MELHORAR FUNÇÃO DE CÁLCULO DE MASSA REMANESCENTE EM TEMPO REAL
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente_em_tempo_real(p_registro_aplicacao_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  massa_total NUMERIC := 0;
  massa_aplicada NUMERIC := 0;
  massa_remanescente NUMERIC := 0;
  registro_info RECORD;
BEGIN
  -- Buscar informações do registro principal
  SELECT 
    ra.*,
    COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa, 0) as massa_disponivel
  INTO registro_info
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  WHERE ra.id = p_registro_aplicacao_id;
  
  IF registro_info IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Garantir que massa_total está em toneladas
  massa_total := registro_info.massa_disponivel;
  
  -- Se o valor ainda parece estar em kg, converter
  IF massa_total > 1000 THEN
    massa_total := massa_total / 1000;
  END IF;
  
  -- Calcular total aplicado nos detalhes
  SELECT COALESCE(SUM(tonelada_aplicada), 0)
  INTO massa_aplicada
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = p_registro_aplicacao_id;
  
  -- Calcular massa remanescente
  massa_remanescente := GREATEST(massa_total - massa_aplicada, 0);
  
  RETURN massa_remanescente;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao calcular massa remanescente: %', SQLERRM;
END;
$function$;

-- 6. VERIFICAR E CORRIGIR TRIGGERS EXISTENTES
-- Recriar trigger para garantir funcionamento correto
DROP TRIGGER IF EXISTS trigger_massa_remanescente_aplicacao ON bd_registro_aplicacao_detalhes;

CREATE TRIGGER trigger_massa_remanescente_aplicacao
  AFTER INSERT OR UPDATE OR DELETE ON bd_registro_aplicacao_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_massa_remanescente_aplicacao_corrigido();

-- Trigger para finalização quando hora de saída é definida
DROP TRIGGER IF EXISTS trigger_hora_saida_finalizacao ON bd_registro_apontamento_aplicacao;

CREATE TRIGGER trigger_hora_saida_finalizacao
  AFTER UPDATE OF hora_saida_caminhao ON bd_registro_apontamento_aplicacao
  FOR EACH ROW
  EXECUTE FUNCTION trigger_finalizar_hora_saida();

-- 7. VALIDAR CORREÇÕES COM RELATÓRIO
CREATE OR REPLACE FUNCTION public.relatorio_correcao_status_massa()
RETURNS TABLE(
  total_entregas BIGINT,
  entregas_ativas BIGINT,
  entregas_enviadas BIGINT,
  entregas_em_aplicacao BIGINT,
  entregas_entregues BIGINT,
  registros_corrigidos BIGINT,
  massa_media_toneladas NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(*) as total_entregas,
    COUNT(*) FILTER (WHERE status = 'Ativa') as entregas_ativas,
    COUNT(*) FILTER (WHERE status = 'Enviada') as entregas_enviadas,
    COUNT(*) FILTER (WHERE status = 'Em Aplicação') as entregas_em_aplicacao,
    COUNT(*) FILTER (WHERE status = 'Entregue') as entregas_entregues,
    (SELECT COUNT(*) FROM bd_auditoria_correcao_registros_carga) as registros_corrigidos,
    (SELECT AVG(tonelada_saida) FROM bd_registro_cargas) as massa_media_toneladas
  FROM bd_lista_programacao_entrega;
$function$;

-- Executar relatório para validar correções
SELECT * FROM relatorio_correcao_status_massa();