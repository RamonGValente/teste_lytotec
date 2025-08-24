
import { supabase } from "@/integrations/supabase/client";
import { ApontamentoEquipe, ApontamentoEquipeFilters } from "@/types/apontamentoEquipe";

// Helper function to normalize date to prevent timezone issues
const normalizeDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    if (date.includes('T')) {
      const dateObj = new Date(date);
      return dateObj.toISOString().split('T')[0];
    }
    return date;
  }
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(12, 0, 0, 0);
  return normalizedDate.toISOString().split('T')[0];
};

// Fetch apontamentos with automatic RLS filtering and retry logic
export const fetchSecureApontamentos = async (filters: ApontamentoEquipeFilters = {}): Promise<ApontamentoEquipe[]> => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`🔐 Fetching apontamentos with RLS filtering (tentativa ${retryCount + 1})...`);
      
      let query = supabase
        .from("bd_apontamento_equipe")
        .select(`
          *,
          equipe:bd_equipes!bd_apontamento_equipe_equipe_id_fkey(
            id,
            nome_equipe,
            encarregado:bd_funcionarios!bd_equipes_encarregado_id_fkey(
              id,
              nome_completo
            ),
            apontador:bd_funcionarios!bd_equipes_apontador_id_fkey(
              id,
              nome_completo
            )
          ),
          colaborador:bd_funcionarios!bd_apontamento_equipe_colaborador_id_fkey(
            id, 
            nome_completo
          ),
          lista_entrega:bd_lista_programacao_entrega!bd_apontamento_equipe_lista_entrega_id_fkey(
            id,
            logradouro
          )
        `)
        .order('data_registro', { ascending: false });
      
      // Apply filters
      if (filters.data_inicio) {
        const formattedDate = normalizeDate(filters.data_inicio);
        query = query.gte("data_registro", formattedDate);
      }
      
      if (filters.data_fim) {
        const formattedDate = normalizeDate(filters.data_fim);
        query = query.lte("data_registro", formattedDate);
      }
      
      if (filters.equipe_id && filters.equipe_id !== 'all') {
        query = query.eq("equipe_id", filters.equipe_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        // Se é erro de RLS/permissão e ainda há tentativas, retry
        if ((error.message?.includes('policy') || error.message?.includes('permission') || error.code === 'PGRST116') && retryCount < maxRetries - 1) {
          console.warn(`⚠️ RLS error, retrying (${retryCount + 1}/${maxRetries}):`, error);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        
        console.error("❌ Error fetching secure apontamentos:", error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} apontamentos with RLS filtering`);
      return data as unknown as ApontamentoEquipe[];
      
    } catch (error) {
      if (retryCount >= maxRetries - 1) {
        console.error("❌ Final error in fetchSecureApontamentos:", error);
        throw error;
      }
      
      console.warn(`🔄 Retry ${retryCount + 1}/${maxRetries} after error:`, error);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  // Fallback que nunca deve ser alcançado
  throw new Error('Unexpected end of retry loop');
};

// Fetch teams with automatic RLS filtering
export const fetchSecureEquipes = async () => {
  try {
    console.log('🔐 Fetching teams with RLS filtering...');
    
    const { data, error } = await supabase
      .from('bd_equipes')
      .select(`
        *,
        encarregado:bd_funcionarios!bd_equipes_encarregado_id_fkey(
          id, 
          nome_completo
        ),
        apontador:bd_funcionarios!bd_equipes_apontador_id_fkey(
          id, 
          nome_completo
        )
      `)
      .order('nome_equipe');
    
    if (error) {
      console.error("❌ Error fetching secure teams:", error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} teams with RLS filtering`);
    return data || [];
    
  } catch (error) {
    console.error("❌ Error in fetchSecureEquipes:", error);
    throw error;
  }
};

// Check if user can access specific team
export const canAccessTeam = async (teamId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('bd_equipes')
      .select('id')
      .eq('id', teamId)
      .single();
    
    // If RLS allows access, data will be returned
    return !error && !!data;
  } catch (error) {
    console.error("❌ Error checking team access:", error);
    return false;
  }
};

// Simplified permission check for creating apontamentos
export const canCreateApontamentoForTeam = async (teamId: string): Promise<boolean> => {
  try {
    console.log(`🔍 Checking permission to create apontamento for team: ${teamId}`);
    
    // Simplified approach: if user can see the team, they can create apontamentos
    const canAccess = await canAccessTeam(teamId);
    
    if (!canAccess) {
      console.log("❌ User cannot access team");
      return false;
    }
    
    // Get current user to check basic authentication
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    
    if (userError || !currentUser.user) {
      console.log("❌ User not authenticated");
      return false;
    }
    
    // Get user profile with simplified role check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('funcoes')
      .eq('id', currentUser.user.id)
      .single();
    
    if (profileError) {
      console.log("❌ Could not fetch user profile, but allowing access based on team visibility");
      // If we can't get the profile but can access the team, allow it
      return true;
    }
    
    if (!profile?.funcoes || !Array.isArray(profile.funcoes)) {
      console.log("❌ User has no roles assigned");
      return false;
    }
    
    // Check if user has allowed roles
    const allowedRoles = ['SuperAdm', 'AdmRH', 'Apontador', 'Encarregado'];
    const hasAllowedRole = profile.funcoes.some(role => allowedRoles.includes(role));
    
    console.log(`✅ Permission check result: ${hasAllowedRole} (roles: ${profile.funcoes.join(', ')})`);
    return hasAllowedRole;
    
  } catch (error) {
    console.error("❌ Error checking apontamento creation permission:", error);
    // In case of error, allow if user can access team (fallback)
    return await canAccessTeam(teamId);
  }
};
