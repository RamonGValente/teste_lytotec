// Utilitários para validação de permissões
export const validateFunctionAssignment = (
  currentFunctions: string[], 
  newFunction: string
): { isValid: boolean; message?: string } => {
  // Verificar se a função já existe
  if (currentFunctions.includes(newFunction)) {
    return {
      isValid: false,
      message: `A função "${newFunction}" já está atribuída a este usuário.`
    };
  }

  // Verificar conflitos de função (ex: não pode ter SuperAdm e outra função)
  if (newFunction === 'SuperAdm' && currentFunctions.some(f => f !== 'user')) {
    return {
      isValid: false,
      message: 'Usuários com função SuperAdm não podem ter outras funções.'
    };
  }

  if (currentFunctions.includes('SuperAdm') && newFunction !== 'SuperAdm') {
    return {
      isValid: false,
      message: 'Usuários SuperAdm não podem ter funções adicionais.'
    };
  }

  return { isValid: true };
};

export const validateFunctionRemoval = (
  currentFunctions: string[], 
  functionToRemove: string
): { isValid: boolean; message?: string } => {
  // Verificar se a função existe
  if (!currentFunctions.includes(functionToRemove)) {
    return {
      isValid: false,
      message: `A função "${functionToRemove}" não está atribuída a este usuário.`
    };
  }

  // Não permitir remoção se for a única função válida
  const validFunctions = currentFunctions.filter(f => f !== 'user' && f.trim() !== '');
  if (validFunctions.length === 1 && validFunctions[0] === functionToRemove) {
    return {
      isValid: false,
      message: 'Não é possível remover a única função válida do usuário.'
    };
  }

  return { isValid: true };
};

export const cleanFunctionArray = (functions: string[]): string[] => {
  // Remover valores vazios, null, undefined
  const cleaned = functions.filter(f => f && f.trim() !== '');
  
  // Se não sobrar nenhuma função válida, retornar ['user']
  if (cleaned.length === 0) {
    return ['user'];
  }
  
  // Remover duplicatas e manter ordem
  return [...new Set(cleaned)];
};