import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { getUserOfflineContext } from '@/utils/offlinePermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const OfflinePermissionStatus: React.FC = () => {
  const { isSupabaseConnected } = useConnectionStatus();
  const offlineContext = getUserOfflineContext();

  // Não mostrar se está online e tem contexto
  if (isSupabaseConnected) return null;

  const hasOfflineContext = !!offlineContext;
  const permissionCount = offlineContext?.permissions.length || 0;
  const isSuperAdmin = offlineContext?.isSuperAdmin || false;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
            <WifiOff className="h-4 w-4 text-amber-600" />
            
            {hasOfflineContext ? (
              <>
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="text-xs">
                  {isSuperAdmin ? 'Admin' : `${permissionCount} perms`}
                </Badge>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-red-600" />
                <Badge variant="destructive" className="text-xs">
                  Sem permissões
                </Badge>
              </>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Status Offline</p>
            {hasOfflineContext ? (
              <>
                <p>✅ Permissões disponíveis offline</p>
                <p>👤 Usuário: {offlineContext.email}</p>
                <p>🔑 Tipo: {isSuperAdmin ? 'Super Admin' : offlineContext.userRole || 'Usuário'}</p>
                <p>📋 Permissões: {permissionCount}</p>
              </>
            ) : (
              <>
                <p>❌ Sem contexto de permissões</p>
                <p>⚠️ Funcionalidades offline limitadas</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};