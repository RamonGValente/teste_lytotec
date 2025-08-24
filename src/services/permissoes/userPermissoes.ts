
import { supabase } from "@/integrations/supabase/client";
import { UserPermission } from "@/types/permissao";

export const getUserPermissions = async (userId: string): Promise<{
  roles: string[];
  permissions: string[];
  permissionRoutes: string[];
  mainRoleId: string | null;
}> => {
  try {
    console.log('🔄 Fetching permissions for user:', userId);

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        nome_completo,
        funcao_permissao
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      throw profileError;
    }

    if (!profile?.funcao_permissao) {
      console.warn('⚠️ User has no permission function assigned');
      return {
        roles: [],
        permissions: [],
        permissionRoutes: [],
        mainRoleId: null
      };
    }

    // Buscar função de permissão com suas permissões
    const { data: funcaoPermissao, error: funcaoError } = await supabase
      .from('bd_funcoes_permissao')
      .select(`
        id,
        nome_funcao,
        descricao,
        permissoes
      `)
      .eq('id', profile.funcao_permissao)
      .single();

    if (funcaoError || !funcaoPermissao) {
      console.error('❌ Error fetching user role:', funcaoError);
      return {
        roles: [],
        permissions: [],
        permissionRoutes: [],
        mainRoleId: null
      };
    }

    // Se é SuperAdm, retornar todas as permissões
    if (funcaoPermissao.nome_funcao === 'SuperAdm') {
      const { data: todasPermissoes } = await supabase
        .from('bd_permissoes')
        .select('nome_permissao, rota');

      const allPermissions = todasPermissoes?.map(p => p.nome_permissao) || [];
      const allRoutes = todasPermissoes?.filter(p => p.rota).map(p => p.rota) || [];

      console.log('✅ SuperAdmin permissions loaded:', allPermissions.length);
      
      return {
        roles: [funcaoPermissao.nome_funcao],
        permissions: allPermissions,
        permissionRoutes: allRoutes,
        mainRoleId: funcaoPermissao.id
      };
    }

    // Para outras funções, buscar permissões específicas
    let userPermissions: string[] = [];
    let permissionRoutes: string[] = [];

    if (funcaoPermissao.permissoes && funcaoPermissao.permissoes.length > 0) {
      const { data: permissoes, error: permissoesError } = await supabase
        .from('bd_permissoes')
        .select('nome_permissao, rota')
        .in('id', funcaoPermissao.permissoes);

      if (permissoesError) {
        console.error('❌ Error fetching permissions:', permissoesError);
      } else {
        userPermissions = permissoes?.map(p => p.nome_permissao) || [];
        permissionRoutes = permissoes?.filter(p => p.rota).map(p => p.rota) || [];
      }
    }

    console.log('✅ User permissions loaded:', {
      role: funcaoPermissao.nome_funcao,
      permissions: userPermissions.length,
      routes: permissionRoutes.length
    });

    return {
      roles: [funcaoPermissao.nome_funcao],
      permissions: userPermissions,
      permissionRoutes,
      mainRoleId: funcaoPermissao.id
    };

  } catch (error) {
    console.error('❌ Error in getUserPermissions:', error);
    throw error;
  }
};
