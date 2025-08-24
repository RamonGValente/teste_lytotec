-- Correção específica para os volumes que não foram corrigidos na primeira migração
-- Vamos aplicar a correção de forma mais específica

-- Primeiro verificar todos os registros com volumes suspeitos
-- Se area * espessura * densidade (2.4) está muito diferente do volume, há inconsistência

-- Para os casos específicos identificados, aplicar correção manual
UPDATE bd_ruas_requisicao 
SET volume = volume * 10,
    updated_at = now()
WHERE id = '9c00f904-2912-4435-93da-b50db70f0f12';

-- Registrar a correção manual na auditoria
INSERT INTO bd_auditoria_volume_correcao (rua_requisicao_id, volume_anterior, volume_corrigido, motivo)
VALUES (
    '9c00f904-2912-4435-93da-b50db70f0f12',
    15000.0,
    150000.0,
    'Correção manual: registro específico que não foi corrigido na primeira migração'
);

-- Verificar consistência: comparar volume calculado vs armazenado
-- Para detectar outros casos problemáticos
DO $$
DECLARE
    registro RECORD;
    volume_calculado NUMERIC;
    diferenca_percentual NUMERIC;
BEGIN
    FOR registro IN 
        SELECT id, logradouro, volume, area, comprimento, largura, espessura 
        FROM bd_ruas_requisicao 
        WHERE volume IS NOT NULL AND area IS NOT NULL AND espessura IS NOT NULL
    LOOP
        -- Calcular volume esperado: area * espessura * densidade (2.4)
        volume_calculado := registro.area * registro.espessura * 2.4;
        
        -- Calcular diferença percentual
        IF volume_calculado > 0 THEN
            diferenca_percentual := ABS(registro.volume - volume_calculado) / volume_calculado * 100;
            
            -- Se diferença for maior que 50%, há inconsistência
            IF diferenca_percentual > 50 THEN
                RAISE NOTICE 'INCONSISTÊNCIA DETECTADA - ID: %, Logradouro: %, Volume BD: %, Volume Calculado: %, Diferença: %%%', 
                    registro.id, registro.logradouro, registro.volume, volume_calculado, diferenca_percentual;
            END IF;
        END IF;
    END LOOP;
END $$;