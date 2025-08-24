
import React from 'react';
import { useConnectionCheck } from '@/hooks/useConnectionCheck';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline } = useConnectionCheck();

  // Só mostra quando realmente offline
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="font-medium text-orange-800">
              Modo Offline
            </span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Sem conexão com a internet. Alguns recursos podem estar limitados.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};
