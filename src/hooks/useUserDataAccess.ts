
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';

interface UserDataAccess {
  allowedTeamIds: string[];
  userRole: string | null;
  canAccessAllTeams: boolean;
  isLoading: boolean;
}

export const useUserDataAccess = (): UserDataAccess => {
  // Emails SuperAdmin automáticos
  const SUPER_ADMIN_EMAILS = ['julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com'];
  const { userRole, isSuperAdmin, isLoading: authLoading } = useAuthPermissions();
  const [allowedTeamIds, setAllowedTeamIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllowedTeams = async () => {
      if (authLoading || !userRole) return;

      try {
        setIsLoading(true);
        
        // SuperAdmin e AdmRH têm acesso a todas as equipes
        if (isSuperAdmin || userRole === 'AdmRH' || userRole === 'Administrador') {
          const { data: allTeams, error } = await supabase
            .from('bd_equipes')
            .select('id');
          
          if (error) throw error;
          setAllowedTeamIds(allTeams?.map(team => team.id) || []);
          return;
        }

        // Para outros usuários, buscar equipes onde são apontador ou encarregado
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (!profile?.email) {
          setAllowedTeamIds([]);
          return;
        }

        // Fallback: se email é SuperAdmin, dar acesso total
        if (SUPER_ADMIN_EMAILS.includes(profile.email)) {
          const { data: allTeams, error } = await supabase
            .from('bd_equipes')
            .select('id');
          
          if (error) throw error;
          setAllowedTeamIds(allTeams?.map(team => team.id) || []);
          return;
        }

        // Buscar funcionário pelo email
        const { data: funcionario } = await supabase
          .from('bd_funcionarios')
          .select('id')
          .eq('email', profile.email)
          .single();

        if (!funcionario) {
          setAllowedTeamIds([]);
          return;
        }

        // Buscar equipes onde é apontador ou encarregado
        const { data: teams, error } = await supabase
          .from('bd_equipes')
          .select('id')
          .or(`apontador_id.eq.${funcionario.id},encarregado_id.eq.${funcionario.id}`);

        if (error) throw error;
        setAllowedTeamIds(teams?.map(team => team.id) || []);

      } catch (error) {
        console.error('Error fetching allowed teams:', error);
        setAllowedTeamIds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllowedTeams();
  }, [userRole, isSuperAdmin, authLoading]);

  // Verificar se email é SuperAdmin para canAccessAllTeams
  const checkEmailSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
        return true;
      }
    } catch (error) {
      console.error('Error checking email SuperAdmin:', error);
    }
    return false;
  };

  const [emailIsSuperAdmin, setEmailIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkEmailSuperAdmin().then(setEmailIsSuperAdmin);
  }, []);

  return {
    allowedTeamIds,
    userRole,
    canAccessAllTeams: isSuperAdmin || emailIsSuperAdmin || userRole === 'AdmRH' || userRole === 'Administrador',
    isLoading: isLoading || authLoading
  };
};
