-- Criar constraint única para email na tabela profiles
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Inserir perfil para o usuário lucas.sabino@sanford-heisler.com
INSERT INTO profiles (id, email, nome_completo, funcoes)
VALUES (
  gen_random_uuid(),
  'lucas.sabino@sanford-heisler.com',
  'Lucas Sabino',
  ARRAY['Apontador']
) ON CONFLICT (email) DO UPDATE SET
  funcoes = EXCLUDED.funcoes,
  nome_completo = EXCLUDED.nome_completo;