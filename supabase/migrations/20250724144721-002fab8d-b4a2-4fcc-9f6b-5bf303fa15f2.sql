-- FASE 1: Correção da Função RPC - Resolver referência ambígua ao percentual_aplicado

-- Primeiro, remover a função atual com problemas
DROP FUNCTION IF EXISTS public.criar_aplicacao_por_rua(uuid, uuid, text, numeric, numeric, numeric, numeric, numeric, text, numeric, text, time without time zone, time without time zone, date, time without time zone);

-- Recriar a função corrigida com aliases explícitos
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
  p_hora_inicio_aplicacao time without time zone DEFAULT NULL,
  p_hora_fim_aplicacao time without time zone DEFAULT NULL,
  p_data_aplicacao date DEFAULT CURRENT_DATE,
  p_hora_chegada_local time without time zone DEFAULT '08:00:00'
)
RETURNS json
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

-- Corrigir o trigger que estava causando problemas de referência ambígua
DROP TRIGGER IF EXISTS trigger_atualizar_massa_remanescente ON bd_registro_aplicacao_detalhes;

-- Recriar trigger corrigido
CREATE OR REPLACE FUNCTION public.trigger_atualizar_massa_remanescente_aplicacao_corrigido()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  total_aplicado NUMERIC;
  percentual_calculado NUMERIC;
BEGIN
  -- Calcular massa remanescente
  massa_remanescente = calcular_massa_remanescente_aplicacao(NEW.registro_aplicacao_id);
  
  -- Buscar massa total para calculus percentual com aliases explícitos
  SELECT 
    COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa, 0) as massa_disponivel,
    COALESCE(SUM(rad.tonelada_aplicada), 0) as total_aplicado_calculado
  INTO massa_total, total_aplicado
  FROM bd_registro_apontamento_aplicacao ra
  LEFT JOIN bd_registro_cargas rc ON rc.id = ra.registro_carga_id
  LEFT JOIN bd_lista_programacao_entrega lpe ON lpe.id = ra.lista_entrega_id
  LEFT JOIN bd_registro_aplicacao_detalhes rad ON rad.registro_aplicacao_id = ra.id
  WHERE ra.id = NEW.registro_aplicacao_id
  GROUP BY ra.id, rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa;
  
  -- Calcular percentual aplicado
  IF massa_total > 0 THEN
    percentual_calculado = (total_aplicado / massa_total * 100);
  ELSE
    percentual_calculado = 0;
  END IF;
  
  -- Atualizar registro principal com aliases corretos
  UPDATE bd_registro_apontamento_aplicacao
  SET 
    tonelada_aplicada = total_aplicado,
    percentual_aplicado = percentual_calculado,
    updated_at = now()
  WHERE id = NEW.registro_aplicacao_id;
  
  -- Se massa remanescente <= 0.001, finalizar aplicação
  IF massa_remanescente <= 0.001 THEN
    PERFORM finalizar_carga_aplicacao(NEW.registro_aplicacao_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger corrigido
CREATE TRIGGER trigger_atualizar_massa_remanescente_corrigido
  AFTER INSERT OR UPDATE OR DELETE ON bd_registro_aplicacao_detalhes
  FOR EACH ROW EXECUTE FUNCTION trigger_atualizar_massa_remanescente_aplicacao_corrigido();

-- Adicionar logs para debugging
CREATE OR REPLACE FUNCTION public.log_aplicacao_debug(
  p_funcao text,
  p_dados json,
  p_resultado json DEFAULT NULL
)
RETURNS void
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