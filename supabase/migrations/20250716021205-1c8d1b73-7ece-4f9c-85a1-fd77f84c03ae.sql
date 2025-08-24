-- Remover função antiga e dependências e recriar tudo
DROP FUNCTION IF EXISTS public.usuario_acessa_equipe(uuid, uuid) CASCADE;

-- Recriar função com parâmetros corretos
CREATE OR REPLACE FUNCTION public.usuario_acessa_equipe(_user_id uuid, _equipe_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    is_super_admin BOOLEAN := FALSE;
    is_team_member BOOLEAN := FALSE;
BEGIN
    -- Verificar se é SuperAdmin
    SELECT EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = _user_id AND 'SuperAdm' = ANY(p.funcoes)
    ) INTO is_super_admin;

    -- SuperAdm tem acesso total
    IF is_super_admin THEN 
        RETURN TRUE; 
    END IF;

    -- Verificar se é membro da equipe (apontador, encarregado ou operador)
    -- Usar aliases explícitos e parâmetros renomeados para evitar ambiguidade
    SELECT EXISTS (
        SELECT 1 FROM bd_equipes eq
        JOIN bd_funcionarios func ON (
            eq.apontador_id = func.id OR 
            eq.encarregado_id = func.id OR 
            func.equipe_id = eq.id
        )
        JOIN profiles prof ON func.email = prof.email
        WHERE prof.id = _user_id AND eq.id = _equipe_id
    ) INTO is_team_member;

    RETURN is_team_member;
END;
$function$;

-- Recriar política para bd_apontamento_equipe
DROP POLICY IF EXISTS "Acesso RLS por equipe" ON bd_apontamento_equipe;
CREATE POLICY "Acesso RLS por equipe" ON bd_apontamento_equipe
FOR ALL
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (('SuperAdm'::text = ANY (profiles.funcoes)) OR ('AdmRH'::text = ANY (profiles.funcoes)) OR ('Administrador'::text = ANY (profiles.funcoes)))))) OR usuario_acessa_equipe(auth.uid(), equipe_id) OR (registrado_por = auth.uid()));

-- Recriar política para bd_equipes
DROP POLICY IF EXISTS "Acesso RLS equipes" ON bd_equipes;
CREATE POLICY "Acesso RLS equipes" ON bd_equipes
FOR ALL
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (('SuperAdm'::text = ANY (profiles.funcoes)) OR ('AdmRH'::text = ANY (profiles.funcoes)) OR ('Administrador'::text = ANY (profiles.funcoes)) OR ('AdmLogistica'::text = ANY (profiles.funcoes)) OR ('Mestre de Obra'::text = ANY (profiles.funcoes)))))) OR usuario_acessa_equipe(auth.uid(), id));

-- Recriar política para bd_avaliacao_equipe
DROP POLICY IF EXISTS "Acesso RLS avaliações" ON bd_avaliacao_equipe;
CREATE POLICY "Acesso RLS avaliações" ON bd_avaliacao_equipe
FOR ALL
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (('SuperAdm'::text = ANY (profiles.funcoes)) OR ('AdmRH'::text = ANY (profiles.funcoes)) OR ('Administrador'::text = ANY (profiles.funcoes)) OR ('AdmLogistica'::text = ANY (profiles.funcoes)) OR ('Mestre de Obra'::text = ANY (profiles.funcoes)))))) OR usuario_acessa_equipe(auth.uid(), equipe_id) OR (EXISTS ( SELECT 1
   FROM (bd_funcionarios f
     JOIN profiles p ON ((f.email = p.email)))
  WHERE ((p.id = auth.uid()) AND (f.id = bd_avaliacao_equipe.colaborador_id)))) OR (criado_por = auth.uid()));

-- Recriar política para bd_registro_apontamento_aplicacao
DROP POLICY IF EXISTS "RLS Aplicacao Dinamica" ON bd_registro_apontamento_aplicacao;
CREATE POLICY "RLS Aplicacao Dinamica" ON bd_registro_apontamento_aplicacao
FOR ALL
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND ('SuperAdm'::text = ANY (profiles.funcoes))))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (('AdmRH'::text = ANY (profiles.funcoes)) OR ('Administrador'::text = ANY (profiles.funcoes)))))) OR (created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (bd_lista_programacao_entrega lpe
     JOIN bd_equipes e ON ((lpe.equipe_id = e.id)))
  WHERE ((lpe.id = bd_registro_apontamento_aplicacao.lista_entrega_id) AND usuario_acessa_equipe(auth.uid(), e.id)))));

-- Comentário: Função e políticas RLS recriadas com parâmetros corretos para eliminar ambiguidade