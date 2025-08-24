
import { useState } from 'react';
import { diagnoseUser, syncExistingUser, confirmUserEmail } from '@/services/authRecoveryService';
import { useToast } from '@/hooks/use-toast';

interface AuthRecoveryResult {
  success: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
  needsRegistration?: boolean;
}

export const useAuthRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const recoverUser = async (email: string): Promise<AuthRecoveryResult> => {
    setIsRecovering(true);
    
    try {
      console.log(`🚀 Iniciando recuperação para: ${email}`);
      
      // Diagnóstico primeiro
      const diagnosis = await diagnoseUser(email);
      console.log('📋 Diagnóstico completo:', diagnosis);
      
      // Tentar sincronização
      const result = await syncExistingUser(email);
      
      if (result.success) {
        toast({
          title: "Usuário recuperado com sucesso! ✅",
          description: "Agora você pode fazer login normalmente.",
        });
        return { success: true };
      } else {
        let errorMessage = result.message || 'Erro na recuperação';
        let actionNeeded = '';
        let needsRegistration = false;
        let needsEmailConfirmation = false;
        
        if (result.needsRegistration) {
          needsRegistration = true;
          actionNeeded = 'Por favor, complete o registro primeiro.';
        } else if (result.needsEmailConfirmation) {
          needsEmailConfirmation = true;
          actionNeeded = 'Tentando confirmar email automaticamente...';
          
          // Tentar confirmação automática
          const confirmResult = await confirmUserEmail(email);
          if (confirmResult.success) {
            toast({
              title: "Email confirmado! ✅",
              description: "Agora você pode tentar fazer login.",
            });
            return { success: true };
          }
        }
        
        toast({
          title: "Problema na recuperação",
          description: `${errorMessage}. ${actionNeeded}`,
          variant: "destructive",
        });
        
        return { 
          success: false, 
          message: errorMessage, 
          needsRegistration,
          needsEmailConfirmation
        };
      }
    } catch (error: any) {
      console.error('❌ Erro na recuperação:', error);
      toast({
        title: "Erro na recuperação",
        description: "Entre em contato com o suporte técnico.",
        variant: "destructive",
      });
      return { 
        success: false, 
        message: error.message,
        needsRegistration: false,
        needsEmailConfirmation: false
      };
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    recoverUser,
    isRecovering
  };
};
