
import { supabase } from "@/integrations/supabase/client";
import { RegistroAplicacao, RegistroAplicacaoFilters } from "@/types/registroAplicacao";
import { format } from "date-fns";
import { registroAplicacaoSelectQuery } from "./baseService";

/**
 * Fetch all aplicações with filters
 * @param filters - Object containing filter criteria
 * @param userId - Current user ID for permission checking
 * @param isSuperAdmin - Whether the current user is a SuperAdmin
 */
export const fetchRegistrosAplicacao = async (
  filters: RegistroAplicacaoFilters = {},
  userId: string | null = null,
  isSuperAdmin: boolean = false
): Promise<RegistroAplicacao[]> => {
  try {
    console.log("🔍 Fetching registros aplicação with filters:", filters);
    console.log("👤 User permissions - ID:", userId, "SuperAdmin:", isSuperAdmin);
    
    let query = supabase
      .from("bd_registro_apontamento_aplicacao")
      .select(registroAplicacaoSelectQuery);
    
    // Apply date filter if provided - Use exact date match (eq) instead of greater than or equal (gte)
    if (filters.data_inicio) {
      const formattedDate = format(filters.data_inicio, "yyyy-MM-dd");
      console.log("📅 Filtering by exact date:", formattedDate);
      query = query.eq("data_aplicacao", formattedDate);
    }
    
    // Filter by user if not SuperAdmin and userId is available
    if (userId && !isSuperAdmin) {
      console.log("🔒 Applying user filter for ID:", userId);
      query = query.eq("created_by", userId);
    }
    
    // Execute the query - Order by data_aplicacao instead of created_at
    const { data: rawData, error } = await query.order("data_aplicacao", { ascending: false });
    
    if (error) {
      console.error("❌ Error fetching registros aplicação:", error);
      throw error;
    }
    
    console.log(`📊 Raw data from database: ${rawData?.length || 0} records`);
    
    // If no data returned, return empty array
    if (!rawData || rawData.length === 0) {
      console.log("📭 No registros aplicação found for current filters");
      return [];
    }
    
    // Apply manual filters for more complex conditions
    let filteredData = [...rawData];
    
    // Apply caminhao_id filter manually
    if (filters.caminhao_id && filters.caminhao_id !== 'all') {
      console.log("🚛 Applying caminhao filter for ID:", filters.caminhao_id);
      const initialCount = filteredData.length;
      filteredData = filteredData.filter(registro => {
        if (!registro.lista_entrega || !registro.lista_entrega.caminhao) {
          return false;
        }
        return registro.lista_entrega.caminhao.id === filters.caminhao_id;
      });
      console.log(`🚛 Caminhao filter: ${initialCount} → ${filteredData.length} records`);
    }
    
    // Apply centro_custo_id filter manually
    if (filters.centro_custo_id && filters.centro_custo_id !== 'all') {
      console.log("🏢 Applying centro_custo filter for ID:", filters.centro_custo_id);
      const initialCount = filteredData.length;
      filteredData = filteredData.filter(registro => {
        // Try to get centro_custo_id through the requisicao relation first
        const centroCustoId = 
          registro.lista_entrega?.requisicao?.centro_custo?.id;
        
        return centroCustoId === filters.centro_custo_id;
      });
      console.log(`🏢 Centro custo filter: ${initialCount} → ${filteredData.length} records`);
    }
    
    console.log(`✅ Final filtered registros aplicação: ${filteredData.length} records`);
    if (filteredData.length > 0) {
      console.log("📝 Sample filtered registro:", {
        id: filteredData[0].id,
        data_aplicacao: filteredData[0].data_aplicacao,
        logradouro: filteredData[0].logradouro_aplicado || filteredData[0].lista_entrega?.logradouro,
        centro_custo: filteredData[0].lista_entrega?.requisicao?.centro_custo?.nome_centro_custo
      });
    }
    
    return filteredData as any;
  } catch (error) {
    console.error("💥 Unexpected error fetching registros aplicação:", error);
    throw error;
  }
};
