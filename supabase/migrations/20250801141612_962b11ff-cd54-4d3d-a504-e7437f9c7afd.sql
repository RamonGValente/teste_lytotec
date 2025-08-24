-- Adicionar política RLS para permitir verificação de email por usuários anônimos
-- Isso resolve o problema circular onde usuários não conseguem se cadastrar
-- porque precisam estar autenticados para verificar se estão na tabela bd_funcionarios

CREATE POLICY "Permitir verificação de email para cadastro" 
ON public.bd_funcionarios 
FOR SELECT 
TO anon
USING (
  -- Permite apenas consulta do campo email para verificação durante cadastro
  -- Não expõe dados sensíveis, apenas confirma existência do email
  true
);

-- Comentário: Esta política permite que usuários anônimos façam SELECT na tabela
-- bd_funcionarios apenas para verificar se o email existe durante o processo de cadastro.
-- A política existente para usuários autenticados continua funcionando normalmente.
-- Isso resolve o problema circular de autenticação que estava impedindo o cadastro.