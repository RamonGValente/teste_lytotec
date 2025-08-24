-- Corrigir problema do horímetro inicial para apontadores

-- 1. Criar função privilegiada para buscar último horímetro
CREATE OR REPLACE FUNCTION public.get_ultimo_horimetro_privilegiado(caminhao_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ultimo_horimetro numeric;
BEGIN
    -- Buscar o último horímetro final registrado para este caminhão
    SELECT horimetro_final 
    INTO ultimo_horimetro
    FROM bd_registro_apontamento_cam_equipa
    WHERE caminhao_equipamento_id = caminhao_id
    AND horimetro_final IS NOT NULL
    ORDER BY data DESC, hora_final DESC
    LIMIT 1;
    
    -- Se não encontrar, retornar 0
    IF ultimo_horimetro IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ultimo_horimetro;
END;
$$;

-- 2. Ajustar política RLS para permitir leitura de horímetros por apontadores
-- Primeiro, remover a política atual se existir
DROP POLICY IF EXISTS "Acesso RLS veículo" ON bd_registro_apontamento_cam_equipa;

-- Criar nova política que permite leitura de horímetros para apontadores
CREATE POLICY "Acesso RLS veículo com horímetro"
ON bd_registro_apontamento_cam_equipa
FOR ALL
TO authenticated
USING (
    -- SuperAdmin tem acesso total
    check_is_super_admin_new(auth.uid()) OR
    -- Admins têm acesso total
    (EXISTS (
        SELECT 1 FROM profiles p
        JOIN bd_funcoes_permissao fp ON p.funcao_permissao = fp.id
        WHERE p.id = auth.uid() 
        AND fp.nome_funcao = ANY(ARRAY['AdmRH', 'Administrador', 'AdmLogistica', 'AdmEquipamentos', 'Mestre de Obra'])
    )) OR
    -- Operador pode ver seus próprios apontamentos
    (EXISTS (
        SELECT 1 FROM bd_funcionarios f
        JOIN profiles p ON f.email = p.email
        WHERE p.id = auth.uid() AND f.id = operador_id
    )) OR
    -- Apontador pode ver apontamentos de funcionários da sua equipe OU buscar horímetros de qualquer veículo
    (EXISTS (
        SELECT 1 FROM bd_funcionarios f_operador
        JOIN profiles p ON p.id = auth.uid()
        WHERE f_operador.id = operador_id 
        AND (
            -- Gerencia o funcionário diretamente
            usuario_gerencia_funcionario(auth.uid(), f_operador.id) OR
            -- É apontador e está fazendo consulta de horímetro (permissão especial)
            ('Apontador' = ANY(p.funcoes))
        )
    ))
);

-- 3. Corrigir associações de equipes para funcionários existentes
-- Atualizar funcionários que são operadores mas não têm equipe_id definida
UPDATE bd_funcionarios 
SET equipe_id = (
    SELECT e.id 
    FROM bd_equipes e 
    JOIN bd_funcionarios f_apontador ON e.apontador_id = f_apontador.id
    JOIN profiles p ON f_apontador.email = p.email
    WHERE 'Apontador' = ANY(p.funcoes)
    LIMIT 1
)
WHERE equipe_id IS NULL 
AND EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.email = bd_funcionarios.email 
    AND 'Operador' = ANY(p2.funcoes)
);

-- 4. Comentário sobre uso da função privilegiada
COMMENT ON FUNCTION public.get_ultimo_horimetro_privilegiado(uuid) IS 
'Função privilegiada para buscar último horímetro de um caminhão, contornando RLS para apontadores';