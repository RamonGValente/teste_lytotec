
import { supabase } from "@/integrations/supabase/client";

export const getMarcasDropdown = async () => {
  const { data, error } = await supabase
    .from("bd_caminhoes_equipamentos")
    .select("marca")
    .order("marca");

  if (error) {
    console.error("Error fetching marcas dropdown:", error);
    throw error;
  }

  const marcas = data.map(item => item.marca).filter(Boolean);
  const uniqueMarcas = [...new Set(marcas)];

  return uniqueMarcas as string[];
};

export const getDepartamentosDropdown = async () => {
  const { data, error } = await supabase
    .from("bd_departamentos")
    .select("id, nome_departamento")
    .order("nome_departamento");

  if (error) {
    console.error("Error fetching departamentos dropdown:", error);
    throw error;
  }

  return data as { id: string; nome_departamento: string }[];
};

export const getEmpresasDropdown = async () => {
  const { data, error } = await supabase
    .from("bd_empresas")
    .select("id, nome_empresa")
    .eq("situacao", "Ativa")
    .order("nome_empresa");

  if (error) {
    console.error("Error fetching empresas dropdown:", error);
    throw error;
  }

  return data as { id: string; nome_empresa: string }[];
};
