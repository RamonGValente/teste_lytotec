import React, { useState, useEffect } from 'react';
import { safeToast } from '@/utils/safeToast';

interface SafeModalWrapperProps {
  children: React.ReactNode;
  onError?: () => void;
  fallbackComponent?: React.ReactNode;
}

const SafeModalWrapper: React.FC<SafeModalWrapperProps> = ({ 
  children, 
  onError,
  fallbackComponent 
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset error state when children change
    setHasError(false);
    setRetryCount(0);
  }, [children]);

  const handleError = () => {
    console.warn('🚨 Modal Error interceptado - implementando retry');
    
    if (retryCount < 2) {
      // Retry automático
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setHasError(false);
      }, 300);
    } else {
      setHasError(true);
      onError?.();
      safeToast.error('Erro no modal. Tente novamente em alguns segundos.');
    }
  };

  if (hasError) {
    return fallbackComponent || (
      <div className="p-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Erro temporário. 
        </p>
        <button 
          onClick={() => {
            setHasError(false);
            setRetryCount(0);
          }}
          className="text-xs px-2 py-1 bg-muted rounded"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div 
      onError={handleError}
      style={{ 
        isolation: 'isolate' // CSS containment para isolar erros
      }}
    >
      {children}
    </div>
  );
};

export default SafeModalWrapper;