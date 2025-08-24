
import React from 'react';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAny?: boolean;
}

const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAny = true
}) => {
  const { canAccess, isLoading } = usePermissionGuard({
    requiredPermission,
    requiredPermissions,
    requireAny
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Verificando permissões...</span>
      </div>
    );
  }

  if (!canAccess) {
    return null; // O usePermissionGuard já faz o redirect
  }

  return <>{children}</>;
};

export default RouteProtection;
