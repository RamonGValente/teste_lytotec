
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const usePermissionCacheInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidatePermissionCache = useCallback(() => {
    // Invalidar todas as queries relacionadas a permissões
    queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    queryClient.invalidateQueries({ queryKey: ['auth-permissions'] });
    queryClient.invalidateQueries({ queryKey: ['funcoesPermissao'] });
    queryClient.invalidateQueries({ queryKey: ['availableFunctions'] });
    
    console.log('🔄 Cache de permissões invalidado - forçando recarregamento');
  }, [queryClient]);

  const refetchUserPermissions = useCallback(() => {
    // Recarregar permissões do usuário atual
    queryClient.refetchQueries({ queryKey: ['user-permissions'] });
    queryClient.refetchQueries({ queryKey: ['auth-permissions'] });
    
    console.log('🔄 Permissões do usuário recarregadas');
  }, [queryClient]);

  return {
    invalidatePermissionCache,
    refetchUserPermissions
  };
};
