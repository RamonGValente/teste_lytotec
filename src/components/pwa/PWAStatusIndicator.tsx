import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Badge } from '@/components/ui/badge';

export const PWAStatusIndicator: React.FC = () => {
  const { isOnline, isSupabaseConnected } = useConnectionStatus();

  const getStatus = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        label: 'Offline',
        variant: 'destructive' as const,
        className: 'bg-red-500'
      };
    }
    
    if (!isSupabaseConnected) {
      return {
        icon: AlertTriangle,
        label: 'Limitado',
        variant: 'secondary' as const,
        className: 'bg-yellow-500'
      };
    }
    
    return {
      icon: Wifi,
      label: 'Online',
      variant: 'default' as const,
      className: 'bg-green-500'
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <Badge variant={status.variant} className={`flex items-center gap-1 text-xs ${status.className} text-white`}>
      <Icon className="h-3 w-3" />
      <span>{status.label}</span>
    </Badge>
  );
};