-- Corrigir o volume que ainda não foi atualizado corretamente
-- O cálculo manual mostrou 150000 mas o volume ainda está 15000
UPDATE bd_ruas_requisicao 
SET volume = area * (espessura / 100) * 2400,
    updated_at = now()
WHERE volume != (area * (espessura / 100) * 2400)
  AND area IS NOT NULL 
  AND espessura IS NOT NULL;