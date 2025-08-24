-- Corrigir avisos de segurança - definir search_path nas funções

-- Corrigir calcular_massa_remanescente
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente(entrega_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  massa_total NUMERIC;
  massa_aplicada NUMERIC;
  massa_remanescente NUMERIC;
BEGIN
  -- Buscar massa total da carga
  SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, 0)
  INTO massa_total
  FROM bd_registro_cargas rc
  WHERE rc.lista_entrega_id = entrega_id
  ORDER BY rc.created_at DESC
  LIMIT 1;
  
  -- Se não há registro de carga, retorna a quantidade programada
  IF massa_total IS NULL OR massa_total = 0 THEN
    SELECT quantidade_massa INTO massa_total
    FROM bd_lista_programacao_entrega
    WHERE id = entrega_id;
  END IF;
  
  -- Calcular total aplicado
  SELECT COALESCE(SUM(tonelada_aplicada), 0)
  INTO massa_aplicada
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = entrega_id;
  
  -- Calcular massa remanescente
  massa_remanescente = COALESCE(massa_total, 0) - COALESCE(massa_aplicada, 0);
  
  -- Garantir que não seja negativo
  IF massa_remanescente < 0 THEN
    massa_remanescente = 0;
  END IF;
  
  RETURN massa_remanescente;
END;
$$;

-- Corrigir atualizar_status_entrega_automatico
CREATE OR REPLACE FUNCTION public.atualizar_status_entrega_automatico(
  lista_id UUID, 
  novo_status TEXT,
  percentual_aplicado NUMERIC DEFAULT 0,
  massa_remanescente NUMERIC DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_atual TEXT;
  registro_carga_id UUID;
BEGIN
  -- Buscar status atual
  SELECT status INTO status_atual
  FROM bd_lista_programacao_entrega
  WHERE id = lista_id;
  
  -- Se status já é o mesmo, não faz nada
  IF status_atual = novo_status THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar ID do registro de carga
  SELECT id INTO registro_carga_id
  FROM bd_registro_cargas
  WHERE lista_entrega_id = lista_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Atualizar status da entrega
  UPDATE bd_lista_programacao_entrega
  SET status = novo_status, updated_at = now()
  WHERE id = lista_id;
  
  -- Inserir histórico de mudança
  INSERT INTO bd_carga_status_historico (
    registro_carga_id,
    lista_entrega_id,
    status_anterior,
    status_novo,
    percentual_aplicado,
    massa_remanescente,
    alterado_por
  ) VALUES (
    registro_carga_id,
    lista_id,
    status_atual,
    novo_status,
    percentual_aplicado,
    massa_remanescente,
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- Corrigir finalizar_carga_manual
CREATE OR REPLACE FUNCTION public.finalizar_carga_manual(carga_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_aplicado NUMERIC := 0;
  massa_total NUMERIC := 0;
  espessura_media NUMERIC := 0;
  num_aplicacoes INTEGER := 0;
  lista_entrega_id UUID;
  resultado JSON;
BEGIN
  -- Buscar informações da carga
  SELECT rc.lista_entrega_id, COALESCE(rc.tonelada_real, rc.tonelada_saida, 0)
  INTO lista_entrega_id, massa_total
  FROM bd_registro_cargas rc
  WHERE rc.id = carga_id;
  
  -- Calcular totais das aplicações
  SELECT 
    COALESCE(SUM(tonelada_aplicada), 0),
    COALESCE(AVG(espessura), 0),
    COUNT(*)
  INTO total_aplicado, espessura_media, num_aplicacoes
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = lista_entrega_id;
  
  -- Marcar todas as aplicações como finalizadas
  UPDATE bd_registro_apontamento_aplicacao
  SET carga_finalizada = true, updated_at = now()
  WHERE lista_entrega_id = lista_entrega_id;
  
  -- Atualizar status para "Entregue"
  PERFORM atualizar_status_entrega_automatico(
    lista_entrega_id,
    'Entregue',
    CASE WHEN massa_total > 0 THEN (total_aplicado / massa_total * 100) ELSE 100 END,
    GREATEST(massa_total - total_aplicado, 0)
  );
  
  -- Preparar resultado
  resultado = json_build_object(
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

-- Corrigir funções de trigger
CREATE OR REPLACE FUNCTION public.trigger_status_carga_criada()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Atualizar status para "Enviada" quando carga é registrada
  PERFORM atualizar_status_entrega_automatico(
    NEW.lista_entrega_id,
    'Enviada',
    0, -- percentual ainda é 0
    (SELECT calcular_massa_remanescente(NEW.lista_entrega_id))
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_verificar_massa_aplicacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  percentual_aplicado NUMERIC;
BEGIN
  -- Calcular massa remanescente
  massa_remanescente = calcular_massa_remanescente(NEW.lista_entrega_id);
  
  -- Buscar massa total
  SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa)
  INTO massa_total
  FROM bd_lista_programacao_entrega lpe
  LEFT JOIN bd_registro_cargas rc ON rc.lista_entrega_id = lpe.id
  WHERE lpe.id = NEW.lista_entrega_id
  ORDER BY rc.created_at DESC
  LIMIT 1;
  
  -- Calcular percentual aplicado
  IF massa_total > 0 THEN
    percentual_aplicado = ((massa_total - massa_remanescente) / massa_total * 100);
  ELSE
    percentual_aplicado = 0;
  END IF;
  
  -- Se massa remanescente <= 0.001, finalizar entrega
  IF massa_remanescente <= 0.001 THEN
    PERFORM atualizar_status_entrega_automatico(
      NEW.lista_entrega_id,
      'Entregue',
      100, -- 100% aplicado
      0    -- massa remanescente = 0
    );
    
    -- Marcar carga como finalizada
    UPDATE bd_registro_apontamento_aplicacao
    SET carga_finalizada = true
    WHERE lista_entrega_id = NEW.lista_entrega_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_finalizar_hora_saida()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  percentual_aplicado NUMERIC;
BEGIN
  -- Só executa se hora_saida_caminhao foi preenchida
  IF NEW.hora_saida_caminhao IS NOT NULL AND (OLD.hora_saida_caminhao IS NULL OR OLD.hora_saida_caminhao != NEW.hora_saida_caminhao) THEN
    
    -- Calcular valores para histórico
    massa_remanescente = calcular_massa_remanescente(NEW.lista_entrega_id);
    
    SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa)
    INTO massa_total
    FROM bd_lista_programacao_entrega lpe
    LEFT JOIN bd_registro_cargas rc ON rc.lista_entrega_id = lpe.id
    WHERE lpe.id = NEW.lista_entrega_id
    ORDER BY rc.created_at DESC
    LIMIT 1;
    
    IF massa_total > 0 THEN
      percentual_aplicado = ((massa_total - massa_remanescente) / massa_total * 100);
    ELSE
      percentual_aplicado = 0;
    END IF;
    
    -- Atualizar status para "Entregue"
    PERFORM atualizar_status_entrega_automatico(
      NEW.lista_entrega_id,
      'Entregue',
      percentual_aplicado,
      massa_remanescente
    );
    
    -- Marcar como finalizada
    UPDATE bd_registro_apontamento_aplicacao
    SET carga_finalizada = true
    WHERE lista_entrega_id = NEW.lista_entrega_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;