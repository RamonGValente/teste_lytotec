
import { useAuthPermissions } from './useAuthPermissions';

// Mapeamento de rotas para permissões necessárias - CORRIGIDO
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard
  '/dashboard': ['dashboard_view'],
  '/dashboard-rh': ['dashboard_rh_view'],
  '/dashboard-maquinas': ['dashboard_maquinas_view'],
  '/dashboard-cbuq': ['dashboard_cbuq_view'],

  // Gestão de RH
  '/gestao-rh/empresas': ['gestao_rh_empresas_view'],
  '/gestao-rh/departamentos': ['gestao_rh_departamentos_view'],
  '/gestao-rh/centros-custo': ['gestao_rh_centros_custo_view'],
  '/gestao-rh/funcoes': ['gestao_rh_funcoes_view'],
  '/gestao-rh/funcionarios': ['gestao_rh_funcionarios_view'],
  '/gestao-rh/equipes': ['gestao_rh_equipes_view'],

  // Gestão de Máquinas/Equipamentos
  '/gestao-maquinas/caminhoes': ['gestao_maquinas_caminhoes_view'],
  '/gestao-maquinas/usinas': ['gestao_maquinas_usinas_view'],
  '/gestao-maquinas/relatorio-medicao': ['gestao_maquinas_relatorio_medicao_view'],

  // Rotas diretas - CORRIGIDAS para usar as permissões corretas
  '/registro-aplicacao': ['requisicoes_registro_aplicacao_view'],
  '/programacao-entrega': ['requisicoes_programacao_entrega_view'],

  // Requisições e Logística
  '/requisicoes/cadastro': ['requisicoes_cadastro_view'],
  '/requisicoes/registro-cargas': ['requisicoes_registro_cargas_view'],
  '/requisicoes/apontamento-equipe': ['requisicoes_apontamento_equipe_view'],
  '/requisicoes/apontamento-caminhoes': ['requisicoes_apontamento_caminhoes_view'],
  '/requisicoes/chamados-os': ['requisicoes_chamados_os_view'],
  '/requisicoes/gestao-os': ['requisicoes_gestao_os_view'],

  // Administração
  '/admin/permissoes': ['admin_permissoes_view'],
};

export const useRouteAccess = () => {
  const { isSuperAdmin, permissions, isLoading } = useAuthPermissions();

  const canAccessRoute = (route: string): boolean => {
    if (isLoading) return false;
    if (isSuperAdmin) return true;

    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (!requiredPermissions) return true; // Rota não restrita

    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const getAccessibleRoutes = (): string[] => {
    if (isSuperAdmin) return Object.keys(ROUTE_PERMISSIONS);
    
    return Object.keys(ROUTE_PERMISSIONS).filter(route => canAccessRoute(route));
  };

  // 🔧 DEBUG: Função para diagnosticar problemas de permissão
  const debugRouteAccess = (route: string) => {
    console.group(`🔍 Route Access Debug: ${route}`);
    console.log('Loading:', isLoading);
    console.log('Is SuperAdmin:', isSuperAdmin);
    console.log('Required Permissions:', ROUTE_PERMISSIONS[route] || 'None (public route)');
    console.log('User Permissions:', permissions);
    console.log('Can Access:', canAccessRoute(route));
    
    if (ROUTE_PERMISSIONS[route] && !isSuperAdmin) {
      const missingPermissions = ROUTE_PERMISSIONS[route].filter(
        perm => !permissions.includes(perm)
      );
      if (missingPermissions.length > 0) {
        console.warn('Missing Permissions:', missingPermissions);
      }
    }
    console.groupEnd();
  };

  return {
    canAccessRoute,
    getAccessibleRoutes,
    debugRouteAccess,
    isLoading,
    isSuperAdmin
  };
};
