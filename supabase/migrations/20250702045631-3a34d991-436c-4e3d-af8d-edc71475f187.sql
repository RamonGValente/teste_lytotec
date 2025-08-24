
-- Corrigir políticas RLS para SuperAdmin ter acesso total aos dados

-- 1. Adicionar política para SuperAdmin na tabela bd_lista_programacao_entrega
CREATE POLICY "SuperAdmin can access all deliveries" 
ON bd_lista_programacao_entrega 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

-- 2. Adicionar política para SuperAdmin na tabela bd_registro_cargas
CREATE POLICY "SuperAdmin can access all cargo records" 
ON bd_registro_cargas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

-- 3. Adicionar política para SuperAdmin na tabela bd_registro_apontamento_aplicacao
CREATE POLICY "SuperAdmin can access all application records" 
ON bd_registro_apontamento_aplicacao 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

-- 4. Corrigir política existente na tabela bd_apontamento_equipe para incluir SuperAdmin explicitamente
DROP POLICY IF EXISTS "Admin roles can access all appointments" ON bd_apontamento_equipe;
CREATE POLICY "Admin roles can access all appointments" 
ON bd_apontamento_equipe 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (
      'SuperAdm' = ANY(funcoes) OR 
      'AdmRH' = ANY(funcoes) OR 
      'Administrador' = ANY(funcoes)
    )
  )
);

-- 5. Adicionar políticas básicas para tabelas relacionadas se não existirem
CREATE POLICY "Allow SuperAdmin access to caminhoes" 
ON bd_caminhoes_equipamentos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

CREATE POLICY "Allow SuperAdmin access to usinas" 
ON bd_usinas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);

CREATE POLICY "Allow SuperAdmin access to requisicoes" 
ON bd_requisicoes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND 'SuperAdm' = ANY(funcoes)
  )
);
