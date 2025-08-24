import { ProfileType } from "@/types/permissao";

export interface HybridPermissionStatus {
  hasPermission: boolean;
  primaryFunction: string | null;
  additionalFunctions: string[];
  permissionSource: 'funcao_permissao' | 'funcoes_array' | 'both' | 'none';
  displayName: string;
}

/**
 * Determina o status das permissões no sistema híbrido
 */
export const getHybridPermissionStatus = (profile: ProfileType): HybridPermissionStatus => {
  const funcoes = profile.funcoes || [];
  const funcaoPermissao = (profile as any).bd_funcoes_permissao;
  
  // Filtrar funções válidas do array funcoes
  const validFuncoes = funcoes.filter(f => f && f.trim() !== '' && f !== 'user');
  
  // Verificar se tem funcao_permissao válida
  const hasValidFuncaoPermissao = funcaoPermissao && funcaoPermissao.nome_funcao;
  
  // Determinar source e funções
  let permissionSource: HybridPermissionStatus['permissionSource'] = 'none';
  let primaryFunction: string | null = null;
  let additionalFunctions: string[] = [];
  
  if (hasValidFuncaoPermissao && validFuncoes.length > 0) {
    permissionSource = 'both';
    primaryFunction = funcaoPermissao.nome_funcao;
    additionalFunctions = validFuncoes.filter(f => f !== funcaoPermissao.nome_funcao);
  } else if (hasValidFuncaoPermissao) {
    permissionSource = 'funcao_permissao';
    primaryFunction = funcaoPermissao.nome_funcao;
  } else if (validFuncoes.length > 0) {
    permissionSource = 'funcoes_array';
    primaryFunction = validFuncoes[0];
    additionalFunctions = validFuncoes.slice(1);
  } else {
    permissionSource = 'none';
  }
  
  const hasPermission = permissionSource !== 'none';
  
  // Criar display name
  let displayName = 'Sem permissão';
  if (hasPermission) {
    if (additionalFunctions.length > 0) {
      displayName = `${primaryFunction} (+${additionalFunctions.length} outras)`;
    } else {
      displayName = primaryFunction || 'Sem permissão';
    }
  }
  
  return {
    hasPermission,
    primaryFunction,
    additionalFunctions,
    permissionSource,
    displayName
  };
};

/**
 * Obtém todas as funções de um usuário (tanto primária quanto adicionais)
 */
export const getAllUserFunctions = (profile: ProfileType): string[] => {
  const status = getHybridPermissionStatus(profile);
  const allFunctions: string[] = [];
  
  if (status.primaryFunction) {
    allFunctions.push(status.primaryFunction);
  }
  
  allFunctions.push(...status.additionalFunctions);
  
  return [...new Set(allFunctions)]; // Remove duplicatas
};

/**
 * Verifica se o usuário tem uma função específica
 */
export const userHasFunction = (profile: ProfileType, functionName: string): boolean => {
  const allFunctions = getAllUserFunctions(profile);
  return allFunctions.includes(functionName);
};

/**
 * Verifica se o usuário é SuperAdmin
 */
export const isUserSuperAdmin = (profile: ProfileType): boolean => {
  return userHasFunction(profile, 'SuperAdm');
};

/**
 * Obtém a função principal do usuário para exibição
 */
export const getUserDisplayFunction = (profile: ProfileType): string => {
  const status = getHybridPermissionStatus(profile);
  return status.displayName;
};

/**
 * Verifica se o usuário tem permissões (qualquer uma)
 */
export const userHasAnyPermission = (profile: ProfileType): boolean => {
  const status = getHybridPermissionStatus(profile);
  return status.hasPermission;
};

/**
 * Obtém detalhes formatados do usuário para exibição
 */
export const getUserPermissionDetails = (profile: ProfileType) => {
  const status = getHybridPermissionStatus(profile);
  
  return {
    name: profile.nome_completo || 'Nome não informado',
    email: profile.email || 'Email não informado',
    primaryFunction: status.primaryFunction,
    additionalFunctions: status.additionalFunctions,
    displayName: status.displayName,
    hasPermission: status.hasPermission,
    permissionSource: status.permissionSource,
    isSuperAdmin: isUserSuperAdmin(profile),
    allFunctions: getAllUserFunctions(profile)
  };
};