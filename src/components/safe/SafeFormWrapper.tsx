import React, { useState, useCallback } from 'react';
import { safeToast } from '@/utils/safeToast';

interface SafeFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  formData?: any;
  maxRetries?: number;
}

const SafeFormWrapper: React.FC<SafeFormWrapperProps> = ({ 
  children, 
  onSubmit,
  formData,
  maxRetries = 2
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFormData, setLastFormData] = useState<any>(null);

  const handleSafeSubmit = useCallback(async (data: any) => {
    setLastFormData(data); // Backup dos dados
    
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      setRetryCount(0); // Reset em caso de sucesso
    } catch (error: any) {
      console.warn('🚨 Form submission error:', error?.message);
      
      // Detectar se é erro da plataforma
      const isPlatformError = 
        error?.message?.includes('UserMessageID') ||
        error?.message?.includes('TypeID') ||
        error?.message?.includes('must be a valid');
      
      if (isPlatformError && retryCount < maxRetries) {
        safeToast.info(`Tentativa ${retryCount + 1} de ${maxRetries + 1}...`);
        
        setTimeout(async () => {
          setRetryCount(prev => prev + 1);
          try {
            await onSubmit(lastFormData);
            safeToast.success('Dados salvos com sucesso!');
          } catch (retryError) {
            safeToast.error('Erro persistente. Dados salvos localmente.');
            // Salvar no localStorage como backup
            localStorage.setItem('form_backup', JSON.stringify({
              data: lastFormData,
              timestamp: Date.now(),
              type: 'form_submission'
            }));
          }
        }, 1000);
      } else {
        throw error; // Re-throw para handling normal
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, retryCount, maxRetries, lastFormData]);

  return (
    <div data-safe-form="true">
      {React.cloneElement(children as React.ReactElement, {
        onSubmit: handleSafeSubmit,
        disabled: isSubmitting
      })}
    </div>
  );
};

export default SafeFormWrapper;