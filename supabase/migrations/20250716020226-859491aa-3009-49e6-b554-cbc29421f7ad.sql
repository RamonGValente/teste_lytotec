-- Corrigir função usuario_acessa_equipe com ambiguidade SQL
CREATE OR REPLACE FUNCTION public.usuario_acessa_equipe(user_id uuid, equipe_id uuid)
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
        SELECT 1 FROM profiles
        WHERE id = user_id AND 'SuperAdm' = ANY(funcoes)
    ) INTO is_super_admin;

    -- SuperAdm tem acesso total
    IF is_super_admin THEN 
        RETURN TRUE; 
    END IF;

    -- Verificar se é membro da equipe (apontador, encarregado ou operador)
    -- Corrigido: usar aliases para resolver ambiguidade
    SELECT EXISTS (
        SELECT 1 FROM bd_equipes e
        JOIN bd_funcionarios f ON (
            e.apontador_id = f.id OR 
            e.encarregado_id = f.id OR 
            f.equipe_id = e.id
        )
        JOIN profiles p ON f.email = p.email
        WHERE p.id = user_id AND e.id = equipe_id
    ) INTO is_team_member;

    RETURN is_team_member;
END;
$function$