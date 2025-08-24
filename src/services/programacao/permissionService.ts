import { supabase } from "@/integrations/supabase/client";

export interface CancellationPermission {
  canCancel: boolean;
  reason?: string;
  userRole?: string;
}

/**
 * Verifica se o usuário pode cancelar uma programação específica
 */
export const checkCancellationPermission = async (
  entregaId: string,
  userId: string
): Promise<CancellationPermission> => {
  try {
    console.log("🔐 Verificando permissão de cancelamento para:", { entregaId, userId });

    // 1. Verificar se a entrega existe e seu status atual
    const { data: entrega, error: entregaError } = await supabase
      .from('bd_lista_programacao_entrega')
      .select(`
        id,
        status,
        programacao_entrega_id,
        bd_programacao_entrega!inner(
          id,
          created_at,
          requisicao_id
        )
      `)
      .eq('id', entregaId)
      .single();

    if (entregaError || !entrega) {
      return {
        canCancel: false,
        reason: "Entrega não encontrada"
      };
    }

    // 2. Verificar se já foi enviada ou entregue
    if (entrega.status === 'Enviada' || entrega.status === 'Entregue') {
      return {
        canCancel: false,
        reason: "Não é possível cancelar uma entrega que já foi enviada ou entregue"
      };
    }

    // 3. Verificar se já tem registro de carga (massa apontada)
    const { data: registroCarga } = await supabase
      .from('bd_registro_cargas')
      .select('id')
      .eq('lista_entrega_id', entregaId)
      .maybeSingle();

    if (registroCarga) {
      return {
        canCancel: false,
        reason: "Não é possível cancelar: já existe registro de carga para esta entrega"
      };
    }

    // 4. Buscar perfil do usuário para verificar permissões
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('funcoes')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return {
        canCancel: false,
        reason: "Perfil de usuário não encontrado"
      };
    }

    const userRole = profile.funcoes?.[0] || 'user';

    // 5. Verificar permissões por hierarquia
    const isAdmin = profile.funcoes?.some(f => 
      ['SuperAdm', 'AdmRH', 'Administrador'].includes(f)
    );

    if (isAdmin) {
      return {
        canCancel: true,
        userRole
      };
    }

    // 6. Para não-admins, permitir apenas se for criador da programação
    // (Por simplicidade, vamos permitir para Apontadores e Encarregados)
    const canEditProgramacao = profile.funcoes?.some(f => 
      ['Apontador', 'Encarregado'].includes(f)
    );

    if (canEditProgramacao) {
      return {
        canCancel: true,
        userRole
      };
    }

    return {
      canCancel: false,
      reason: "Usuário não possui permissão para cancelar programações",
      userRole
    };

  } catch (error) {
    console.error("❌ Erro ao verificar permissão de cancelamento:", error);
    return {
      canCancel: false,
      reason: "Erro interno do sistema"
    };
  }
};

/**
 * Verifica se o usuário pode editar uma programação
 */
export const checkEditPermission = async (
  programacaoId: string,
  userId: string
): Promise<CancellationPermission> => {
  try {
    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('funcoes')
      .eq('id', userId)
      .single();

    if (!profile) {
      return {
        canCancel: false,
        reason: "Perfil não encontrado"
      };
    }

    const userRole = profile.funcoes?.[0] || 'user';

    // Verificar se é admin
    const isAdmin = profile.funcoes?.some(f => 
      ['SuperAdm', 'AdmRH', 'Administrador'].includes(f)
    );

    if (isAdmin) {
      return {
        canCancel: true,
        userRole
      };
    }

    // Para não-admins, verificar se pode editar programações
    const canEdit = profile.funcoes?.some(f => 
      ['Apontador', 'Encarregado'].includes(f)
    );

    return {
      canCancel: canEdit,
      reason: canEdit ? undefined : "Usuário não possui permissão para editar programações",
      userRole
    };

  } catch (error) {
    console.error("❌ Erro ao verificar permissão de edição:", error);
    return {
      canCancel: false,
      reason: "Erro interno do sistema"
    };
  }
};

/**
 * Log de ações de cancelamento para auditoria
 */
export const logCancellationAction = async (
  entregaId: string,
  userId: string,
  action: 'cancelled' | 'restored',
  reason?: string
): Promise<void> => {
  try {
    console.log("📝 Registrando ação de cancelamento:", { entregaId, userId, action, reason });
    
    // Por enquanto, apenas log no console
    // Futuramente pode ser implementada uma tabela de auditoria
    
  } catch (error) {
    console.error("❌ Erro ao registrar log de cancelamento:", error);
  }
};