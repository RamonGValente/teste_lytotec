-- Corrigir o profile do Jhonathan
UPDATE profiles 
SET 
  funcionario_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
  funcao_sistema = 'Apontador',
  funcoes = ARRAY['Apontador'],
  updated_at = now()
WHERE id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Sincronizar email do funcionário
UPDATE bd_funcionarios 
SET 
  email = 'jhonatelodapj@hotmail.com',
  updated_at = now()
WHERE id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be';