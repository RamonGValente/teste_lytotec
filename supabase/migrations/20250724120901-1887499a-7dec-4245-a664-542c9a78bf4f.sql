-- FASE 1: Correção Crítica do RLS para bd_registro_cargas
-- Criar políticas básicas para permitir operações de usuários autenticados

-- Policy para SELECT - permite usuários autenticados visualizarem registros
CREATE POLICY "Usuários autenticados podem visualizar registros de carga" 
ON public.bd_registro_cargas 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy para INSERT - permite usuários autenticados criarem registros
CREATE POLICY "Usuários autenticados podem criar registros de carga" 
ON public.bd_registro_cargas 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy para UPDATE - permite usuários autenticados atualizarem registros
CREATE POLICY "Usuários autenticados podem atualizar registros de carga" 
ON public.bd_registro_cargas 
FOR UPDATE 
TO authenticated 
USING (true);

-- Policy para DELETE - permite usuários autenticados deletarem registros
CREATE POLICY "Usuários autenticados podem deletar registros de carga" 
ON public.bd_registro_cargas 
FOR DELETE 
TO authenticated 
USING (true);

-- Garantir que as políticas similares existam para bd_carga_status_historico
CREATE POLICY "Usuários autenticados podem visualizar histórico de status" 
ON public.bd_carga_status_historico 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar histórico de status" 
ON public.bd_carga_status_historico 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar histórico de status" 
ON public.bd_carga_status_historico 
FOR UPDATE 
TO authenticated 
USING (true);