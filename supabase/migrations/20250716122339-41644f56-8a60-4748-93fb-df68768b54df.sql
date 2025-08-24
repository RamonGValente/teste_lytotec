-- Continuar atualizando as policies restantes

-- Policy para bd_chamados_os
DROP POLICY IF EXISTS "RLS Chamados OS Dinamica" ON bd_chamados_os;
CREATE POLICY "RLS Chamados OS Dinamica" 
ON bd_chamados_os 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador')
  )) OR 
  (solicitante_id = auth.uid())
);

-- Policy para bd_ordens_servico
DROP POLICY IF EXISTS "RLS Ordens Servico Dinamica" ON bd_ordens_servico;
CREATE POLICY "RLS Ordens Servico Dinamica" 
ON bd_ordens_servico 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador')
  )) OR 
  (solicitante_id = auth.uid() OR executado_por_id = auth.uid() OR encerrado_por_id = auth.uid())
);

-- Policy para bd_funcionarios
DROP POLICY IF EXISTS "Acesso dinâmico por RH ou próprio" ON bd_funcionarios;
CREATE POLICY "Acesso dinâmico por RH ou próprio" 
ON bd_funcionarios 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra')
  )) OR 
  (email = (SELECT email FROM profiles WHERE id = auth.uid())) OR 
  usuario_gerencia_funcionario(auth.uid(), id)
);

-- Policy para bd_registro_apontamento_cam_equipa
DROP POLICY IF EXISTS "Acesso RLS veículo" ON bd_registro_apontamento_cam_equipa;
CREATE POLICY "Acesso RLS veículo" 
ON bd_registro_apontamento_cam_equipa 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra')
  )) OR 
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f
    JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid() AND f.id = operador_id
  )) OR 
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f_operador
    JOIN profiles p ON p.id = auth.uid()
    WHERE f_operador.id = operador_id AND usuario_gerencia_funcionario(auth.uid(), f_operador.id)
  ))
);

-- Policy para bd_apontamento_equipe
DROP POLICY IF EXISTS "Acesso RLS por equipe" ON bd_apontamento_equipe;
CREATE POLICY "Acesso RLS por equipe" 
ON bd_apontamento_equipe 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador')
  )) OR 
  usuario_acessa_equipe(auth.uid(), equipe_id) OR 
  (registrado_por = auth.uid())
);

-- Policy para bd_equipes
DROP POLICY IF EXISTS "Acesso RLS equipes" ON bd_equipes;
CREATE POLICY "Acesso RLS equipes" 
ON bd_equipes 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra')
  )) OR 
  usuario_acessa_equipe(auth.uid(), id)
);

-- Policy para bd_avaliacao_equipe
DROP POLICY IF EXISTS "Acesso RLS avaliações" ON bd_avaliacao_equipe;
CREATE POLICY "Acesso RLS avaliações" 
ON bd_avaliacao_equipe 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador', 'AdmLogistica', 'Mestre de Obra')
  )) OR 
  usuario_acessa_equipe(auth.uid(), equipe_id) OR 
  (EXISTS (
    SELECT 1 FROM bd_funcionarios f
    JOIN profiles p ON f.email = p.email
    WHERE p.id = auth.uid() AND f.id = colaborador_id
  )) OR 
  (criado_por = auth.uid())
);

-- Policy para bd_registro_apontamento_aplicacao
DROP POLICY IF EXISTS "RLS Aplicacao Dinamica" ON bd_registro_apontamento_aplicacao;
CREATE POLICY "RLS Aplicacao Dinamica" 
ON bd_registro_apontamento_aplicacao 
FOR ALL 
USING (
  check_is_super_admin_new(auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
    WHERE p.id = auth.uid() 
    AND fp.nome_funcao IN ('AdmRH', 'Administrador')
  )) OR 
  (created_by = auth.uid()) OR 
  (EXISTS (
    SELECT 1 FROM bd_lista_programacao_entrega lpe
    JOIN bd_equipes e ON lpe.equipe_id = e.id
    WHERE lpe.id = lista_entrega_id AND usuario_acessa_equipe(auth.uid(), e.id)
  ))
);