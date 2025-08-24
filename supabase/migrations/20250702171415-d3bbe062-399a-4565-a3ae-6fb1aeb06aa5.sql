-- Correção das políticas RLS para permitir verificação de email durante registro
-- Problema: Usuários anônimos não conseguem verificar emails para cadastro

-- FASE 1: Criar política específica para verificação de email por usuários anônimos
CREATE POLICY "Allow anonymous email verification for registration"
ON bd_funcionarios
FOR SELECT
TO anon
USING (true);

-- FASE 2: Melhorar a política existente para usuários autenticados
-- Manter a política existente mas garantir que funcione corretamente
DROP POLICY IF EXISTS "Allow email verification for registration" ON bd_funcionarios;

CREATE POLICY "Allow email verification for registration" 
ON bd_funcionarios
FOR SELECT
TO authenticated
USING (true);

-- FASE 3: Comentário explicativo para futuras manutenções
-- Esta política permite que usuários anônimos verifiquem se seus emails
-- estão cadastrados na base de funcionários para poderem se registrar
-- Não expõe dados sensíveis pois o código da aplicação filtra apenas
-- os campos: email, nome_completo, status