import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RobustPermissions {
  userId: string | null;
  isSuperAdmin: boolean;
  userRole: string | null;
  permissions: string[];
  isLoading: boolean;
  canAccessDashboard: boolean;
}

// FALLBACK GARANTIDO: Lista de SuperAdmins por email
const SUPER_ADMIN_EMAILS = [
  'julianohcampos@yahoo.com.br',
  'ramonvalentevalente@gmail.com'
];

// Cache local para evitar consultas desnecessárias
let permissionsCache: RobustPermissions | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

export const useRobustPermissions = (): RobustPermissions => {
  const [permissions, setPermissions] = useState<RobustPermissions>({
    userId: null,
    isSuperAdmin: false,
    userRole: null,
    permissions: ['dashboard_view'], // SEMPRE incluir dashboard básico
    isLoading: true,
    canAccessDashboard: true, // SEMPRE true como fallback
  });
  const { toast } = useToast();

  const loadPermissions = async () => {
    try {
      console.log('🔐 [ROBUST] Carregando permissões robustas...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('🔐 [ROBUST] Usuário não autenticado');
        setPermissions({
          userId: null,
          isSuperAdmin: false,
          userRole: null,
          permissions: [],
          isLoading: false,
          canAccessDashboard: false,
        });
        return;
      }

      console.log('🔐 [ROBUST] Usuário autenticado:', user.email);

      // FALLBACK 1: Verificar se é SuperAdmin por email
      const isSuperAdminByEmail = SUPER_ADMIN_EMAILS.includes(user.email || '');
      
      if (isSuperAdminByEmail) {
        console.log('🚀 [ROBUST] SuperAdmin detectado por EMAIL - ACESSO TOTAL!');
        const superAdminPermissions = {
          userId: user.id,
          isSuperAdmin: true,
          userRole: 'SuperAdm',
          permissions: [
            'dashboard_view',
            'dashboard_rh_view',
            'dashboard_maquinas_view',
            'dashboard_cbuq_view',
            'gestao_rh_empresas_view',
            'gestao_rh_departamentos_view',
            'gestao_rh_centros_custo_view',
            'gestao_rh_funcoes_view',
            'gestao_rh_funcionarios_view',
            'gestao_rh_equipes_view',
            'acesso_dashboard_rh',
            'gestao_maquinas_caminhoes_view',
            'gestao_maquinas_usinas_view',
            'gestao_maquinas_relatorio_medicao_view',
            'requisicoes_cadastro_view',
            'requisicoes_programacao_entrega_view',
            'requisicoes_registro_cargas_view',
            'requisicoes_registro_aplicacao_view',
            'requisicoes_apontamento_equipe_view',
            'requisicoes_apontamento_caminhoes_view',
            'requisicoes_chamados_os_view',
            'requisicoes_gestao_os_view',
            'registro_aplicacao_view',
            'programacao_entrega_view',
            'admin_permissoes_view'
          ],
          isLoading: false,
          canAccessDashboard: true,
        };
        
        setPermissions(superAdminPermissions);
        permissionsCache = superAdminPermissions;
        lastCacheTime = Date.now();
        return;
      }

      // FALLBACK 2: Tentar carregar do banco com timeout
      console.log('🔍 [ROBUST] Tentando carregar do banco com timeout...');
      
      const profilePromise = supabase
        .from('profiles')
        .select('id, nome_completo, funcoes, funcao_permissao')
        .eq('id', user.id)
        .single();

      // Timeout de 5 segundos para evitar travamentos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      try {
        const { data: profile, error } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;

        if (error) {
          throw error;
        }

        console.log('📋 [ROBUST] Perfil carregado:', profile);

        // Processar permissões do banco
        let userRole: string | null = 'user';
        let isSuperAdmin = false;
        let userPermissions: string[] = ['dashboard_view'];

        if (profile?.funcoes && Array.isArray(profile.funcoes) && profile.funcoes.length > 0) {
          if (profile.funcoes.includes('SuperAdm')) {
            userRole = 'SuperAdm';
            isSuperAdmin = true;
            userPermissions = [
              'dashboard_view',
              'dashboard_rh_view',
              'dashboard_maquinas_view',
              'dashboard_cbuq_view',
              'gestao_rh_empresas_view',
              'gestao_rh_departamentos_view',
              'gestao_rh_centros_custo_view',
              'gestao_rh_funcoes_view',
              'gestao_rh_funcionarios_view',
              'gestao_rh_equipes_view',
              'acesso_dashboard_rh',
              'gestao_maquinas_caminhoes_view',
              'gestao_maquinas_usinas_view',
              'gestao_maquinas_relatorio_medicao_view',
              'requisicoes_cadastro_view',
              'requisicoes_programacao_entrega_view',
              'requisicoes_registro_cargas_view',
              'requisicoes_registro_aplicacao_view',
              'requisicoes_apontamento_equipe_view',
              'requisicoes_apontamento_caminhoes_view',
              'requisicoes_chamados_os_view',
              'requisicoes_gestao_os_view',
              'registro_aplicacao_view',
              'programacao_entrega_view',
              'admin_permissoes_view'
            ];
          } else {
            const validRoles = profile.funcoes.filter(role => 
              role && role.trim() !== '' && role !== 'user'
            );

            if (validRoles.length > 0) {
              userRole = validRoles[0];
              console.log('✅ [ROBUST] Função detectada:', userRole);

              // Permissões específicas por função
              switch (userRole) {
                case 'AdmRH':
                  userPermissions.push(
                    'acesso_dashboard_rh', 
                    'gestao_rh_funcionarios_view', 
                    'dashboard_rh_view', 
                    'gestao_rh_empresas_view', 
                    'gestao_rh_departamentos_view', 
                    'gestao_rh_centros_custo_view', 
                    'gestao_rh_funcoes_view', 
                    'gestao_rh_equipes_view'
                  );
                  break;
                case 'Administrador':
                  userPermissions.push(
                    'acesso_dashboard_rh', 
                    'gestao_rh_funcionarios_view', 
                    'gestao_maquinas_relatorio_medicao_view', 
                    'requisicoes_cadastro_view', 
                    'registro_aplicacao_view', 
                    'programacao_entrega_view', 
                    'dashboard_rh_view', 
                    'dashboard_cbuq_view',
                    'admin_permissoes_view'
                  );
                  break;
                case 'Apontador':
                  userPermissions.push(
                    'registro_aplicacao_view',
                    'programacao_entrega_view'
                  );
                  break;
                default:
                  break;
              }
            }
          }
        }

        const finalPermissions = {
          userId: user.id,
          isSuperAdmin,
          userRole,
          permissions: [...new Set(userPermissions)],
          isLoading: false,
          canAccessDashboard: true,
        };

        console.log('✅ [ROBUST] Permissões finais:', finalPermissions);
        setPermissions(finalPermissions);
        permissionsCache = finalPermissions;
        lastCacheTime = Date.now();

      } catch (dbError) {
        console.warn('⚠️ [ROBUST] Erro no banco, usando fallback:', dbError);
        
        // FALLBACK 3: Usuário autenticado básico
        const fallbackPermissions = {
          userId: user.id,
          isSuperAdmin: false,
          userRole: 'user',
          permissions: ['dashboard_view'],
          isLoading: false,
          canAccessDashboard: true,
        };
        
        setPermissions(fallbackPermissions);
        permissionsCache = fallbackPermissions;
        lastCacheTime = Date.now();
      }

    } catch (error) {
      console.error('❌ [ROBUST] Erro crítico:', error);
      
      // FALLBACK FINAL: Estado de emergência
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      
      if (user) {
        setPermissions({
          userId: user.id,
          isSuperAdmin: SUPER_ADMIN_EMAILS.includes(user.email || ''),
          userRole: SUPER_ADMIN_EMAILS.includes(user.email || '') ? 'SuperAdm' : 'user',
          permissions: ['dashboard_view'],
          isLoading: false,
          canAccessDashboard: true,
        });
      } else {
        setPermissions({
          userId: null,
          isSuperAdmin: false,
          userRole: null,
          permissions: [],
          isLoading: false,
          canAccessDashboard: false,
        });
      }
    }
  };

  useEffect(() => {
    // Verificar cache primeiro
    const now = Date.now();
    if (permissionsCache && (now - lastCacheTime) < CACHE_DURATION) {
      console.log('📦 [ROBUST] Usando cache de permissões');
      setPermissions(permissionsCache);
      return;
    }

    loadPermissions();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('🔄 [ROBUST] Auth state changed:', event);
      // Limpar cache ao mudar auth
      permissionsCache = null;
      lastCacheTime = 0;
      loadPermissions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return permissions;
};

// Hook para verificar permissão específica
export const useHasPermission = (requiredPermission: string): boolean => {
  const { isSuperAdmin, permissions, isLoading } = useRobustPermissions();
  
  if (isLoading) return false;
  if (isSuperAdmin) return true;
  
  return permissions.includes(requiredPermission);
};

// Hook para verificar múltiplas permissões
export const useHasAnyPermission = (requiredPermissions: string[]): boolean => {
  const { isSuperAdmin, permissions, isLoading } = useRobustPermissions();
  
  if (isLoading) return false;
  if (isSuperAdmin) return true;
  
  return requiredPermissions.some(permission => permissions.includes(permission));
};