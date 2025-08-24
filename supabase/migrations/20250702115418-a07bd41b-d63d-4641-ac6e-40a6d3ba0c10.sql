-- Corrigir políticas RLS da tabela bd_equipes para evitar recursão infinita
-- Problema: As políticas estão fazendo self-referência à própria tabela bd_equipes

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Team members can access their teams" ON bd_equipes;
DROP POLICY IF EXISTS "Admin roles can access all teams" ON bd_equipes;

-- 2. Criar políticas corrigidas sem recursão
-- SuperAdmin pode acessar tudo
CREATE POLICY "SuperAdmin full access to teams" 
ON bd_equipes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

-- AdmRH e Administrador podem acessar todas as equipes
CREATE POLICY "Admin roles can access all teams" 
ON bd_equipes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND ('AdmRH' = ANY(funcoes) OR 'Administrador' = ANY(funcoes))
  )
);

-- Apontadores e Encarregados podem acessar apenas suas equipes
-- Usando uma abordagem sem recursão através da tabela funcionários
CREATE POLICY "Team leaders can access their teams" 
ON bd_equipes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM bd_funcionarios f
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND (
      bd_equipes.apontador_id = f.id OR 
      bd_equipes.encarregado_id = f.id
    )
    AND ('Apontador' = ANY(p.funcoes) OR 'Encarregado' = ANY(p.funcoes))
  )
);

-- Operadores podem ver apenas equipes onde são membros
CREATE POLICY "Team members can view their teams" 
ON bd_equipes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM bd_funcionarios f
    INNER JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid()
    AND f.equipe_id = bd_equipes.id
    AND 'Operador' = ANY(p.funcoes)
  )
);