
import { useAuthPermissions } from './useAuthPermissions';
import { useRouteAccess } from './useRouteAccess';

/**
 * Hook para debugging completo do sistema de permissões
 * Útil para diagnosticar problemas no mobile e desktop
 */
export const usePermissionDebug = () => {
  const authPermissions = useAuthPermissions();
  const routeAccess = useRouteAccess();

  const runFullDiagnostic = () => {
    console.group('🔐 PERMISSION SYSTEM DIAGNOSTIC');
    
    // 1. Auth Status
    console.group('📊 Auth Status');
    console.log('User ID:', authPermissions.userId);
    console.log('Is Loading:', authPermissions.isLoading);
    console.log('Is SuperAdmin:', authPermissions.isSuperAdmin);
    console.log('User Role:', authPermissions.userRole);
    console.groupEnd();
    
    // 2. Permissions List
    console.group('🎫 User Permissions');
    console.log('Total Permissions:', authPermissions.permissions.length);
    authPermissions.permissions.forEach((perm, index) => {
      console.log(`${index + 1}. ${perm}`);
    });
    console.groupEnd();
    
    // 3. Critical Routes Test
    console.group('🛣️ Critical Routes Access Test');
    const criticalRoutes = [
      '/dashboard',
      '/gestao-maquinas/dashboard',
      '/gestao-maquinas/relatorio-medicao',
      '/admin/permissoes'
    ];
    
    criticalRoutes.forEach(route => {
      const canAccess = routeAccess.canAccessRoute(route);
      console.log(`${canAccess ? '✅' : '❌'} ${route}`);
      if (!canAccess && !authPermissions.isSuperAdmin) {
        routeAccess.debugRouteAccess(route);
      }
    });
    console.groupEnd();
    
    // 4. Mobile/Environment Info
    console.group('📱 Environment Info');
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    console.log('Is Mobile:', /Mobi|Android/i.test(navigator.userAgent));
    console.log('Local Storage Available:', typeof(Storage) !== "undefined");
    console.groupEnd();
    
    console.groupEnd();
  };

  const testSpecificRoute = (route: string) => {
    console.group(`🧪 Testing Route: ${route}`);
    
    const canAccess = routeAccess.canAccessRoute(route);
    console.log('Result:', canAccess ? 'ALLOWED' : 'DENIED');
    
    if (!canAccess) {
      routeAccess.debugRouteAccess(route);
      
      // Sugerir soluções
      console.group('💡 Possible Solutions');
      if (authPermissions.isLoading) {
        console.log('- Wait for permissions to load');
      }
      if (!authPermissions.userId) {
        console.log('- User needs to login');
      }
      if (!authPermissions.isSuperAdmin && authPermissions.permissions.length === 0) {
        console.log('- User has no permissions assigned');
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  };

  return {
    runFullDiagnostic,
    testSpecificRoute,
    authPermissions,
    routeAccess
  };
};
