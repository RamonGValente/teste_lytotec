
-- Corrigir o nome da função do Mauro Pavão de "Mestre de Obrar" para "Mestre de Obra"
UPDATE profiles 
SET funcoes = ARRAY['Mestre de Obra']
WHERE email = 'mauroandrepavao@gmail.com' 
AND 'Mestre de Obrar' = ANY(funcoes);

-- Verificar se existem outros usuários com problemas similares e padronizar nomes de funções
UPDATE profiles 
SET funcoes = ARRAY['AdmRH']
WHERE 'Admin RH' = ANY(funcoes) OR 'Administrador RH' = ANY(funcoes);

UPDATE profiles 
SET funcoes = ARRAY['AdmEquipamentos']
WHERE 'Admin Equipamentos' = ANY(funcoes) OR 'Administrador Equipamentos' = ANY(funcoes);

UPDATE profiles 
SET funcoes = ARRAY['AdmLogistica']
WHERE 'Admin Logística' = ANY(funcoes) OR 'Administrador Logística' = ANY(funcoes);

-- Inserir função "Mestre de Obra" na tabela bd_funcoes_permissao se não existir
INSERT INTO bd_funcoes_permissao (nome_funcao, descricao, permissoes)
SELECT 'Mestre de Obra', 'Responsável pela supervisão e coordenação de obras', ARRAY[
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_rh_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'dashboard_maquinas_view'),
  (SELECT id FROM bd_permissoes WHERE nome_permissao = 'gestao_rh_equipes_view')
]::uuid[]
WHERE NOT EXISTS (
  SELECT 1 FROM bd_funcoes_permissao WHERE nome_funcao = 'Mestre de Obra'
);
