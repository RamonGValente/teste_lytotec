
import { useEffect, useState } from 'react';

export const useModalDebug = (modalName: string, isOpen: boolean) => {
  const [debugInfo, setDebugInfo] = useState({
    openCount: 0,
    closeCount: 0,
    lastAction: 'none',
    timestamp: Date.now()
  });

  useEffect(() => {
    if (isOpen) {
      const newInfo = {
        openCount: debugInfo.openCount + 1,
        closeCount: debugInfo.closeCount,
        lastAction: 'opened',
        timestamp: Date.now()
      };
      
      console.log(`🔍 [${modalName}] Modal ABERTO:`, {
        ...newInfo,
        timeFromLastAction: Date.now() - debugInfo.timestamp
      });
      
      setDebugInfo(newInfo);
    } else if (!isOpen && debugInfo.lastAction === 'opened') {
      const newInfo = {
        openCount: debugInfo.openCount,
        closeCount: debugInfo.closeCount + 1,
        lastAction: 'closed',
        timestamp: Date.now()
      };
      
      console.log(`🔍 [${modalName}] Modal FECHADO:`, {
        ...newInfo,
        timeFromLastAction: Date.now() - debugInfo.timestamp
      });
      
      setDebugInfo(newInfo);
    }
  }, [isOpen, modalName, debugInfo]);

  const logAction = (action: string, data?: any) => {
    console.log(`🔍 [${modalName}] ${action}:`, data);
  };

  return { debugInfo, logAction };
};
