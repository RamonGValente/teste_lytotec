
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent } from '@/components/ui/card';

export const OfflineStatusIndicator: React.FC = () => {
  const { isOnline, isSupabaseConnected } = useConnectionStatus();
  const { syncStatus, sincronizarTodos } = useOfflineSync();

  if (isOnline && isSupabaseConnected && syncStatus.pendingCount === 0) {
    return null; // Não mostrar quando tudo está normal
  }

  return (
    <Card className="fixed top-20 right-4 z-50 w-80 bg-white shadow-lg border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className={`h-4 w-4 ${isSupabaseConnected ? 'text-green-600' : 'text-yellow-600'}`} />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            
            <Badge variant={isSupabaseConnected ? "default" : "destructive"}>
              {isOnline 
                ? (isSupabaseConnected ? "Online" : "Conectando...") 
                : "Offline"
              }
            </Badge>
          </div>

          {syncStatus.pendingCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {syncStatus.pendingCount} pendente(s)
            </Badge>
          )}
        </div>

        {syncStatus.pendingCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {syncStatus.pendingCount} apontamento(s) aguardando sincronização
            </p>
            
            {isSupabaseConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={sincronizarTodos}
                disabled={syncStatus.isSyncing}
                className="w-full"
              >
                {syncStatus.isSyncing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Sincronizar agora
                  </>
                )}
              </Button>
            )}
            
            {syncStatus.lastSync && (
              <p className="text-xs text-muted-foreground">
                Última sync: {syncStatus.lastSync.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {!isOnline && (
          <p className="text-sm text-muted-foreground">
            Modo offline ativo. Dados serão sincronizados automaticamente quando a conexão for restaurada.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
