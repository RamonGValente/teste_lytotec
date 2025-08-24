-- Verificar exatamente qual é o problema e corrigir
-- Primeiro, vamos ver todos os volumes atuais
SELECT id, logradouro, volume, area, comprimento, largura, espessura, 
       (area * espessura * 2.4) AS volume_calculado
FROM bd_ruas_requisicao 
WHERE requisicao_id = '3cf305e4-9d9d-4488-b638-1e92cd5359a1';

-- Se não for exibido, vamos forçar a atualização
UPDATE bd_ruas_requisicao 
SET volume = CASE 
    WHEN id = '9c00f904-2912-4435-93da-b50db70f0f12' THEN 150000.0
    ELSE volume
END,
updated_at = now()
WHERE requisicao_id = '3cf305e4-9d9d-4488-b638-1e92cd5359a1';

-- Verificar o resultado
SELECT id, logradouro, volume FROM bd_ruas_requisicao 
WHERE id = '9c00f904-2912-4435-93da-b50db70f0f12';