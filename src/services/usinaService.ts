
import { Usina, UsinaFilters } from "@/types/usina";
import { supabase } from "@/integrations/supabase/client";
import { downloadExcel } from "@/lib/excel";

export const fetchUsinas = async (filters: UsinaFilters = {}) => {
  let query = supabase
    .from("bd_usinas")
    .select("*");

  // Apply filters if provided
  if (filters.nome_usina) {
    query = query.ilike("nome_usina", `%${filters.nome_usina}%`);
  }

  if (filters.endereco) {
    query = query.ilike("endereco", `%${filters.endereco}%`);
  }

  if (filters.telefone) {
    query = query.ilike("telefone", `%${filters.telefone}%`);
  }

  const { data, error } = await query.order("nome_usina");

  if (error) {
    console.error("Error fetching usinas:", error);
    throw error;
  }

  return data || [];
};

export const fetchUsinaById = async (id: string) => {
  const { data, error } = await supabase
    .from("bd_usinas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching usina:", error);
    throw error;
  }

  return data;
};

export const createUsina = async (usina: Omit<Usina, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase
    .from("bd_usinas")
    .insert([usina])
    .select();

  if (error) {
    console.error("Error creating usina:", error);
    throw error;
  }

  return data[0];
};

export const updateUsina = async (id: string, usina: Partial<Omit<Usina, "id" | "created_at" | "updated_at">>) => {
  const { data, error } = await supabase
    .from("bd_usinas")
    .update(usina)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating usina:", error);
    throw error;
  }

  return data[0];
};

export const deleteUsina = async (id: string) => {
  const { error } = await supabase
    .from("bd_usinas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting usina:", error);
    throw error;
  }

  return true;
};

export const exportUsinasToExcel = async (usinas: Usina[]) => {
  const data = usinas.map(usina => ({
    'Nome da Usina': usina.nome_usina,
    'Endereço': usina.endereco || '',
    'Produção Total': usina.producao_total || '',
    'Telefone': usina.telefone || '',
  }));

  return downloadExcel(data, 'Usinas');
};

export const importUsinas = async (usinas: Partial<Usina>[]) => {
  // Check for duplicate names
  const existingUsinas = await fetchUsinas();
  const existingNomes = new Set(existingUsinas.map(u => u.nome_usina.toLowerCase()));
  
  // Filter out duplicates and ensure nome_usina is provided
  const validUsinas = usinas.filter(usina => 
    usina.nome_usina && !existingNomes.has(usina.nome_usina.toLowerCase())
  ).map(usina => ({
    nome_usina: usina.nome_usina as string, // Assert nome_usina is not undefined
    endereco: usina.endereco,
    producao_total: usina.producao_total,
    telefone: usina.telefone
  }));
  
  if (validUsinas.length === 0) {
    return { 
      success: false, 
      message: "Não foram encontrados dados válidos para importação ou todas as usinas já existem." 
    };
  }

  const { data, error } = await supabase
    .from("bd_usinas")
    .insert(validUsinas)
    .select();

  if (error) {
    console.error("Error importing usinas:", error);
    throw error;
  }

  return { 
    success: true, 
    imported: data?.length || 0, 
    total: usinas.length,
    skipped: usinas.length - (data?.length || 0)
  };
};
