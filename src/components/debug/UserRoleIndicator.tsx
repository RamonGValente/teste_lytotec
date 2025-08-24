import React from 'react';
import { useDynamicPermissions } from '@/hooks/useDynamicPermissions';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Shield } from 'lucide-react';

const UserRoleIndicator: React.FC = () => {
  const { userRole, isSuperAdmin, permissions, isLoading } = useDynamicPermissions();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
        <span>Carregando...</span>
      </Badge>
    );
  }

  const getRoleIcon = () => {
    if (isSuperAdmin) return Crown;
    if (userRole?.includes('Adm')) return Shield;
    return User;
  };

  const getRoleColor = () => {
    if (isSuperAdmin) return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (userRole?.includes('Adm')) return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (userRole?.includes('Encarregado')) return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    if (userRole?.includes('Apontador')) return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
  };

  const Icon = getRoleIcon();

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`flex items-center gap-1 text-xs font-medium ${getRoleColor()}`}>
        <Icon className="h-3 w-3" />
        <span>{userRole || 'Usuário'}</span>
      </Badge>
      <div className="text-xs text-muted-foreground">
        {permissions.length} permissões
      </div>
    </div>
  );
};

export default UserRoleIndicator;