-- Correção dos problemas críticos de RLS identificados pelo linter
-- Habilitar RLS nas tabelas principais que precisam de segurança

-- Habilitar RLS na tabela bd_registro_cargas
ALTER TABLE public.bd_registro_cargas ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela bd_carga_status_historico  
ALTER TABLE public.bd_carga_status_historico ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS em outras tabelas críticas do sistema
ALTER TABLE public.bd_lista_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_programacao_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_registro_apontamento_aplicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_apontamento_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_caminhoes_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_centros_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_ruas_requisicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_usinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para as principais tabelas que não têm políticas

-- Políticas para bd_lista_programacao_entrega
CREATE POLICY "Usuários autenticados podem acessar programação de entrega" 
ON public.bd_lista_programacao_entrega FOR ALL TO authenticated USING (true);

-- Políticas para bd_programacao_entrega
CREATE POLICY "Usuários autenticados podem acessar programação" 
ON public.bd_programacao_entrega FOR ALL TO authenticated USING (true);

-- Políticas para bd_registro_apontamento_aplicacao
CREATE POLICY "Usuários autenticados podem acessar apontamentos" 
ON public.bd_registro_apontamento_aplicacao FOR ALL TO authenticated USING (true);

-- Políticas para bd_funcionarios
CREATE POLICY "Usuários autenticados podem acessar funcionários" 
ON public.bd_funcionarios FOR ALL TO authenticated USING (true);

-- Políticas para bd_caminhoes_equipamentos
CREATE POLICY "Usuários autenticados podem acessar veículos" 
ON public.bd_caminhoes_equipamentos FOR ALL TO authenticated USING (true);

-- Políticas para bd_equipes
CREATE POLICY "Usuários autenticados podem acessar equipes" 
ON public.bd_equipes FOR ALL TO authenticated USING (true);

-- Políticas para bd_centros_custo
CREATE POLICY "Usuários autenticados podem acessar centros de custo" 
ON public.bd_centros_custo FOR ALL TO authenticated USING (true);

-- Políticas para bd_empresas
CREATE POLICY "Usuários autenticados podem acessar empresas" 
ON public.bd_empresas FOR ALL TO authenticated USING (true);

-- Políticas para bd_departamentos
CREATE POLICY "Usuários autenticados podem acessar departamentos" 
ON public.bd_departamentos FOR ALL TO authenticated USING (true);

-- Políticas para bd_requisicoes
CREATE POLICY "Usuários autenticados podem acessar requisições" 
ON public.bd_requisicoes FOR ALL TO authenticated USING (true);

-- Políticas para bd_ruas_requisicao
CREATE POLICY "Usuários autenticados podem acessar ruas" 
ON public.bd_ruas_requisicao FOR ALL TO authenticated USING (true);

-- Políticas para bd_usinas
CREATE POLICY "Usuários autenticados podem acessar usinas" 
ON public.bd_usinas FOR ALL TO authenticated USING (true);

-- Políticas para profiles
CREATE POLICY "Usuários podem ver todos os perfis" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Políticas para bd_apontamento_equipe
CREATE POLICY "Usuários autenticados podem acessar apontamentos de equipe" 
ON public.bd_apontamento_equipe FOR ALL TO authenticated USING (true);