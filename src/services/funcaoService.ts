
import { supabase } from "@/integrations/supabase/client";
import { Funcao, FuncaoFormData, FuncaoFilter } from "@/types/funcao";
import * as XLSX from "xlsx";

// Fetch functions with filters
export const fetchFuncoes = async (filters: FuncaoFilter = {}): Promise<Funcao[]> => {
  let query = supabase
    .from("bd_funcoes")
    .select("*");
  
  // Apply filters if provided
  if (filters.nome_funcao) {
    query = query.ilike("nome_funcao", `%${filters.nome_funcao}%`);
  }
  
  const { data, error } = await query.order("nome_funcao", { ascending: true });
  
  if (error) {
    console.error("Error fetching funções:", error);
    throw new Error(`Erro ao buscar funções: ${error.message}`);
  }
  
  return data as Funcao[];
};

// Check if a function already exists (for validation)
export const checkFuncaoExists = async (
  nome: string,
  id?: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("bd_funcoes")
    .select("id")
    .eq("nome_funcao", nome)
    .maybeSingle();

  if (error) {
    console.error("Error checking função:", error);
    throw new Error(`Erro ao verificar função: ${error.message}`);
  }

  // If found and it's not the current record
  if (data && data.id !== id) {
    return true;
  }

  return false;
};

// Create a new function
export const createFuncao = async (data: FuncaoFormData): Promise<Funcao> => {
  const { data: newData, error } = await supabase
    .from("bd_funcoes")
    .insert(data)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating função:", error);
    throw new Error(`Erro ao criar função: ${error.message}`);
  }
  
  return newData as Funcao;
};

// Update an existing function
export const updateFuncao = async (id: string, data: FuncaoFormData): Promise<Funcao> => {
  const { data: updatedData, error } = await supabase
    .from("bd_funcoes")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating função:", error);
    throw new Error(`Erro ao atualizar função: ${error.message}`);
  }
  
  return updatedData as Funcao;
};

// Delete a function
export const deleteFuncao = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("bd_funcoes")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting função:", error);
    throw new Error(`Erro ao excluir função: ${error.message}`);
  }
};

// Export data to Excel
export const exportToExcel = (data: Funcao[]): void => {
  // Format data for export - using just "Função" as the column name to match the expected format
  const formattedData = data.map((item) => ({
    "Função": item.nome_funcao
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Funções");
  
  // Generate Excel file
  XLSX.writeFile(workbook, "funcoes.xlsx");
};

// Process imported data
export const processImportData = async (data: any[]): Promise<{ success: string[]; errors: string[] }> => {
  const results = {
    success: [] as string[],
    errors: [] as string[]
  };
  
  for (const row of data) {
    try {
      // Get the function name from either "Nome da Função" or "Função" field
      const funcaoNome = row["Nome da Função"] || row["Função"] || null;
      
      // Validate required fields
      if (!funcaoNome) {
        results.errors.push(`Linha com dados incompletos: ${JSON.stringify(row)}`);
        continue;
      }
      
      // Check if already exists
      const exists = await checkFuncaoExists(funcaoNome);
      if (exists) {
        results.errors.push(`Função já existe: ${funcaoNome}`);
        continue;
      }
      
      // Format data for insertion
      const funcaoData: FuncaoFormData = {
        nome_funcao: funcaoNome
      };
      
      // Insert into database
      await createFuncao(funcaoData);
      results.success.push(`${funcaoNome}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const funcaoNome = row["Nome da Função"] || row["Função"] || "Desconhecido";
      results.errors.push(`Erro ao processar ${funcaoNome}: ${errorMessage}`);
    }
  }
  
  return results;
};
