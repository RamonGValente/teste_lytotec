import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDynamicPermissions } from '@/hooks/useDynamicPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface SecureRouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallbackRoute?: string;
}

const SecureRouteGuard: React.FC<SecureRouteGuardProps> = ({ 
  children, 
  requiredPermission, 
  requiredPermissions,
  fallbackRoute = '/dashboard'
}) => {
  const location = useLocation();
  const { isSuperAdmin, permissions, isLoading, userId } = useDynamicPermissions();

  console.log('🔒 [SECURE ROUTE] Verificando acesso:', {
    route: location.pathname,
    requiredPermission,
    requiredPermissions,
    userPermissions: permissions,
    isSuperAdmin,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Verificando permissões de acesso...</span>
      </div>
    );
  }

  // SuperAdmin sempre tem acesso
  if (isSuperAdmin) {
    console.log('✅ [SECURE ROUTE] SuperAdmin - Acesso liberado');
    return <>{children}</>;
  }

  // Verificar se não há usuário autenticado
  if (!userId) {
    console.log('🔄 [SECURE ROUTE] Usuário não autenticado - redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Verificar permissão específica
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    console.log('❌ [SECURE ROUTE] Permissão negada:', requiredPermission);
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página.
            <br />
            <small className="text-muted-foreground">
              Permissão necessária: {requiredPermission}
            </small>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar múltiplas permissões (pelo menos uma)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAnyPermission = requiredPermissions.some(perm => permissions.includes(perm));
    if (!hasAnyPermission) {
      console.log('❌ [SECURE ROUTE] Nenhuma permissão necessária encontrada:', requiredPermissions);
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <ShieldX className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página.
              <br />
              <small className="text-muted-foreground">
                Permissões necessárias: {requiredPermissions.join(' ou ')}
              </small>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  console.log('✅ [SECURE ROUTE] Acesso liberado para:', location.pathname);
  return <>{children}</>;
};

export default SecureRouteGuard;