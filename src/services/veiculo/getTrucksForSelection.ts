
import { supabase } from "@/integrations/supabase/client";

export interface TruckForSelection {
  id: string;
  nome_caminhao: string;
  placa?: string | null;
  modelo?: string | null;
}

/**
 * Fetches trucks from the database that are available for selection
 * Filters by tipo_veiculo = 'Caminhão' and situacao in ['Disponível', 'Operando']
 */
export const getTrucksForSelection = async (): Promise<TruckForSelection[]> => {
  try {
    const { data, error } = await supabase
      .from("bd_caminhoes_equipamentos")
      .select("id, placa, modelo, marca, frota, numero_frota")
      .eq("tipo_veiculo", "Caminhão")
      .in("situacao", ["Disponível", "Operando"])
      .order("placa", { ascending: true });

    if (error) {
      console.error("Error fetching trucks for selection:", error);
      throw error;
    }

    // Map the data to the expected format with improved nome_caminhao generation
    return data.map(truck => {
      // Generate a more descriptive display name
      let nome_caminhao = "Sem identificação";
      if (truck.placa && truck.modelo) {
        nome_caminhao = `${truck.placa} - ${truck.modelo}`;
      } else if (truck.placa) {
        nome_caminhao = truck.placa;
      } else if (truck.frota && truck.numero_frota) {
        nome_caminhao = `${truck.frota} ${truck.numero_frota}`;
      } else if (truck.modelo && truck.marca) {
        nome_caminhao = `${truck.marca} ${truck.modelo}`;
      } else if (truck.modelo) {
        nome_caminhao = truck.modelo;
      }

      return {
        id: truck.id,
        nome_caminhao,
        placa: truck.placa,
        modelo: truck.modelo
      };
    });
  } catch (error) {
    console.error("Error in getTrucksForSelection:", error);
    throw error;
  }
};
