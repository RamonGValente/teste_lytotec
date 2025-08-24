
-- Remover trigger problemático que está causando recursão infinita
DROP TRIGGER IF EXISTS trigger_sincronizar_status_entrega ON bd_registro_aplicacao_detalhes;

-- Remover função que pode estar causando conflitos
DROP FUNCTION IF EXISTS public.trigger_atualizar_status_entrega_completo();

-- Manter apenas a função calcular_massa_remanescente corrigida (já existe)
-- Manter apenas a função sincronizar_aplicacao_formulario_novo (já existe)

-- Remover outros triggers que podem estar conflitando
DROP TRIGGER IF EXISTS trigger_atualizar_totais_aplicacao ON bd_registro_aplicacao_detalhes;
DROP FUNCTION IF EXISTS public.atualizar_totais_aplicacao();

-- Manter apenas os triggers originais essenciais
-- O trigger atualizar_status_entrega_massa_remanescente deve permanecer
-- mas vamos verificar se não está causando problemas

-- Verificar se existe e remover temporariamente para teste
DROP TRIGGER IF EXISTS trigger_atualizar_status_entrega_massa_remanescente ON bd_registro_apontamento_aplicacao;

-- Recriar de forma mais simples se necessário
CREATE OR REPLACE FUNCTION public.simple_update_delivery_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Apenas atualizar status se hora_saida_caminhao foi preenchida
    -- E deixar a lógica complexa para o código TypeScript
    IF NEW.hour_saida_caminhao IS NOT NULL AND OLD.hora_saida_caminhao IS NULL THEN
        UPDATE bd_lista_programacao_entrega
        SET status = 'Entregue'
        WHERE id = NEW.lista_entrega_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Limpar qualquer estado inconsistente que possa estar causando o loop
-- Resetar conexões ativas que podem estar em loop
SELECT pg_cancel_backend(pid) 
FROM pg_stat_activity 
WHERE query LIKE '%bd_registro_aplicacao%' 
AND state = 'active' 
AND pid != pg_backend_pid();
