-- Corrigir a última função sem search_path definido
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
SET search_path TO 'public'
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