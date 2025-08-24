-- Correção da integridade dos dados: Ajustar volumes incorretos
-- Identificar e corrigir volumes que estão 10x menores que deveriam estar
-- Valores abaixo de 50000 (50t) provavelmente estão incorretos e precisam ser multiplicados por 10

-- Primeiro, vamos criar uma auditoria dos dados antes da correção
CREATE TABLE IF NOT EXISTS bd_auditoria_volume_correcao (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rua_requisicao_id uuid NOT NULL,
    volume_anterior numeric NOT NULL,
    volume_corrigido numeric NOT NULL,
    data_correcao timestamp with time zone DEFAULT now(),
    motivo text NOT NULL
);

-- Inserir registros de auditoria antes da correção
INSERT INTO bd_auditoria_volume_correcao (rua_requisicao_id, volume_anterior, volume_corrigido, motivo)
SELECT 
    id,
    volume,
    volume * 10,
    'Correção: volume estava 10x menor que deveria (provavelmente erro na migração anterior)'
FROM bd_ruas_requisicao 
WHERE volume IS NOT NULL 
  AND volume > 0 
  AND volume < 50000; -- Volumes menores que 50 toneladas provavelmente estão incorretos

-- Aplicar a correção multiplicando por 10 os volumes incorretos
UPDATE bd_ruas_requisicao 
SET volume = volume * 10,
    updated_at = now()
WHERE volume IS NOT NULL 
  AND volume > 0 
  AND volume < 50000;

-- Verificar consistência: volumes devem estar entre 1000kg (1t) e 1000000kg (1000t)
-- Criar função para validar integridade dos volumes
CREATE OR REPLACE FUNCTION validar_volume_rua() 
RETURNS TRIGGER AS $$
BEGIN
    -- Validar se o volume está em uma faixa razoável (1t a 1000t em kg)
    IF NEW.volume IS NOT NULL AND (NEW.volume < 1000 OR NEW.volume > 1000000) THEN
        RAISE WARNING 'Volume suspeito detectado: % kg para rua %. Verificar se está na unidade correta.', 
                     NEW.volume, NEW.logradouro;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação automática
DROP TRIGGER IF EXISTS trigger_validar_volume_rua ON bd_ruas_requisicao;
CREATE TRIGGER trigger_validar_volume_rua
    BEFORE INSERT OR UPDATE OF volume ON bd_ruas_requisicao
    FOR EACH ROW EXECUTE FUNCTION validar_volume_rua();