// Temporary workaround for complex TypeScript type issues
// This file provides simplified interfaces and utilities to resolve type conflicts

export const safeProfileQuery = async (supabase: any, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome_completo, funcao_sistema, funcoes, imagem_url, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const safeProfilesQuery = async (supabase: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome_completo, funcao_sistema, funcoes, imagem_url, created_at, updated_at')
      .order('nome_completo');
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return { data: [], error };
  }
};

export const safeTableQuery = async (supabase: any, tableName: string, select = '*') => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(select);
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.warn(`Query failed for table ${tableName}:`, error);
    return { data: [], error };
  }
};

// Type guard for basic profile structure
export const isValidProfile = (profile: any): boolean => {
  return profile && typeof profile === 'object' && 
         'id' in profile && 'nome_completo' in profile;
};

// Safe type assertions for bordo
export const safeBordoType = (value: any): any => {
  return value as any; // Bypass strict typing for now
};