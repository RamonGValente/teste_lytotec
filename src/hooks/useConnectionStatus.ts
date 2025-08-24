
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionStatus {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  lastCheck: Date;
}

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    lastCheck: new Date()
  });

  const checkingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Verificação otimizada com timeout mais curto
  const checkSupabaseConnection = async (): Promise<boolean> => {
    if (checkingRef.current) return connectionStatus.isSupabaseConnected;
    checkingRef.current = true;

    try {
      // Query mais simples e rápida - apenas teste de conectividade
      const { error } = await Promise.race([
        supabase.from('profiles').select('count', { count: 'exact', head: true }),
        new Promise<{ error: any }>((_, reject) => 
          setTimeout(() => reject({ error: new Error('timeout') }), 1500) // Reduzido para 1.5s
        )
      ]);
      
      checkingRef.current = false;
      return !error;
    } catch {
      checkingRef.current = false;
      return false;
    }
  };

  const updateConnectionStatus = async () => {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      setConnectionStatus({
        isOnline: false,
        isSupabaseConnected: false,
        lastCheck: new Date()
      });
      return;
    }

    const isSupabaseConnected = await checkSupabaseConnection();
    
    setConnectionStatus({
      isOnline,
      isSupabaseConnected,
      lastCheck: new Date()
    });
  };

  useEffect(() => {
    // Verificação inicial mais rápida
    const initialCheck = setTimeout(updateConnectionStatus, 100);

    const handleOnline = () => {
      console.log('🌐 Conexão restaurada');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(updateConnectionStatus, 300); // Mais rápido
    };

    const handleOffline = () => {
      console.log('📵 Conexão perdida');
      setConnectionStatus(prev => ({
        ...prev,
        isOnline: false,
        isSupabaseConnected: false,
        lastCheck: new Date()
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação periódica reduzida
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        updateConnectionStatus();
      }
    }, 45000); // 45 segundos

    return () => {
      clearTimeout(initialCheck);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return {
    ...connectionStatus,
    refresh: updateConnectionStatus
  };
};
