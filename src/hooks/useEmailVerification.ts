
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailVerificationResult {
  isAuthorized: boolean;
  isChecking: boolean;
  error: string | null;
}

export const useEmailVerification = () => {
  const [verificationState, setVerificationState] = useState<EmailVerificationResult>({
    isAuthorized: false,
    isChecking: false,
    error: null
  });

  const verifyEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      setVerificationState({ isAuthorized: false, isChecking: false, error: null });
      return false;
    }

    setVerificationState({ isAuthorized: false, isChecking: true, error: null });
    
    const attemptVerification = async (retryCount = 0): Promise<boolean> => {
      try {
        console.log(`🔍 [TENTATIVA ${retryCount + 1}] Verificando autorização do email:`, email);
        
        // Verificação principal: bd_funcionarios
        const { data, error } = await supabase
          .from("bd_funcionarios")
          .select("email, nome_completo, status")
          .eq("email", email.trim().toLowerCase())
          .single();

        if (error) {
          console.error(`❌ [TENTATIVA ${retryCount + 1}] Erro ao verificar email:`, {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Verificar se é erro de tabela não encontrada (problema de cache)
          if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
            console.warn("⚠️ Erro de tabela não encontrada - possível problema de cache");
            
            if (retryCount < 2) {
              console.log(`🔄 Tentando novamente em 1 segundo... (tentativa ${retryCount + 2}/3)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return attemptVerification(retryCount + 1);
            } else {
              setVerificationState({ 
                isAuthorized: false, 
                isChecking: false, 
                error: "Erro temporário no sistema. Limpe o cache do navegador e tente novamente." 
              });
              return false;
            }
          }
          
          // Fallback: tentar contagem
          console.log("🔄 Tentando verificação alternativa por contagem...");
          const { count, error: countError } = await supabase
            .from("bd_funcionarios")
            .select("*", { count: "exact", head: true })
            .eq("email", email.trim().toLowerCase());
            
          if (countError) {
            console.error("❌ Erro na verificação alternativa:", countError);
            
            if (retryCount < 2) {
              console.log(`🔄 Tentando novamente em 1 segundo... (tentativa ${retryCount + 2}/3)`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return attemptVerification(retryCount + 1);
            } else {
              setVerificationState({ 
                isAuthorized: false, 
                isChecking: false, 
                error: "Erro ao verificar email. Tente novamente ou limpe o cache do navegador." 
              });
              return false;
            }
          }
          
          const isAuthorized = (count || 0) > 0;
          console.log(`✅ Verificação por contagem: ${isAuthorized ? 'autorizado' : 'não autorizado'} (${count} registros)`);
          
          setVerificationState({ 
            isAuthorized, 
            isChecking: false, 
            error: isAuthorized ? null : "Email não está autorizado para cadastro" 
          });
          return isAuthorized;
        }

        console.log("✅ Dados do funcionário encontrados:", { 
          email: data.email, 
          nome: data.nome_completo, 
          status: data.status 
        });

        // Verificar se funcionário está ativo
        const isActive = !data.status || data.status === 'Ativo';
        const isAuthorized = !!data && isActive;
        
        let errorMessage = null;
        if (!isAuthorized) {
          if (!isActive) {
            errorMessage = "Funcionário não está ativo no sistema";
            console.warn(`⚠️ Funcionário inativo: ${email} - Status: ${data.status}`);
          } else {
            errorMessage = "Este email não está autorizado para cadastro";
            console.warn(`⚠️ Email não autorizado: ${email}`);
          }
        }
        
        setVerificationState({ 
          isAuthorized, 
          isChecking: false, 
          error: errorMessage 
        });
        
        console.log(`✅ Email ${email} ${isAuthorized ? 'autorizado' : 'não autorizado'}`);
        return isAuthorized;
        
      } catch (error) {
        console.error(`❌ [TENTATIVA ${retryCount + 1}] Erro geral ao verificar email:`, error);
        
        if (retryCount < 2) {
          console.log(`🔄 Tentando novamente em 1 segundo... (tentativa ${retryCount + 2}/3)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptVerification(retryCount + 1);
        } else {
          setVerificationState({ 
            isAuthorized: false, 
            isChecking: false, 
            error: "Erro de conexão. Verifique sua internet, limpe o cache do navegador e tente novamente." 
          });
          return false;
        }
      }
    };

    return attemptVerification();
  }, []);

  const clearVerification = useCallback(() => {
    setVerificationState({ isAuthorized: false, isChecking: false, error: null });
  }, []);

  return {
    ...verificationState,
    verifyEmail,
    clearVerification
  };
};
