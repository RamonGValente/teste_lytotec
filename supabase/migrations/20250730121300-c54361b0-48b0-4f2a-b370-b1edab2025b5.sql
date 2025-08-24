-- Criar função para converter kg para toneladas
CREATE OR REPLACE FUNCTION public.converter_kg_para_toneladas(p_valor numeric)
 RETURNS numeric
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

-- Criar função para calcular massa remanescente em tempo real
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