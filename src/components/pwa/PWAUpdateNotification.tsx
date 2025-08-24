
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { useState } from 'react';

export const PWAUpdateNotification: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePWAUpdate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!updateAvailable || isDismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    await applyUpdate();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 p-4 bg-green-600 text-white shadow-lg border-0 md:left-auto md:right-4 md:w-96">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Nova versão disponível</h3>
          <p className="text-xs opacity-90 mt-1">
            Uma atualização do sistema está pronta para ser instalada
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="text-green-600"
          >
            {isUpdating ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20"
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
