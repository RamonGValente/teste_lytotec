-- Inserir perfil para o usuário lucas.sabino@sanford-heisler.com
INSERT INTO profiles (id, email, nome_completo, funcoes)
VALUES (
  'e8b0c8f4-8b7a-4c9d-9e8f-7a6b5c4d3e2f', -- ID fictício, será substituído pelo ID real do usuário
  'lucas.sabino@sanford-heisler.com',
  'Lucas Sabino',
  ARRAY['Apontador']
) ON CONFLICT (email) DO UPDATE SET
  funcoes = EXCLUDED.funcoes,
  nome_completo = EXCLUDED.nome_completo;