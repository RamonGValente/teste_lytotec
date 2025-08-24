-- Adicionar função de logging para debug da aplicação
CREATE OR REPLACE FUNCTION public.log_aplicacao_debug(
  p_funcao text,
  p_dados json,
  p_resultado json DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Inserir log na tabela de auditoria temporária para debugging
  INSERT INTO bd_carga_status_historico (
    lista_entrega_id,
    status_anterior,
    status_novo,
    observacoes,
    alterado_por
  ) VALUES (
    NULL,
    'DEBUG',
    p_funcao,
    format('Dados: %s | Resultado: %s', p_dados::text, COALESCE(p_resultado::text, 'N/A')),
    auth.uid()
  );
END;
$function$;

-- Atualizar função criar_aplicacao_por_rua com logs detalhados
CREATE OR REPLACE FUNCTION public.criar_aplicacao_por_rua(
  p_lista_entrega_id uuid,
  p_registro_carga_id uuid,
  p_logradouro_nome text,
  p_area_aplicada numeric,
  p_tonelada_aplicada numeric,
  p_espessura_aplicada numeric DEFAULT NULL,
  p_comprimento numeric DEFAULT NULL,
  p_largura_media numeric DEFAULT NULL,
  p_bordo text DEFAULT NULL,
  p_temperatura_aplicacao numeric DEFAULT NULL,
  p_observacoes_aplicacao text DEFAULT NULL,
  p_hora_inicio_aplicacao time DEFAULT NULL,
  p_hora_fim_aplicacao time DEFAULT NULL,
  p_data_aplicacao date DEFAULT CURRENT_DATE,
  p_hora_chegada_local time DEFAULT '08:00:00'
) RETURNS json
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
  debug_dados JSON;
BEGIN
  -- Log inicial com todos os parâmetros recebidos
  debug_dados := json_build_object(
    'p_lista_entrega_id', p_lista_entrega_id,
    'p_registro_carga_id', p_registro_carga_id,
    'p_logradouro_nome', p_logradouro_nome,
    'p_area_aplicada', p_area_aplicada,
    'p_tonelada_aplicada', p_tonelada_aplicada,
    'p_data_aplicacao', p_data_aplicacao,
    'user_id', auth.uid()
  );
  
  PERFORM log_aplicacao_debug('INICIO_CRIAR_APLICACAO', debug_dados);
  
  -- Validações básicas
  IF p_logradouro_nome IS NULL OR trim(p_logradouro_nome) = '' THEN
    PERFORM log_aplicacao_debug('ERRO_VALIDACAO', json_build_object('erro', 'logradouro_vazio'));
    RAISE EXCEPTION 'Nome do logradouro é obrigatório';
  END IF;
  
  IF p_area_aplicada IS NULL OR p_area_aplicada <= 0 THEN
    PERFORM log_aplicacao_debug('ERRO_VALIDACAO', json_build_object('erro', 'area_invalida', 'valor', p_area_aplicada));
    RAISE EXCEPTION 'Área aplicada deve ser maior que zero';
  END IF;
  
  IF p_tonelada_aplicada IS NULL OR p_tonelada_aplicada <= 0 THEN
    PERFORM log_aplicacao_debug('ERRO_VALIDACAO', json_build_object('erro', 'tonelada_invalida', 'valor', p_tonelada_aplicada));
    RAISE EXCEPTION 'Tonelada aplicada deve ser maior que zero';
  END IF;
  
  PERFORM log_aplicacao_debug('VALIDACOES_OK', json_build_object('status', 'passou_validacoes'));
  
  -- Converter unidade se necessário (kg para toneladas)
  tonelada_convertida := converter_kg_para_toneladas(p_tonelada_aplicada);
  
  PERFORM log_aplicacao_debug('CONVERSAO_UNIDADE', json_build_object(
    'original', p_tonelada_aplicada,
    'convertida', tonelada_convertida
  ));
  
  -- Garantir que existe registro principal
  PERFORM log_aplicacao_debug('ANTES_GARANTIR_REGISTRO', json_build_object(
    'lista_entrega_id', p_lista_entrega_id,
    'registro_carga_id', p_registro_carga_id
  ));
  
  registro_principal_id := garantir_registro_aplicacao_principal(
    p_lista_entrega_id,
    p_registro_carga_id,
    p_data_aplicacao,
    p_hora_chegada_local,
    auth.uid()
  );
  
  PERFORM log_aplicacao_debug('REGISTRO_PRINCIPAL_CRIADO', json_build_object(
    'registro_principal_id', registro_principal_id
  ));
  
  -- Calcular massa remanescente antes da aplicação
  massa_remanescente_atual := calcular_massa_remanescente_em_tempo_real(registro_principal_id);
  
  PERFORM log_aplicacao_debug('MASSA_REMANESCENTE_CALCULADA', json_build_object(
    'massa_remanescente', massa_remanescente_atual,
    'tonelada_a_aplicar', tonelada_convertida
  ));
  
  -- Verificar se há massa suficiente
  IF tonelada_convertida > massa_remanescente_atual THEN
    PERFORM log_aplicacao_debug('ERRO_MASSA_INSUFICIENTE', json_build_object(
      'massa_necessaria', tonelada_convertida,
      'massa_disponivel', massa_remanescente_atual
    ));
    RAISE EXCEPTION 'Massa aplicada (% t) excede massa remanescente (% t)', 
      tonelada_convertida, massa_remanescente_atual;
  END IF;
  
  -- Buscar próxima sequência
  SELECT COALESCE(MAX(sequencia_aplicacao), 0) + 1
  INTO proxima_sequencia
  FROM bd_registro_aplicacao_detalhes
  WHERE registro_aplicacao_id = registro_principal_id;
  
  PERFORM log_aplicacao_debug('SEQUENCIA_CALCULADA', json_build_object(
    'proxima_sequencia', proxima_sequencia
  ));
  
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
  
  PERFORM log_aplicacao_debug('DETALHE_INSERIDO', json_build_object(
    'detalhe_id', detalhe_id,
    'sequencia', proxima_sequencia
  ));
  
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
  
  PERFORM log_aplicacao_debug('SUCESSO_FINAL', resultado);
  
  RETURN resultado;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_aplicacao_debug('ERRO_FATAL', json_build_object(
      'erro', SQLERRM,
      'detalhes', SQLSTATE
    ));
    RAISE EXCEPTION 'Erro ao criar aplicação por rua: %', SQLERRM;
END;
$function$;