-- Completar habilitação de RLS nas tabelas restantes
ALTER TABLE public.bd_auditoria_correcao_volume_formula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_auditoria_sync_equipe_funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_auditoria_volume_correcao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_chamados_os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_funcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_funcoes_permissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_registro_aplicacao_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_registro_apontamento_cam_equipa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_registro_apontamento_inspecao ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para as tabelas restantes
CREATE POLICY "Usuários autenticados podem acessar auditoria volume formula" 
ON public.bd_auditoria_correcao_volume_formula FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar auditoria sync equipe" 
ON public.bd_auditoria_sync_equipe_funcionario FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar auditoria volume" 
ON public.bd_auditoria_volume_correcao FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar chamados" 
ON public.bd_chamados_os FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar funções" 
ON public.bd_funcoes FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar funções permissão" 
ON public.bd_funcoes_permissao FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar ordens serviço" 
ON public.bd_ordens_servico FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar permissões" 
ON public.bd_permissoes FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar detalhes aplicação" 
ON public.bd_registro_aplicacao_detalhes FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar apontamento equipamentos" 
ON public.bd_registro_apontamento_cam_equipa FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar inspeções" 
ON public.bd_registro_apontamento_inspecao FOR ALL TO authenticated USING (true);