
import { useState, useEffect, useCallback } from "react";
import { getUserPermissions } from "@/services/permissaoService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Enhanced hook for handling user permissions and roles with improved fallbacks
 * Provides permissions data and permission checking logic with hierarchical support
 */
export const useUserPermissions = () => {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionRoutes, setPermissionRoutes] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [mainRoleId, setMainRoleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (authLoading) return;
      
      try {
        setIsLoading(true);
        
        if (!isAuthenticated || !userId) {
          console.log("🔐 User not authenticated, clearing permissions");
          setUserPermissions([]);
          setPermissionRoutes([]);
          setUserRoles([]);
          setMainRoleId(null);
          setIsSuperAdmin(false);
          return;
        }
        
        console.log("🔄 Fetching permissions for user:", userId);
        
        // Get user permissions with enhanced error handling
        const permissions = await getUserPermissions(userId);
        
        // Check if user has SuperAdm role (with fallback checking)
        const hasSuperAdminRole = permissions.roles.some(role => 
          role.toLowerCase() === "superadm" || 
          role.toLowerCase() === "superadmin" ||
          role.toLowerCase() === "super admin"
        );
        
        // Set core permission data
        setUserPermissions(permissions.permissions || []);
        setPermissionRoutes(permissions.permissionRoutes || []);
        setUserRoles(permissions.roles || []);
        setMainRoleId(permissions.mainRoleId);
        setIsSuperAdmin(hasSuperAdminRole);
        
        // Enhanced logging for better debugging
        console.group("🔑 User Permissions Loaded Successfully");
        console.log("User ID:", userId);
        console.log("Roles:", permissions.roles);
        console.log("Main Role ID:", permissions.mainRoleId);
        console.log("Is SuperAdmin:", hasSuperAdminRole);
        console.log("Permissions Count:", permissions.permissions?.length || 0);
        console.log("Permission Routes Count:", permissions.permissionRoutes?.length || 0);
        
        // Log specific permissions for key functions
        const keyPermissions = [
          'dashboard_view',
          'registro_aplicacao_view',
          'gestao_maquinas_relatorio_medicao_view',
          'acesso_dashboard_rh'
        ];
        
        keyPermissions.forEach(perm => {
          const hasPermission = permissions.permissions?.includes(perm);
          console.log(`${perm}: ${hasPermission ? '✅' : '❌'}`);
        });
        
        console.groupEnd();
        
        // Warn if user has no permissions (potential configuration issue)
        if (!hasSuperAdminRole && (!permissions.permissions?.length && !permissions.roles?.length)) {
          console.warn("⚠️ User has no permissions or roles assigned. This may indicate a configuration issue.");
        }
        
      } catch (error) {
        console.error("❌ Error fetching permissions:", error);
        
        // Enhanced error handling - provide minimal fallback for authenticated users
        if (isAuthenticated) {
          console.log("🔄 Applying fallback permissions for authenticated user");
          setUserPermissions(['dashboard_view']); // Minimal fallback
          setPermissionRoutes(['/dashboard', '/']);
          setUserRoles(['user']); // Basic user role as fallback
        } else {
          setUserPermissions([]);
          setPermissionRoutes([]);
          setUserRoles([]);
        }
        
        setMainRoleId(null);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPermissions();
  }, [userId, isAuthenticated, authLoading]);

  // Enhanced permission checking with role-based fallbacks
  const hasPermission = useCallback((permission: string) => {
    if (isLoading) {
      console.log(`[Permission Check] Still loading, denying access to: ${permission}`);
      return false;
    }
    
    if (isSuperAdmin) {
      console.log(`[Permission Check] SuperAdmin access granted for: ${permission}`);
      return true;
    }
    
    // Direct permission check
    const hasDirectPermission = userPermissions.includes(permission);
    if (hasDirectPermission) {
      console.log(`[Permission Check] Direct permission granted: ${permission}`);
      return true;
    }
    
    // Role-based fallbacks for critical permissions
    const roleBasedFallbacks: Record<string, string[]> = {
      'dashboard_view': ['AdmRH', 'AdmEquipamentos', 'AdmRequisicoes', 'AdmLogistica', 'AdmAdmin', 'Apontador', 'Encarregado', 'Engenheiro Civil'],
      'registro_aplicacao_view': ['Apontador', 'Encarregado', 'AdmLogistica', 'AdmRequisicoes', 'Engenheiro Civil'],
      'gestao_maquinas_relatorio_medicao_view': ['AdmEquipamentos', 'Encarregado', 'AdmLogistica'],
      'acesso_dashboard_rh': ['AdmRH'],
      'programacao_entrega_view': ['Apontador', 'Encarregado', 'AdmLogistica', 'AdmRequisicoes', 'Engenheiro Civil']
    };
    
    const allowedRoles = roleBasedFallbacks[permission];
    if (allowedRoles) {
      const hasRoleAccess = allowedRoles.some(role => userRoles.includes(role));
      if (hasRoleAccess) {
        console.log(`[Permission Check] Role-based access granted for ${permission} via roles:`, userRoles.filter(role => allowedRoles.includes(role)));
        return true;
      }
    }
    
    console.log(`[Permission Check] Access denied for: ${permission}`);
    return false;
  }, [isLoading, isSuperAdmin, userPermissions, userRoles]);

  // Enhanced debugging function
  const debugPermissions = useCallback(async () => {
    console.group("🔎 Enhanced Permissions Debug");
    console.log("Loading state:", isLoading);
    console.log("User ID:", userId);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Is SuperAdmin:", isSuperAdmin);
    console.log("Current roles:", userRoles);
    console.log("Main role ID:", mainRoleId);
    console.log("Current permissions:", userPermissions);
    console.log("Permission routes:", permissionRoutes);
    
    // Test key permissions
    const testPermissions = [
      'dashboard_view',
      'registro_aplicacao_view', 
      'gestao_maquinas_relatorio_medicao_view',
      'acesso_dashboard_rh'
    ];
    
    console.log("Permission test results:");
    testPermissions.forEach(perm => {
      console.log(`  ${perm}: ${hasPermission(perm) ? '✅' : '❌'}`);
    });
    
    console.groupEnd();
  }, [isLoading, userId, isAuthenticated, isSuperAdmin, userRoles, mainRoleId, userPermissions, permissionRoutes, hasPermission]);

  return {
    userId,
    userRoles,
    mainRoleId,
    userPermissions,
    permissionRoutes,
    isLoading: isLoading || authLoading,
    isSuperAdmin,
    hasPermission,
    debugPermissions,
  };
};
