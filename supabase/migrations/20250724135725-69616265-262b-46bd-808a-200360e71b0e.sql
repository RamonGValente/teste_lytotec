-- FASE 1: Função RPC para finalizar carga de aplicação
CREATE OR REPLACE FUNCTION public.finalizar_carga_aplicacao(
  aplicacao_id uuid
) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  registro_aplicacao RECORD;
  total_aplicado NUMERIC := 0;
  massa_total NUMERIC := 0;
  espessura_media NUMERIC := 0;
  num_aplicacoes INTEGER := 0;
  resultado JSON;
BEGIN
  -- Buscar informações da aplicação principal
  SELECT ra.*, rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa
  INTO registro_aplicacao
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  WHERE ra.id = aplicacao_id;
  
  IF registro_aplicacao IS NULL THEN
    RAISE EXCEPTION 'Aplicação não encontrada: %', aplicacao_id;
  END IF;
  
  -- Definir massa total disponível
  massa_total = COALESCE(
    registro_aplicacao.tonelada_real, 
    registro_aplicacao.tonelada_saida, 
    registro_aplicacao.quantidade_massa,
    0
  );
  
  -- Calcular totais dos detalhes de aplicação
  SELECT 
    COALESCE(SUM(tonelada_aplicada), 0),
    COALESCE(AVG(espessura_aplicada), 0),
    COUNT(*)
  INTO total_aplicado, espessura_media, num_aplicacoes
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = aplicacao_id;
  
  -- Marcar aplicação como finalizada
  UPDATE bd_registro_apontamento_aplicacao
  SET 
    carga_finalizada = true,
    tonelada_aplicada = total_aplicado,
    percentual_aplicado = CASE WHEN massa_total > 0 THEN (total_aplicado / massa_total * 100) ELSE 100 END,
    updated_at = now()
  WHERE id = aplicacao_id;
  
  -- Atualizar status da entrega baseado na massa aplicada
  PERFORM atualizar_status_entrega_automatico(
    registro_aplicacao.lista_entrega_id,
    CASE WHEN (massa_total - total_aplicado) <= 0.001 THEN 'Entregue' ELSE 'Em Aplicação' END,
    CASE WHEN massa_total > 0 THEN (total_aplicado / massa_total * 100) ELSE 100 END,
    GREATEST(massa_total - total_aplicado, 0)
  );
  
  -- Preparar resultado
  resultado = json_build_object(
    'success', true,
    'aplicacao_id', aplicacao_id,
    'total_aplicado', total_aplicado,
    'massa_total', massa_total,
    'espessura_media', espessura_media,
    'num_aplicacoes', num_aplicacoes,
    'percentual_aplicado', CASE WHEN massa_total > 0 THEN (total_aplicado / massa_total * 100) ELSE 100 END,
    'massa_remanescente', GREATEST(massa_total - total_aplicado, 0)
  );
  
  RETURN resultado;
END;
$$;

-- FASE 2: Função para calcular massa remanescente hierárquica
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente_aplicacao(aplicacao_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  massa_total NUMERIC;
  massa_aplicada NUMERIC;
  massa_remanescente NUMERIC;
  registro_aplicacao RECORD;
BEGIN
  -- Buscar informações da aplicação
  SELECT ra.*, rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa
  INTO registro_aplicacao
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  WHERE ra.id = aplicacao_id;
  
  IF registro_aplicacao IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Definir massa total disponível (hierarquia)
  massa_total = COALESCE(
    registro_aplicacao.tonelada_real, 
    registro_aplicacao.tonelada_saida, 
    registro_aplicacao.quantidade_massa,
    0
  );
  
  -- Calcular total aplicado nos detalhes
  SELECT COALESCE(SUM(tonelada_aplicada), 0)
  INTO massa_aplicada
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = aplicacao_id;
  
  -- Calcular massa remanescente
  massa_remanescente = massa_total - massa_aplicada;
  
  -- Garantir que não seja negativo
  IF massa_remanescente < 0 THEN
    massa_remanescente = 0;
  END IF;
  
  RETURN massa_remanescente;
END;
$$;

-- FASE 3: Trigger para atualizar massa remanescente após inserção/atualização de detalhes
CREATE OR REPLACE FUNCTION public.trigger_atualizar_massa_remanescente_aplicacao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  total_aplicado NUMERIC;
  percentual_aplicado NUMERIC;
BEGIN
  -- Calcular massa remanescente
  massa_remanescente = calcular_massa_remanescente_aplicacao(NEW.registro_aplicacao_id);
  
  -- Buscar massa total para calcular percentual
  SELECT 
    COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa, 0),
    COALESCE(SUM(rad.tonelada_aplicada), 0)
  INTO massa_total, total_aplicado
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  LEFT JOIN bd_registro_aplicacao_detalhes rad ON rad.registro_aplicacao_id = ra.id
  WHERE ra.id = NEW.registro_aplicacao_id
  GROUP BY ra.id, rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa;
  
  -- Calcular percentual aplicado
  IF massa_total > 0 THEN
    percentual_aplicado = (total_aplicado / massa_total * 100);
  ELSE
    percentual_aplicado = 0;
  END IF;
  
  -- Atualizar registro principal
  UPDATE bd_registro_apontamento_aplicacao
  SET 
    tonelada_aplicada = total_aplicado,
    percentual_aplicado = percentual_aplicado,
    updated_at = now()
  WHERE id = NEW.registro_aplicacao_id;
  
  -- Se massa remanescente <= 0.001, finalizar aplicação
  IF massa_remanescente <= 0.001 THEN
    PERFORM finalizar_carga_aplicacao(NEW.registro_aplicacao_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para detalhes de aplicação
DROP TRIGGER IF EXISTS trigger_atualizar_massa_remanescente ON bd_registro_aplicacao_detalhes;
CREATE TRIGGER trigger_atualizar_massa_remanescente
  AFTER INSERT OR UPDATE OR DELETE ON bd_registro_aplicacao_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_massa_remanescente_aplicacao();

-- FASE 4: Função para validar e calcular espessura
CREATE OR REPLACE FUNCTION public.calcular_espessura_aplicacao(
  tonelada_aplicada NUMERIC,
  area_aplicada NUMERIC
) 
RETURNS TABLE (
  espessura_cm NUMERIC,
  status TEXT,
  descricao TEXT
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  espessura NUMERIC;
  status_espessura TEXT;
  descricao_status TEXT;
BEGIN
  -- Calcular espessura em centímetros
  IF area_aplicada > 0 THEN
    espessura = (tonelada_aplicada / area_aplicada / 2.4) * 100;
  ELSE
    espessura = 0;
  END IF;
  
  -- Determinar status baseado na espessura
  IF espessura >= 3 AND espessura <= 8 THEN
    status_espessura = 'success';
    descricao_status = 'Dentro do padrão técnico';
  ELSIF espessura >= 2 AND espessura < 3 THEN
    status_espessura = 'warning';
    descricao_status = 'Abaixo do recomendado';
  ELSIF espessura > 8 AND espessura <= 10 THEN
    status_espessura = 'warning';
    descricao_status = 'Acima do recomendado';
  ELSE
    status_espessura = 'error';
    descricao_status = 'Fora do padrão técnico';
  END IF;
  
  RETURN QUERY SELECT espessura, status_espessura, descricao_status;
END;
$$;