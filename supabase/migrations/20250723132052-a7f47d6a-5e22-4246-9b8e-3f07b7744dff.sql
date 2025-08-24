-- Converter valores existentes de volume de toneladas para kg
-- Multiplicar por 1000 para converter de toneladas para kg
UPDATE bd_ruas_requisicao 
SET volume = volume * 1000 
WHERE volume IS NOT NULL 
  AND volume > 0 
  AND volume < 10000; -- Apenas valores que provavelmente estão em toneladas (< 10000t)