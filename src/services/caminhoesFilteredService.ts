
import { supabase } from "@/integrations/supabase/client";
import { debugLog } from "@/lib/debug";

/**
 * Fetch caminhões with available capacity
 */
export const fetchCaminhoesWithCapacity = async (): Promise<{ id: string; placa: string; modelo: string }[]> => {
  try {
    console.log("🚚 fetchCaminhoesWithCapacity - Fetching caminhões...");
    
    const { data, error } = await supabase
      .from('bd_caminhoes_equipamentos')
      .select('id, placa, modelo, capacidade, situacao, tipo_veiculo')
      .eq('tipo_veiculo', 'Caminhão')
      .not('capacidade', 'is', null)
      .neq('capacidade', '')
      .in('situacao', ['Disponível', 'Operando'])
      .order('placa');

    if (error) {
      console.error("❌ Error fetching caminhões with capacity:", error);
      debugLog("Supabase Error", error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} caminhões with capacity`);
    
    return (data || []).map(caminhao => ({
      id: caminhao.id,
      placa: caminhao.placa || '',
      modelo: caminhao.modelo || ''
    }));
  } catch (error) {
    console.error("❗ Error in fetchCaminhoesWithCapacity:", error);
    debugLog("Error Details", error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};
