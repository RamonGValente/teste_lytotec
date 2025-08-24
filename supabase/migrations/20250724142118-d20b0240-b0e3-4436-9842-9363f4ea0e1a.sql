-- ============= FASE 1: IMPLEMENTAÇÃO DO PLANO COMPLETO - CORREÇÃO =============
-- Corrigir erro na função criar_aplicacao_por_rua

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
  proxima_sequencia INTEGER;
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
  INTO proxima_sequencia
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
    proxima_sequencia,
    trim(p_logradouro_nome),
    p_area_aplicada,
    p_tonelada_aplicada,
    p_espessura_aplicada,
    p_comprimento,
    p_largura_media,
    p_bordo,
    p_temperatura_aplicacao,
    COALESCE(trim(p_observacoes_aplicacao), NULL),
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
    'sequencia_aplicacao', proxima_sequencia,
    'massa_remanescente_anterior', massa_remanescente_atual,
    'massa_remanescente_nova', massa_remanescente_atual - p_tonelada_aplicada
  );
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar aplicação por rua: %', SQLERRM;
END;
$$;