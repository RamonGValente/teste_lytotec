-- Correção final e direta para o registro específico
-- O volume 15000.0 deveria ser 150000.0 (150 toneladas em kg)

UPDATE bd_ruas_requisicao 
SET volume = 150000.0,
    updated_at = now()
WHERE id = '9c00f904-2912-4435-93da-b50db70f0f12' AND volume = 15000.0;

-- Registrar na auditoria
INSERT INTO bd_auditoria_volume_correcao (rua_requisicao_id, volume_anterior, volume_corrigido, motivo)
SELECT 
    '9c00f904-2912-4435-93da-b50db70f0f12',
    15000.0,
    150000.0,
    'Correção final direta: 15000.0 -> 150000.0 (15t -> 150t)'
WHERE EXISTS (
    SELECT 1 FROM bd_ruas_requisicao 
    WHERE id = '9c00f904-2912-4435-93da-b50db70f0f12' 
    AND volume = 150000.0
);