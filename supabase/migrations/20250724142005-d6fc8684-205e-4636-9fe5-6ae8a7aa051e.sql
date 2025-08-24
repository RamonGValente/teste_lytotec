-- ============= FASE 1: IMPLEMENTAÇÃO DO PLANO COMPLETO =============
-- Corrigir e implementar sistema de aplicações por rua

-- 1. Primeiro, criar função RPC para garantir criação do registro principal
CREATE OR REPLACE FUNCTION public.garantir_registro_aplicacao_principal(
  p_lista_entrega_id UUID,
  p_registro_carga_id UUID,
  p_data_aplicacao DATE,
  p_hora_chegada_local TIME,
  p_created_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  registro_existente_id UUID;
  novo_registro_id UUID;
BEGIN
  -- Verificar se já existe um registro principal para esta entrega e carga
  SELECT id INTO registro_existente_id
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = p_lista_entrega_id 
    AND registro_carga_id = p_registro_carga_id
  LIMIT 1;
  
  -- Se já existe, retornar o ID existente
  IF registro_existente_id IS NOT NULL THEN
    RETURN registro_existente_id;
  END IF;
  
  -- Se não existe, criar novo registro principal
  INSERT INTO bd_registro_apontamento_aplicacao (
    lista_entrega_id,
    registro_carga_id,
    data_aplicacao,
    hora_chegada_local,
    status_aplicacao,
    created_by,
    aplicacao_sequencia,
    carga_finalizada
  ) VALUES (
    p_lista_entrega_id,
    p_registro_carga_id,
    p_data_aplicacao,
    p_hora_chegada_local,
    'Em Andamento',
    p_created_by,
    1,
    false
  )
  RETURNING id INTO novo_registro_id;
  
  RETURN novo_registro_id;
END;
$$;

-- 2. Função RPC para converter massa de kg para toneladas
CREATE OR REPLACE FUNCTION public.converter_kg_para_toneladas(massa_kg NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
  IF massa_kg IS NULL OR massa_kg = 0 THEN
    RETURN 0;
  END IF;
  
  -- Converter kg para toneladas (dividir por 1000)
  RETURN massa_kg / 1000.0;
END;
$$;

-- 3. Função RPC para calcular massa remanescente em tempo real
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente_em_tempo_real(
  p_registro_aplicacao_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  massa_total NUMERIC := 0;
  massa_aplicada_detalhes NUMERIC := 0;
  massa_remanescente NUMERIC := 0;
  registro_info RECORD;
BEGIN
  -- Buscar informações do registro principal
  SELECT 
    ra.lista_entrega_id,
    ra.registro_carga_id,
    COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa, 0) as massa_total_disponivel
  INTO registro_info
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  WHERE ra.id = p_registro_aplicacao_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  massa_total := registro_info.massa_total_disponivel;
  
  -- Calcular total aplicado nos detalhes
  SELECT COALESCE(SUM(tonelada_aplicada), 0)
  INTO massa_aplicada_detalhes
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = p_registro_aplicacao_id;
  
  -- Calcular massa remanescente
  massa_remanescente := massa_total - massa_aplicada_detalhes;
  
  -- Garantir que não seja negativo
  IF massa_remanescente < 0 THEN
    massa_remanescente := 0;
  END IF;
  
  RETURN massa_remanescente;
END;
$$;

-- 4. Trigger para atualizar automaticamente o registro principal quando detalhes são modificados
CREATE OR REPLACE FUNCTION public.atualizar_registro_principal_aplicacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  total_aplicado NUMERIC := 0;
  massa_total NUMERIC := 0;
  percentual_aplicado NUMERIC := 0;
  massa_remanescente NUMERIC := 0;
  num_aplicacoes INTEGER := 0;
  espessura_media NUMERIC := 0;
BEGIN
  -- Calcular totais dos detalhes
  SELECT 
    COALESCE(SUM(tonelada_aplicada), 0),
    COUNT(*),
    COALESCE(AVG(espessura_aplicada * 100), 0) -- Converter metros para centímetros para média
  INTO total_aplicado, num_aplicacoes, espessura_media
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
  
  -- Calcular massa remanescente usando função
  massa_remanescente := calcular_massa_remanescente_em_tempo_real(
    COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id)
  );
  
  -- Buscar massa total para calcular percentual
  SELECT 
    COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa, 0)
  INTO massa_total
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  WHERE ra.id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
  
  -- Calcular percentual
  IF massa_total > 0 THEN
    percentual_aplicado := (total_aplicado / massa_total) * 100;
  ELSE
    percentual_aplicado := 0;
  END IF;
  
  -- Atualizar registro principal
  UPDATE bd_registro_apontamento_aplicacao
  SET 
    tonelada_aplicada = total_aplicado,
    percentual_aplicado = percentual_aplicado,
    media_espessura_cm = espessura_media,
    aplicacao_numero = num_aplicacoes,
    updated_at = now()
  WHERE id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
  
  -- Se massa remanescente for muito baixa, marcar como finalizada
  IF massa_remanescente <= 0.001 THEN
    UPDATE bd_registro_apontamento_aplicacao
    SET 
      carga_finalizada = true,
      status_aplicacao = 'Finalizada'
    WHERE id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id);
    
    -- Atualizar status da entrega
    PERFORM atualizar_status_entrega_automatico(
      (SELECT lista_entrega_id FROM bd_registro_apontamento_aplicacao 
       WHERE id = COALESCE(NEW.registro_aplicacao_id, OLD.registro_aplicacao_id)),
      'Entregue',
      100,
      0
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Criar triggers para tabela de detalhes
DROP TRIGGER IF EXISTS trigger_atualizar_registro_principal_insert ON bd_registro_aplicacao_detalhes;
DROP TRIGGER IF EXISTS trigger_atualizar_registro_principal_update ON bd_registro_aplicacao_detalhes;
DROP TRIGGER IF EXISTS trigger_atualizar_registro_principal_delete ON bd_registro_aplicacao_detalhes;

CREATE TRIGGER trigger_atualizar_registro_principal_insert
  AFTER INSERT ON bd_registro_aplicacao_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_registro_principal_aplicacao();

CREATE TRIGGER trigger_atualizar_registro_principal_update
  AFTER UPDATE ON bd_registro_aplicacao_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_registro_principal_aplicacao();

CREATE TRIGGER trigger_atualizar_registro_principal_delete
  AFTER DELETE ON bd_registro_aplicacao_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_registro_principal_aplicacao();

-- 6. Função para validar e criar aplicação por rua (RPC principal)
CREATE OR REPLACE FUNCTION public.criar_aplicacao_por_rua(
  p_lista_entrega_id UUID,
  p_registro_carga_id UUID,
  p_logradouro_nome TEXT,
  p_area_aplicada NUMERIC,
  p_tonelada_aplicada NUMERIC,
  p_espessura_aplicada NUMERIC DEFAULT NULL,
  p_comprimento NUMERIC DEFAULT NULL,
  p_largura_media NUMERIC DEFAULT NULL,
  p_bordo TEXT DEFAULT NULL,
  p_temperatura_aplicacao NUMERIC DEFAULT NULL,
  p_observacoes_aplicacao TEXT DEFAULT NULL,
  p_hora_inicio_aplicacao TIME DEFAULT NULL,
  p_hora_fim_aplicacao TIME DEFAULT NULL,
  p_data_aplicacao DATE DEFAULT CURRENT_DATE,
  p_hora_chegada_local TIME DEFAULT '08:00:00'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  registro_principal_id UUID;
  detalhe_id UUID;
  massa_remanescente_atual NUMERIC;
  resultado JSON;
BEGIN
  -- Validações básicas
  IF p_logradouro_nome IS NULL OR trim(p_logradouro_nome) = '' THEN
    RAISE EXCEPTION 'Nome do logradouro é obrigatório';
  END IF;
  
  IF p_area_aplicada IS NULL OR p_area_aplicada <= 0 THEN
    RAISE EXCEPTION 'Área aplicada deve ser maior que zero';
  END IF;
  
  IF p_tonelada_aplicada IS NULL OR p_tonelada_aplicada <= 0 THEN
    RAISE EXCEPTION 'Tonelada aplicada deve ser maior que zero';
  END IF;
  
  -- Garantir que existe registro principal
  registro_principal_id := garantir_registro_aplicacao_principal(
    p_lista_entrega_id,
    p_registro_carga_id,
    p_data_aplicacao,
    p_hora_chegada_local,
    auth.uid()
  );
  
  -- Calcular massa remanescente antes da aplicação
  massa_remanescente_atual := calcular_massa_remanescente_em_tempo_real(registro_principal_id);
  
  -- Verificar se há massa suficiente
  IF p_tonelada_aplicada > massa_remanescente_atual THEN
    RAISE EXCEPTION 'Massa aplicada (%) excede massa remanescente (%)', 
      p_tonelada_aplicada, massa_remanescente_atual;
  END IF;
  
  -- Buscar próxima sequência
  SELECT COALESCE(MAX(sequencia_aplicacao), 0) + 1
  INTO STRICT p_sequencia
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = registro_principal_id;
  
  -- Criar detalhe da aplicação
  INSERT INTO bd_registro_aplicacao_detalhes (
    registro_aplicacao_id,
    lista_entrega_id,
    registro_carga_id,
    sequencia_aplicacao,
    logradouro_nome,
    area_aplicada,
    tonelada_aplicada,
    espessura_aplicada,
    comprimento,
    largura_media,
    bordo,
    temperatura_aplicacao,
    observacoes_aplicacao,
    hora_inicio_aplicacao,
    hora_fim_aplicacao,
    data_aplicacao,
    created_by
  ) VALUES (
    registro_principal_id,
    p_lista_entrega_id,
    p_registro_carga_id,
    p_sequencia,
    trim(p_logradouro_nome),
    p_area_aplicada,
    p_tonelada_aplicada,
    p_espessura_aplicada,
    p_comprimento,
    p_largura_media,
    p_bordo,
    p_temperatura_aplicacao,
    trim(p_observacoes_aplicacao),
    p_hora_inicio_aplicacao,
    p_hora_fim_aplicacao,
    p_data_aplicacao,
    auth.uid()
  )
  RETURNING id INTO detalhe_id;
  
  -- Preparar resultado
  resultado := json_build_object(
    'success', true,
    'registro_principal_id', registro_principal_id,
    'detalhe_id', detalhe_id,
    'sequencia_aplicacao', p_sequencia,
    'massa_remanescente_anterior', massa_remanescente_atual,
    'massa_remanescente_nova', massa_remanescente_atual - p_tonelada_aplicada
  );
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar aplicação por rua: %', SQLERRM;
END;
$$;

-- 7. Função para buscar aplicações com cache otimizado
CREATE OR REPLACE FUNCTION public.buscar_aplicacoes_por_registro(
  p_registro_aplicacao_id UUID
)
RETURNS TABLE (
  id UUID,
  sequencia_aplicacao INTEGER,
  logradouro_nome TEXT,
  area_aplicada NUMERIC,
  tonelada_aplicada NUMERIC,
  espessura_aplicada NUMERIC,
  espessura_calculada NUMERIC,
  comprimento NUMERIC,
  largura_media NUMERIC,
  bordo TEXT,
  temperatura_aplicacao NUMERIC,
  observacoes_aplicacao TEXT,
  hora_inicio_aplicacao TIME,
  hora_fim_aplicacao TIME,
  data_aplicacao DATE,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rad.id,
    rad.sequencia_aplicacao,
    rad.logradouro_nome,
    rad.area_aplicada,
    rad.tonelada_aplicada,
    rad.espessura_aplicada,
    rad.espessura_calculada,
    rad.comprimento,
    rad.largura_media,
    rad.bordo,
    rad.temperatura_aplicacao,
    rad.observacoes_aplicacao,
    rad.hora_inicio_aplicacao,
    rad.hora_fim_aplicacao,
    rad.data_aplicacao,
    rad.created_at
  FROM bd_registro_aplicacao_detalhes rad
  WHERE rad.registro_aplicacao_id = p_registro_aplicacao_id
  ORDER BY rad.sequencia_aplicacao ASC;
END;
$$;