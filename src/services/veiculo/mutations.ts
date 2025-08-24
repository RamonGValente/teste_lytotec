
import { supabase } from "@/integrations/supabase/client";
import { Veiculo } from "@/types/veiculo";
import { VeiculoFormData } from "./types";

export const createVeiculo = async (veiculo: Omit<Veiculo, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase
    .from("bd_caminhoes_equipamentos")
    .insert([veiculo])
    .select();

  if (error) {
    console.error("Error creating veiculo:", error);
    throw error;
  }

  return data[0] as Veiculo;
};

export const updateVeiculo = async (id: string, veiculo: Partial<Veiculo>) => {
  const { data, error } = await supabase
    .from("bd_caminhoes_equipamentos")
    .update(veiculo)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating veiculo:", error);
    throw error;
  }

  return data[0] as Veiculo;
};

export const deleteVeiculo = async (id: string) => {
  const { error } = await supabase
    .from("bd_caminhoes_equipamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting veiculo:", error);
    throw error;
  }

  return true;
};
