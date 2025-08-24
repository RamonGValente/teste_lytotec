-- Correção definitiva da fórmula de cálculo de volume/massa
-- Problema: A fórmula anterior estava incorreta
-- Fórmula correta: Volume (m³) = área (m²) × espessura (m)
-- Massa (kg) = Volume (m³) × Densidade (2400 kg/m³)

-- Primeiro, criar auditoria da correção
CREATE TABLE IF NOT EXISTS bd_auditoria_correcao_volume_formula (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rua_requisicao_id uuid NOT NULL,
    volume_anterior numeric NOT NULL,
    volume_corrigido numeric NOT NULL,
    area numeric NOT NULL,
    espessura_cm numeric NOT NULL,
    espessura_metros numeric NOT NULL,
    data_correcao timestamp with time zone DEFAULT now(),
    motivo text NOT NULL DEFAULT 'Correção da fórmula de cálculo de volume/massa'
);

-- Inserir registros de auditoria antes da correção
INSERT INTO bd_auditoria_correcao_volume_formula (
    rua_requisicao_id, 
    volume_anterior, 
    volume_corrigido, 
    area, 
    espessura_cm, 
    espessura_metros,
    motivo
)
SELECT 
    id,
    volume,
    -- Fórmula correta: Área × Espessura(em metros) × Densidade(2400 kg/m³)
    area * (espessura / 100) * 2400,
    area,
    espessura,
    espessura / 100,
    'Correção da fórmula: Volume = Área × Espessura(m) × Densidade(2400 kg/m³)'
FROM bd_ruas_requisicao 
WHERE volume IS NOT NULL 
  AND area IS NOT NULL 
  AND espessura IS NOT NULL;

-- Aplicar a correção usando a fórmula correta
UPDATE bd_ruas_requisicao 
SET volume = area * (espessura / 100) * 2400,
    updated_at = now()
WHERE volume IS NOT NULL 
  AND area IS NOT NULL 
  AND espessura IS NOT NULL;

-- Dropar trigger e função existente na ordem correta
DROP TRIGGER IF EXISTS calculate_rua_values_trigger ON bd_ruas_requisicao;
DROP TRIGGER IF EXISTS trigger_calculate_rua_values ON bd_ruas_requisicao;
DROP FUNCTION IF EXISTS public.calculate_rua_values() CASCADE;

-- Criar nova função com fórmula correta
CREATE OR REPLACE FUNCTION public.calculate_rua_values()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular área
    NEW.area = NEW.comprimento * NEW.largura;
    
    -- Calcular volume usando fórmula correta
    -- Volume (kg) = Área (m²) × Espessura (m) × Densidade (2400 kg/m³)
    NEW.volume = NEW.area * (NEW.espessura / 100) * 2400;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
CREATE TRIGGER trigger_calculate_rua_values
    BEFORE INSERT OR UPDATE OF comprimento, largura, espessura ON bd_ruas_requisicao
    FOR EACH ROW EXECUTE FUNCTION calculate_rua_values();

-- Verificar alguns exemplos para confirmar a correção
SELECT 
    logradouro,
    area,
    espessura,
    volume,
    -- Mostrar o cálculo manual para verificação
    (area * (espessura / 100) * 2400) AS volume_calculado_manual,
    -- Converter para toneladas para visualização
    ROUND(volume / 1000, 1) AS volume_toneladas
FROM bd_ruas_requisicao 
WHERE requisicao_id = '3cf305e4-9d9d-4488-b638-1e92cd5359a1'
ORDER BY logradouro;