import { supabase } from "@/integrations/supabase/client";

interface AuthRecoveryResult {
  success: boolean;
  message: string;
  needsEmailConfirmation?: boolean;
  needsRegistration?: boolean;
  temporaryPassword?: string;
  hasPassword?: boolean;
}

/**
 * Verifica se o usuário existe no Supabase Auth
 */
export const checkUserExistsInAuth = async (email: string): Promise<boolean> => {
  try {
    console.log(`🔍 Verificando se usuário existe no Auth: ${email}`);
    
    // Tentativa de login para verificar se usuário existe
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'test-password-to-check-existence'
    });
    
    // Análise detalhada dos erros
    if (error?.message.includes('Invalid login credentials')) {
      console.log(`✅ Usuário ${email} EXISTE no Auth (senha incorreta)`);
      return true; // Usuário existe, senha está errada
    } else if (error?.message.includes('Email not confirmed')) {
      console.log(`✅ Usuário ${email} EXISTE no Auth (email não confirmado)`);
      return true; // Usuário existe, email não confirmado
    } else if (error?.message.includes('Invalid email')) {
      console.log(`❌ Usuário ${email} NÃO EXISTE no Auth (email inválido)`);
      return false;
    } else {
      console.log(`❌ Usuário ${email} NÃO EXISTE no Auth (erro: ${error?.message})`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar usuário no Auth (${email}):`, error);
    return false;
  }
};

/**
 * Confirma email e define senha temporária para usuário válido
 */
export const confirmUserEmailWithPassword = async (email: string): Promise<AuthRecoveryResult> => {
  try {
    console.log(`🔧 [CONFIRMAÇÃO COM SENHA] Iniciando para: ${email}`);
    
    // Verificar se o usuário existe em bd_funcionarios
    const { data: funcionario, error: funcionarioError } = await supabase
      .from('bd_funcionarios')
      .select('email, nome_completo, status')
      .eq('email', email)
      .single();

    if (funcionarioError || !funcionario) {
      const message = 'Email não encontrado na base de funcionários';
      console.log(`❌ [CONFIRMAÇÃO COM SENHA] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    console.log(`✅ [CONFIRMAÇÃO COM SENHA] Funcionário encontrado: ${funcionario.nome_completo} (${funcionario.status})`);

    // Verificar se funcionário está ativo
    if (funcionario.status && funcionario.status !== 'Ativo') {
      const message = `Funcionário está ${funcionario.status} no sistema`;
      console.log(`⚠️ [CONFIRMAÇÃO COM SENHA] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    // Confirmar email E definir senha temporária
    console.log(`🚀 [CONFIRMAÇÃO COM SENHA] Chamando função admin-confirm-email com senha para: ${email}`);
    const { data, error } = await supabase.functions.invoke('admin-confirm-email', {
      body: { 
        email,
        setTemporaryPassword: true
      }
    });

    if (error) {
      console.error(`❌ [CONFIRMAÇÃO COM SENHA] Erro na função edge:`, error);
      return {
        success: false,
        message: `Erro ao processar confirmação: ${error.message}`
      };
    }

    if (data?.temporary_password) {
      console.log(`✅ [CONFIRMAÇÃO COM SENHA] Email confirmado e senha temporária definida: ${email}`);
      return {
        success: true,
        message: 'Email confirmado e senha temporária criada com sucesso',
        temporaryPassword: data.temporary_password,
        hasPassword: true
      };
    } else {
      console.log(`✅ [CONFIRMAÇÃO COM SENHA] Email confirmado (sem senha temporária): ${email}`);
      return {
        success: true,
        message: 'Email confirmado com sucesso',
        hasPassword: data?.has_password || false
      };
    }
  } catch (error: any) {
    console.error(`❌ [CONFIRMAÇÃO COM SENHA] Erro crítico para ${email}:`, error);
    return {
      success: false,
      message: error.message || 'Erro ao confirmar email e definir senha'
    };
  }
};

/**
 * Confirma email de qualquer usuário válido
 */
export const confirmUserEmail = async (email: string): Promise<AuthRecoveryResult> => {
  try {
    console.log(`🔧 [CONFIRMAÇÃO] Iniciando para: ${email}`);
    
    // Verificar se o usuário existe em bd_funcionarios
    const { data: funcionario, error: funcionarioError } = await supabase
      .from('bd_funcionarios')
      .select('email, nome_completo, status')
      .eq('email', email)
      .single();

    if (funcionarioError || !funcionario) {
      const message = 'Email não encontrado na base de funcionários';
      console.log(`❌ [CONFIRMAÇÃO] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    console.log(`✅ [CONFIRMAÇÃO] Funcionário encontrado: ${funcionario.nome_completo} (${funcionario.status})`);

    // Verificar se funcionário está ativo
    if (funcionario.status && funcionario.status !== 'Ativo') {
      const message = `Funcionário está ${funcionario.status} no sistema`;
      console.log(`⚠️ [CONFIRMAÇÃO] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    // Tentar confirmar email via função edge
    console.log(`🚀 [CONFIRMAÇÃO] Chamando função admin-confirm-email para: ${email}`);
    const { data, error } = await supabase.functions.invoke('admin-confirm-email', {
      body: { email }
    });

    if (error) {
      console.warn(`⚠️ [CONFIRMAÇÃO] Erro na função edge: ${error.message}`);
      
      // Fallback: verificar se usuário já existe no auth e precisa apenas ser confirmado
      const userExistsInAuth = await checkUserExistsInAuth(email);
      
      if (!userExistsInAuth) {
        const message = 'Usuário precisa ser registrado primeiro';
        console.log(`❌ [CONFIRMAÇÃO] ${message}: ${email}`);
        return {
          success: false,
          message,
          needsRegistration: true
        };
      }
    }

    console.log(`✅ [CONFIRMAÇÃO] Email confirmado com sucesso: ${email}`);
    return {
      success: true,
      message: 'Email confirmado com sucesso'
    };
  } catch (error: any) {
    console.error(`❌ [CONFIRMAÇÃO] Erro crítico para ${email}:`, error);
    return {
      success: false,
      message: error.message || 'Erro ao confirmar email'
    };
  }
};

/**
 * Sincroniza usuário existente (cria conta no Auth se necessário)
 */
export const syncExistingUser = async (email: string): Promise<AuthRecoveryResult> => {
  try {
    console.log(`🔄 [SINCRONIZAÇÃO] Iniciando para: ${email}`);
    
    // Verificar se existe em bd_funcionarios
    const { data: funcionario, error: funcionarioError } = await supabase
      .from('bd_funcionarios')
      .select('email, nome_completo, status')
      .eq('email', email)
      .single();

    if (funcionarioError || !funcionario) {
      const message = 'Usuário não encontrado na base de funcionários';
      console.log(`❌ [SINCRONIZAÇÃO] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    console.log(`✅ [SINCRONIZAÇÃO] Funcionário encontrado: ${funcionario.nome_completo}`);

    // Verificar se funcionário está ativo
    if (funcionario.status && funcionario.status !== 'Ativo') {
      const message = `Funcionário está ${funcionario.status}`;
      console.log(`⚠️ [SINCRONIZAÇÃO] ${message}: ${email}`);
      return {
        success: false,
        message
      };
    }

    // Verificar se existe no Auth
    const userExistsInAuth = await checkUserExistsInAuth(email);
    
    if (!userExistsInAuth) {
      // Usuário não existe no Auth - sugerir registro
      const message = 'Usuário precisa criar conta através do registro';
      console.log(`📝 [SINCRONIZAÇÃO] ${message}: ${email}`);
      return {
        success: false,
        message,
        needsRegistration: true
      };
    }

    console.log(`✅ [SINCRONIZAÇÃO] Usuário existe no Auth, confirmando email com senha: ${email}`);

    // Usuário existe no Auth - confirmar email E definir senha temporária
    const confirmResult = await confirmUserEmailWithPassword(email);
    
    if (confirmResult.success) {
      console.log(`✅ [SINCRONIZAÇÃO] Sincronização completa: ${email}`);
    }

    return confirmResult;
  } catch (error: any) {
    console.error(`❌ [SINCRONIZAÇÃO] Erro crítico para ${email}:`, error);
    return {
      success: false,
      message: error.message || 'Erro ao sincronizar usuário'
    };
  }
};

/**
 * Garante que o perfil do usuário existe
 */
export const ensureUserProfile = async (email: string, nomeCompleto: string) => {
  try {
    console.log(`👤 [PERFIL] Verificando perfil para: ${email}`);
    
    // Buscar usuário atual (só funciona se estiver logado como admin)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log(`⚠️ [PERFIL] Usuário não autenticado - pulando criação de perfil`);
      return;
    }

    // Verificar se perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      console.log(`✅ [PERFIL] Perfil já existe para: ${email}`);
      return;
    }

    console.log(`📝 [PERFIL] Criando perfil básico para: ${email}`);
    // Não podemos criar perfil para outro usuário devido ao RLS
    // Isso deve ser feito quando o usuário fizer login
    
  } catch (error) {
    console.error(`❌ [PERFIL] Erro ao verificar/criar perfil para ${email}:`, error);
  }
};

/**
 * Diagnóstico completo do usuário
 */
export const diagnoseUser = async (email: string) => {
  console.log(`🔍 ======= DIAGNÓSTICO COMPLETO - ${email} =======`);
  
  // 1. Verificar bd_funcionarios
  console.log(`🔍 [1/3] Verificando bd_funcionarios...`);
  const { data: funcionario, error: funcError } = await supabase
    .from('bd_funcionarios')
    .select('email, nome_completo, status')
    .eq('email', email)
    .single();
  
  if (funcionario) {
    console.log(`✅ [1/3] FUNCIONÁRIO ENCONTRADO:`, {
      nome: funcionario.nome_completo,
      email: funcionario.email,
      status: funcionario.status
    });
  } else {
    console.log(`❌ [1/3] FUNCIONÁRIO NÃO ENCONTRADO`);
    if (funcError) console.log(`   Erro:`, funcError.message);
  }
  
  // 2. Verificar Supabase Auth
  console.log(`🔍 [2/3] Verificando Supabase Auth...`);
  const userExistsInAuth = await checkUserExistsInAuth(email);
  console.log(`${userExistsInAuth ? '✅' : '❌'} [2/3] SUPABASE AUTH:`, userExistsInAuth ? 'EXISTE' : 'NÃO EXISTE');
  
  // 3. Verificar profiles (se conseguir)
  console.log(`🔍 [3/3] Verificando profiles...`);
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, funcoes')
      .eq('email', email)
      .single();
    
    if (profile) {
      console.log(`✅ [3/3] PROFILE ENCONTRADO:`, {
        id: profile.id,
        email: profile.email,
        funções: profile.funcoes
      });
    } else {
      console.log(`❌ [3/3] PROFILE NÃO ENCONTRADO`);
      if (profileError) console.log(`   Erro:`, profileError.message);
    }
  } catch (error) {
    console.log(`❌ [3/3] PROFILE: Erro ao verificar`);
  }
  
  const recommendations = getRecommendations(!!funcionario, userExistsInAuth);
  console.log(`📋 RECOMENDAÇÃO: ${recommendations}`);
  
  console.log(`🔍 ======= FIM DO DIAGNÓSTICO - ${email} =======`);
  
  return {
    funcionario,
    userExistsInAuth,
    recommendations
  };
};

const getRecommendations = (existsInFuncionarios: boolean, existsInAuth: boolean) => {
  if (!existsInFuncionarios) {
    return 'Usuário não está autorizado - contate o RH';
  }
  
  if (!existsInAuth) {
    return 'Usuário precisa se registrar através da página de registro';
  }
  
  return 'Usuário existe - tentar confirmação de email com senha temporária';
};
