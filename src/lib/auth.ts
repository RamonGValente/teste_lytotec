
import { supabase } from "@/integrations/supabase/client";

interface AuthResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
  data?: any;
}

/**
 * Obtém o usuário atual autenticado
 * @returns Objeto com os dados do usuário ou null se não estiver autenticado
 */
export const getCurrentUser = async () => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("❌ Erro ao obter sessão:", sessionError);
      return null;
    }
    
    if (!sessionData.session) {
      console.log("Nenhuma sessão ativa encontrada");
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("❌ Erro ao buscar perfil do usuário:", profileError);
      // Retorna apenas os dados do usuário da autenticação
      return sessionData.session.user;
    }
    
    // Retorna dados do usuário combinados com o perfil
    return {
      ...sessionData.session.user,
      ...profileData
    };
  } catch (error: any) {
    console.error("❌ Exceção ao buscar usuário atual:", error);
    return null;
  }
};

/**
 * Realiza o login do usuário com tratamento melhorado para emails não confirmados
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Objeto com o resultado da operação
 */
export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    console.log("Tentando login com email:", email);
    
    // Tenta realizar o login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Erro no supabase login:", error);
      
      // Tratamento específico para email não confirmado
      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: {
            message: "Email não confirmado. Entre em contato com o administrador para confirmar seu email.",
            code: error.code
          }
        };
      }
      
      // Tratamento específico para erros de conexão
      if (error.message.includes("connection") || error.message.includes("network") || error.message.includes("fetch")) {
        return {
          success: false,
          error: {
            message: "Erro de conexão. Verifique sua internet e tente novamente.",
            code: error.code
          }
        };
      }
      
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    if (!data || !data.session) {
      console.error("Login bem-sucedido, mas não retornou sessão");
      return {
        success: false,
        error: {
          message: "Falha ao criar sessão. Tente novamente."
        }
      };
    }
    
    console.log("Login bem-sucedido, sessão criada");
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error("Exceção no processo de login:", error);
    return {
      success: false,
      error: {
        message: error.message || "Ocorreu um erro inesperado durante o login"
      }
    };
  }
};

/**
 * Registra um novo usuário
 * @param email Email do usuário
 * @param password Senha do usuário
 * @param nome_completo Nome completo do usuário
 * @returns Objeto com o resultado da operação
 */
export const registerUser = async (
  email: string,
  password: string,
  nome_completo: string
): Promise<AuthResult> => {
  try {
    console.log("Tentando registrar usuário:", email);
    
    // Verifica se o email já está em uso
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    
    if (existingUsers) {
      return {
        success: false,
        error: {
          message: "Este email já está registrado"
        }
      };
    }
    
    // Determina a URL de redirecionamento baseada no ambiente
    const isLocalhost = window.location.hostname === 'localhost';
    const redirectTo = isLocalhost ? `${window.location.origin}/` : "https://lytotec.com.br/";
    
    console.log("📧 URL de redirecionamento para registro:", redirectTo);
    
    // Registra o usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo,
          email,
          email_verified: false
        },
        emailRedirectTo: redirectTo
      }
    });
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Ocorreu um erro inesperado durante o registro"
      }
    };
  }
};

/**
 * Realiza o logout do usuário
 * @returns Objeto com o resultado da operação
 */
export const logoutUser = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Ocorreu um erro inesperado durante o logout"
      }
    };
  }
};

/**
 * Envia email para redefinição de senha
 * @param email Email do usuário
 * @returns Objeto com o resultado da operação
 */
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    // Determina a URL de redirecionamento baseada no ambiente
    const isLocalhost = window.location.hostname === 'localhost';
    const redirectTo = isLocalhost 
      ? `${window.location.origin}/reset-password`
      : "https://lytotec.com.br/reset-password";
    
    console.log("🔐 URL de redirecionamento para reset de senha:", redirectTo);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Ocorreu um erro inesperado ao solicitar redefinição de senha"
      }
    };
  }
};

/**
 * Atualiza a senha do usuário
 * @param newPassword Nova senha
 * @returns Objeto com o resultado da operação
 */
export const updatePassword = async (newPassword: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }
    
    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || "Ocorreu um erro inesperado ao atualizar a senha"
      }
    };
  }
};
