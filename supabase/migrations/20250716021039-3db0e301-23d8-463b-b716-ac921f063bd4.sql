-- Correção definitiva da função usuario_acessa_equipe com renomeação de parâmetros
DROP FUNCTION IF EXISTS public.usuario_acessa_equipe(uuid, uuid);

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
$function$