-- Corrigir o trigger para não falhar com valores NULL
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
  -- Verificar se registro_aplicacao_id é válido antes de prosseguir
  IF NEW.registro_aplicacao_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Verificar se o registro principal ainda existe
  IF NOT EXISTS (SELECT 1 FROM bd_registro_apontamento_aplicacao WHERE id = NEW.registro_aplicacao_id) THEN
    RETURN NEW;
  END IF;
  
  -- Calcular massa remanescente
  massa_remanescente = calcular_massa_remanescente_aplicacao(NEW.registro_aplicacao_id);
  
  -- Buscar massa total para calcular percentual com aliases explícitos
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
  
  -- Se não encontrou dados, retornar sem erro
  IF massa_total IS NULL THEN
    RETURN NEW;
  END IF;
  
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
  
  -- Se massa remanescente <= 0.001, finalizar aplicação (apenas se existir)
  IF massa_remanescente <= 0.001 AND EXISTS (SELECT 1 FROM bd_registro_apontamento_aplicacao WHERE id = NEW.registro_aplicacao_id) THEN
    PERFORM finalizar_carga_aplicacao(NEW.registro_aplicacao_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Agora fazer a limpeza das tabelas
-- Primeiro: deletar registros filhos (detalhes)
DELETE FROM bd_registro_aplicacao_detalhes;

-- Segundo: deletar registros principais
DELETE FROM bd_registro_apontamento_aplicacao;

-- Terceiro: modificar a constraint para ON DELETE CASCADE
-- Remover a constraint atual
ALTER TABLE bd_registro_aplicacao_detalhes 
DROP CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey;

-- Recriar a constraint com ON DELETE CASCADE
ALTER TABLE bd_registro_aplicacao_detalhes 
ADD CONSTRAINT bd_registro_aplicacao_detalhes_registro_aplicacao_id_fkey 
FOREIGN KEY (registro_aplicacao_id) 
REFERENCES bd_registro_apontamento_aplicacao(id) 
ON DELETE CASCADE;