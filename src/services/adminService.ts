
import { supabase } from "@/integrations/supabase/client";

export const confirmUserEmail = async (email: string) => {
  try {
    console.log(`🔧 Confirmando email via função edge: ${email}`);
    
    const { data, error } = await supabase.functions.invoke('admin-confirm-email', {
      body: { email }
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Erro ao confirmar email:", error);
    throw new Error(error.message || "Erro ao confirmar email do usuário");
  }
};

export const confirmUserEmailWithPassword = async (email: string) => {
  try {
    console.log(`🔑 Confirmando email com senha temporária via função edge: ${email}`);
    
    const { data, error } = await supabase.functions.invoke('admin-confirm-email', {
      body: { 
        email,
        setTemporaryPassword: true
      }
    });

    if (error) {
      throw error;
    }

    return { 
      success: true, 
      message: data?.message || `Email ${email} confirmado com sucesso`,
      temporaryPassword: data?.temporary_password,
      hasPassword: data?.has_password || false,
      data
    };
  } catch (error: any) {
    console.error("Erro ao confirmar email com senha:", error);
    throw new Error(error.message || "Erro ao confirmar email e definir senha do usuário");
  }
};

// Função genérica para confirmar qualquer email de usuário válido
export const confirmSpecificUserEmail = async (email?: string) => {
  try {
    // Se não for fornecido email, usar o email hardcoded original como fallback
    const targetEmail = email || "xmatheus457@gmail.com";
    
    console.log(`🔧 Confirmando email específico: ${targetEmail}`);
    
    // Verificar se o usuário existe em bd_funcionarios primeiro
    const { data: funcionario, error: funcError } = await supabase
      .from('bd_funcionarios')
      .select('email, nome_completo')
      .eq('email', targetEmail)
      .single();

    if (funcError || !funcionario) {
      throw new Error(`Usuário ${targetEmail} não encontrado na base de funcionários`);
    }

    const result = await confirmUserEmail(targetEmail);
    console.log(`✅ Email ${targetEmail} confirmado com sucesso:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Erro ao confirmar email ${email}:`, error);
    throw error;
  }
};

// Nova função para listar usuários que precisam de sincronização
export const listUsersNeedingSync = async () => {
  try {
    console.log('📋 Listando usuários que podem precisar de sincronização...');
    
    // Buscar todos os funcionários ativos
    const { data: funcionarios, error } = await supabase
      .from('bd_funcionarios')
      .select('email, nome_completo, status')
      .eq('status', 'Ativo');

    if (error) throw error;

    console.log(`📊 Encontrados ${funcionarios?.length || 0} funcionários ativos`);
    return funcionarios || [];
  } catch (error) {
    console.error('❌ Erro ao listar funcionários:', error);
    return [];
  }
};
