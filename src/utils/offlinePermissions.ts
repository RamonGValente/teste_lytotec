import { TipoApontamento } from './salvarOffline';

// Mapeamento de tipos de apontamento para permissões necessárias
export const PERMISSIONS_MAP: Record<TipoApontamento, string[]> = {
  apontamento_equipe: ['apontamentos_view', 'apontamentos_create'],
  apontamento_caminhoes: ['apontamentos_caminhoes_view', 'apontamentos_caminhoes_create'],
  registro_aplicacao: ['aplicacao_view', 'aplicacao_create'],
  registro_cargas: ['cargas_view', 'cargas_create'],
  chamados_os: ['os_view', 'os_create'],
  ordens_servico: ['ordens_servico_view', 'ordens_servico_create']
};

// Lista de super admins por email (fallback para modo offline)
const SUPER_ADMIN_EMAILS = ['julianohcampos@yahoo.com.br', 'ramonvalentevalente@gmail.com'];

export interface UserOfflineContext {
  userId: string | null;
  email: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
  userRole: string | null;
}

/**
 * Salva contexto do usuário no localStorage para uso offline
 */
export const saveUserOfflineContext = (context: UserOfflineContext): void => {
  try {
    localStorage.setItem('user_offline_context', JSON.stringify({
      ...context,
      timestamp: new Date().toISOString()
    }));
    console.log('💾 Contexto de usuário salvo para modo offline');
  } catch (error) {
    console.error('Erro ao salvar contexto offline:', error);
  }
};

/**
 * Recupera contexto do usuário do localStorage
 */
export const getUserOfflineContext = (): UserOfflineContext | null => {
  try {
    const stored = localStorage.getItem('user_offline_context');
    if (!stored) return null;
    
    const context = JSON.parse(stored);
    
    // Verificar se o contexto não está muito antigo (1 dia)
    const timestamp = new Date(context.timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffHours > 24) {
      console.log('⚠️ Contexto offline expirado, removendo...');
      localStorage.removeItem('user_offline_context');
      return null;
    }
    
    return context;
  } catch (error) {
    console.error('Erro ao recuperar contexto offline:', error);
    return null;
  }
};

/**
 * Verifica se o usuário pode acessar um módulo offline
 */
export const canAccessOfflineModule = (tipo: TipoApontamento): boolean => {
  const context = getUserOfflineContext();
  
  if (!context || !context.userId) {
    console.log('❌ Sem contexto de usuário para verificação offline');
    return false;
  }
  
  // SuperAdmin sempre pode acessar tudo
  if (context.isSuperAdmin) {
    console.log('✅ SuperAdmin: acesso total offline');
    return true;
  }
  
  // Verificar por email se é SuperAdmin (fallback)
  if (context.email && SUPER_ADMIN_EMAILS.includes(context.email.toLowerCase())) {
    console.log('✅ SuperAdmin por email: acesso total offline');
    return true;
  }
  
  // Verificar permissões específicas
  const requiredPermissions = PERMISSIONS_MAP[tipo];
  const hasPermission = requiredPermissions.some(permission => 
    context.permissions.includes(permission)
  );
  
  console.log(`${hasPermission ? '✅' : '❌'} Verificação offline para ${tipo}:`, {
    required: requiredPermissions,
    user: context.permissions,
    hasAccess: hasPermission
  });
  
  return hasPermission;
};

/**
 * Limpa dados offline quando permissões mudam
 */
export const clearOfflineDataOnPermissionChange = (
  newPermissions: string[],
  userId: string | null
): void => {
  const context = getUserOfflineContext();
  
  // Se não há contexto anterior ou o usuário mudou
  if (!context || context.userId !== userId) {
    clearAllOfflineData();
    return;
  }
  
  // Verificar se as permissões mudaram significativamente
  const oldPermissions = context.permissions.sort();
  const currentPermissions = newPermissions.sort();
  
  if (JSON.stringify(oldPermissions) !== JSON.stringify(currentPermissions)) {
    console.log('🔄 Permissões mudaram, limpando dados offline não permitidos...');
    
    // Verificar cada tipo e limpar se necessário
    Object.keys(PERMISSIONS_MAP).forEach(tipo => {
      const tipoKey = tipo as TipoApontamento;
      const requiredPermissions = PERMISSIONS_MAP[tipoKey];
      
      // Se o usuário não tem mais permissão para este tipo
      const hasPermission = requiredPermissions.some(permission => 
        currentPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        const chave = `offline_${tipo}`;
        localStorage.removeItem(chave);
        console.log(`🧹 Dados offline de ${tipo} removidos (sem permissão)`);
      }
    });
  }
};

/**
 * Limpa todos os dados offline
 */
export const clearAllOfflineData = (): void => {
  console.log('🧹 Limpando todos os dados offline...');
  
  Object.keys(PERMISSIONS_MAP).forEach(tipo => {
    const chave = `offline_${tipo}`;
    localStorage.removeItem(chave);
  });
  
  localStorage.removeItem('user_offline_context');
  console.log('✅ Todos os dados offline foram limpos');
};

/**
 * Atualiza contexto de usuário quando permissões mudam
 */
export const updateUserOfflineContext = (
  userId: string | null,
  email: string | null,
  isSuperAdmin: boolean,
  permissions: string[],
  userRole: string | null
): void => {
  // Limpar dados se necessário antes de atualizar
  clearOfflineDataOnPermissionChange(permissions, userId);
  
  // Salvar novo contexto
  const newContext: UserOfflineContext = {
    userId,
    email,
    isSuperAdmin,
    permissions,
    userRole
  };
  
  saveUserOfflineContext(newContext);
};