
import { supabase } from "@/integrations/supabase/client";
import { debugLog } from "@/lib/debug";

/**
 * Fetch centros de custo filtered by user role and permissions
 * @param userId - Current user ID
 * @param isSuperAdmin - Whether the user is a SuperAdmin
 */
export const fetchCentrosCustoFiltered = async (
  userId: string | null = null,
  isSuperAdmin: boolean = false
): Promise<{ id: string; nome_centro_custo: string }[]> => {
  try {
    console.log("👨‍💼 fetchCentrosCustoFiltered - userId:", userId, "isSuperAdmin:", isSuperAdmin);
    
    if (isSuperAdmin) {
      // SuperAdmin sees all centros de custo
      console.log("👑 Loading all centros de custo for SuperAdmin");
      const { data, error } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');

      if (error) {
        console.error("❌ Error loading centros de custo for SuperAdmin:", error);
        debugLog("Supabase Error", error);
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} centros de custo for SuperAdmin`);
      return data || [];
    }

    if (!userId) {
      console.log("⚠️ No userId provided, loading all active centros de custo");
      // If no userId provided, return all active centros de custo
      const { data, error } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');

      if (error) {
        console.error("❌ Error loading centros de custo:", error);
        debugLog("Supabase Error", error);
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} centros de custo (fallback)`);
      return data || [];
    }

    // For non-SuperAdmin users, try to get centros de custo related to their work
    console.log("👤 Loading filtered centros de custo for user:", userId);
    
    // First try to get from user's teams/equipes
    const { data: userData, error: userError } = await supabase
      .from('bd_funcionarios')
      .select('equipe_id, centro_custo_id')
      .eq('id', userId);

    if (userError) {
      console.error("❌ Error loading user's data:", userError);
      // Fallback to all centros de custo if user query fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');
      
      return fallbackData || [];
    }

    // If user has direct centro de custo assignment
    if (userData && userData.length > 0 && userData[0].centro_custo_id) {
      console.log(`✅ Found user's direct centro de custo assignment`);
      
      // Get the actual centro de custo data
      const { data: centroCustoData, error: centroCustoError } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('id', userData[0].centro_custo_id)
        .eq('situacao', 'Ativo')
        .single();

      if (centroCustoError || !centroCustoData) {
        console.log("⚠️ Centro de custo not found or inactive, falling back to all");
        // Fallback to all active centros de custo
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bd_centros_custo')
          .select('id, nome_centro_custo')
          .eq('situacao', 'Ativo')
          .order('nome_centro_custo');
        
        return fallbackData || [];
      }

      console.log(`✅ Returning user's centro de custo: ${centroCustoData.nome_centro_custo}`);
      return [centroCustoData];
    }

    // If no direct assignment, fallback to all active centros de custo
    console.log("⚠️ No direct centro de custo found, falling back to all active centros");
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('bd_centros_custo')
      .select('id, nome_centro_custo')
      .eq('situacao', 'Ativo')
      .order('nome_centro_custo');
    
    return fallbackData || [];
  } catch (error) {
    console.error("❗ Error in fetchCentrosCustoFiltered:", error);
    debugLog("Error Details", error);
    
    // Final fallback - return all active centros de custo
    try {
      const { data: fallbackData } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');
      
      console.log("📋 Using fallback - loaded all active centros de custo");
      return fallbackData || [];
    } catch (fallbackError) {
      console.error("❌ Even fallback failed:", fallbackError);
      return [];
    }
  }
};
