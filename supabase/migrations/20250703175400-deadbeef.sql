-- Fix triggers causing infinite recursion
-- Remove problematic triggers and create simplified trigger

-- Drop conflicting trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_sincronizar_status_entrega ON bd_registro_aplicacao_detalhes;
DROP FUNCTION IF EXISTS public.trigger_atualizar_status_entrega_completo();

-- Drop any old trigger on bd_registro_apontamento_aplicacao
DROP TRIGGER IF EXISTS trigger_atualizar_status_entrega_massa_remanescente ON bd_registro_apontamento_aplicacao;

-- Simple function to update delivery status without recursion
CREATE OR REPLACE FUNCTION public.simple_update_delivery_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.hora_saida_caminhao IS NOT NULL AND OLD.hora_saida_caminhao IS NULL THEN
    UPDATE bd_lista_programacao_entrega
      SET status = 'Entregue'
      WHERE id = NEW.lista_entrega_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger using the simplified function
CREATE TRIGGER trig_simple_update_delivery_status
AFTER UPDATE ON bd_registro_apontamento_aplicacao
FOR EACH ROW EXECUTE FUNCTION public.simple_update_delivery_status();
