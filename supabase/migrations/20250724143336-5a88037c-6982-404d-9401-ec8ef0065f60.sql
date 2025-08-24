-- FASE 1: Correção completa das funções RPC para aplicações por rua

-- 1. Função para garantir registro principal de aplicação
CREATE OR REPLACE FUNCTION public.garantir_registro_aplicacao_principal(
  p_lista_entrega_id UUID,
  p_registro_carga_id UUID,
  p_data_aplicacao DATE,
  p_hora_chegada_local TIME,
  p_created_by UUID
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  registro_existente_id UUID;
  novo_registro_id UUID;
BEGIN
  -- Verificar se já existe registro principal para esta entrega/carga
  SELECT id INTO registro_existente_id
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = p_lista_entrega_id 
    AND registro_carga_id = p_registro_carga_id
    AND data_aplicacao = p_data_aplicacao
  LIMIT 1;
  
  -- Se não existe, criar novo
  IF registro_existente_id IS NULL THEN
    INSERT INTO bd_registro_apontamento_aplicacao (
      lista_entrega_id,
      registro_carga_id,
      data_aplicacao,
      hora_chegada_local,
      status_aplicacao,
      created_by,
      carga_finalizada,
      percentual_aplicado,
      tonelada_aplicada
    ) VALUES (
      p_lista_entrega_id,
      p_registro_carga_id,
      p_data_aplicacao,
      p_hora_chegada_local,
      'Em Andamento',
      p_created_by,
      false,
      0,
      0
    )
    RETURNING id INTO novo_registro_id;
    
    RETURN novo_registro_id;
  ELSE
    RETURN registro_existente_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao garantir registro principal: %', SQLERRM;
END;
$function$;

-- 2. Função para calcular massa remanescente em tempo real
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente_em_tempo_real(
  p_registro_aplicacao_id UUID
)
RETURNS NUMERIC
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
  
  massa_total := registro_info.massa_disponivel;
  
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

-- 3. Função para converter kg para toneladas
CREATE OR REPLACE FUNCTION public.converter_kg_para_toneladas(
  p_valor NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Se valor > 100, assumir que está em kg e converter para toneladas
  IF p_valor > 100 THEN
    RETURN p_valor / 1000;
  ELSE
    -- Já está em toneladas
    RETURN p_valor;
  END IF;
END;
$function$;

-- 4. Recriar função principal corrigida
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
SET search_path TO 'public'
AS $function$
DECLARE
  registro_principal_id UUID;
  detalhe_id UUID;
  massa_remanescente_atual NUMERIC;
  proxima_sequencia INTEGER;
  tonelada_convertida NUMERIC;
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
  
  -- Converter unidade se necessário (kg para toneladas)
  tonelada_convertida := converter_kg_para_toneladas(p_tonelada_aplicada);
  
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
  IF tonelada_convertida > massa_remanescente_atual THEN
    RAISE EXCEPTION 'Massa aplicada (% t) excede massa remanescente (% t)', 
      tonelada_convertida, massa_remanescente_atual;
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
    tonelada_convertida,
    p_espessura_aplicada,
    p_comprimento,
    p_largura_media,
    p_bordo,
    p_temperatura_aplicacao,
    CASE WHEN trim(p_observacoes_aplicacao) = '' THEN NULL ELSE trim(p_observacoes_aplicacao) END,
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
    'massa_remanescente_nova', massa_remanescente_atual - tonelada_convertida,
    'tonelada_original', p_tonelada_aplicada,
    'tonelada_convertida', tonelada_convertida
  );
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar aplicação por rua: %', SQLERRM;
END;
$function$;