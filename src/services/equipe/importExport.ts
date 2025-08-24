
import { supabase } from "@/integrations/supabase/client";
import { EquipeFormData } from "@/types/equipe";

// Function to process import data
export const processImportData = async (
  importData: any[]
): Promise<{ success: number; errors: any[] }> => {
  const results = {
    success: 0,
    errors: [] as any[],
  };

  try {
    for (const item of importData) {
      try {
        // Transform imported data to match our model
        const equipeData: EquipeFormData = {
          nome_equipe: item.nome_equipe || "",
          encarregado_id: item.encarregado_id || null,
          apontador_id: item.apontador_id || null,
          equipe: item.equipe || []
        };

        // Validate required fields
        if (!equipeData.nome_equipe || !equipeData.encarregado_id || !equipeData.apontador_id) {
          throw new Error("Campos obrigatórios não preenchidos");
        }

        // Create the equipe
        await supabase
          .from("bd_equipes")
          .insert(equipeData);

        results.success++;
      } catch (error: any) {
        results.errors.push({
          item,
          error: error.message || "Unknown error",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing import data:", error);
    throw error;
  }
};
