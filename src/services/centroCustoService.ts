import { supabase } from "@/integrations/supabase/client";
import { CentroCusto, CentroCustoFormData, CentroCustoFilter } from "@/types/centroCusto";
import * as XLSX from "xlsx";

// Fetch centros de custo with filters
export const fetchCentrosCusto = async (filters: CentroCustoFilter = {}): Promise<CentroCusto[]> => {
  let query = supabase
    .from("bd_centros_custo")
    .select("*");
  
  // Apply filters if provided
  if (filters.codigo_centro_custo) {
    query = query.ilike("codigo_centro_custo", `%${filters.codigo_centro_custo}%`);
  }
  
  if (filters.nome_centro_custo) {
    query = query.ilike("nome_centro_custo", `%${filters.nome_centro_custo}%`);
  }
  
  if (filters.cnpj_vinculado) {
    query = query.ilike("cnpj_vinculado", `%${filters.cnpj_vinculado}%`);
  }
  
  if (filters.telefone) {
    query = query.ilike("telefone", `%${filters.telefone}%`);
  }
  
  if (filters.situacao) {
    query = query.eq("situacao", filters.situacao);
  }
  
  const { data, error } = await query.order("codigo_centro_custo", { ascending: true });
  
  if (error) {
    console.error("Error fetching centros de custo:", error);
    throw new Error(`Erro ao buscar centros de custo: ${error.message}`);
  }
  
  return data as CentroCusto[];
};

// Check if a centro de custo already exists (for validation)
export const checkCentroCustoExists = async (
  codigo: string, 
  nome: string,
  id?: string
): Promise<boolean> => {
  // Check by codigo
  const { data: dataByCodigo, error: errorByCodigo } = await supabase
    .from("bd_centros_custo")
    .select("id")
    .eq("codigo_centro_custo", codigo)
    .maybeSingle();

  if (errorByCodigo) {
    console.error("Error checking centro de custo by code:", errorByCodigo);
    throw new Error(`Erro ao verificar centro de custo: ${errorByCodigo.message}`);
  }

  // If found and it's not the current record
  if (dataByCodigo && dataByCodigo.id !== id) {
    return true;
  }

  // Check by nome
  const { data: dataByNome, error: errorByNome } = await supabase
    .from("bd_centros_custo")
    .select("id")
    .eq("nome_centro_custo", nome)
    .maybeSingle();

  if (errorByNome) {
    console.error("Error checking centro de custo by name:", errorByNome);
    throw new Error(`Erro ao verificar centro de custo: ${errorByNome.message}`);
  }

  // If found and it's not the current record
  if (dataByNome && dataByNome.id !== id) {
    return true;
  }

  return false;
};

// Create a new centro de custo
export const createCentroCusto = async (data: CentroCustoFormData): Promise<CentroCusto> => {
  const { data: newData, error } = await supabase
    .from("bd_centros_custo")
    .insert(data)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating centro de custo:", error);
    throw new Error(`Erro ao criar centro de custo: ${error.message}`);
  }
  
  return newData as CentroCusto;
};

// Update an existing centro de custo
export const updateCentroCusto = async (id: string, data: CentroCustoFormData): Promise<CentroCusto> => {
  const { data: updatedData, error } = await supabase
    .from("bd_centros_custo")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating centro de custo:", error);
    throw new Error(`Erro ao atualizar centro de custo: ${error.message}`);
  }
  
  return updatedData as CentroCusto;
};

// Delete a centro de custo
export const deleteCentroCusto = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("bd_centros_custo")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting centro de custo:", error);
    throw new Error(`Erro ao excluir centro de custo: ${error.message}`);
  }
};

// Export data to Excel
export const exportToExcel = (data: CentroCusto[]): void => {
  // Format data for export
  const formattedData = data.map((item) => ({
    "Código": item.codigo_centro_custo,
    "Nome do Centro de Custo": item.nome_centro_custo,
    "CNPJ Vinculado": item.cnpj_vinculado || "",
    "Telefone": item.telefone || "",
    "Situação": item.situacao
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Centros de Custo");
  
  // Generate Excel file
  XLSX.writeFile(workbook, "centros_de_custo.xlsx");
};

// Process imported data
export const processImportData = async (data: any[]): Promise<{ success: string[]; errors: string[] }> => {
  const results = {
    success: [] as string[],
    errors: [] as string[]
  };
  
  for (const row of data) {
    try {
      // Validate required fields
      if (!row["Código"] || !row["Nome do Centro de Custo"]) {
        results.errors.push(`Linha com dados incompletos: ${JSON.stringify(row)}`);
        continue;
      }
      
      // Check if already exists
      const exists = await checkCentroCustoExists(row["Código"], row["Nome do Centro de Custo"]);
      if (exists) {
        results.errors.push(`Centro de custo já existe: ${row["Código"]} - ${row["Nome do Centro de Custo"]}`);
        continue;
      }
      
      // Format data for insertion
      const centroCustoData: CentroCustoFormData = {
        codigo_centro_custo: row["Código"],
        nome_centro_custo: row["Nome do Centro de Custo"],
        cnpj_vinculado: row["CNPJ Vinculado"] || null,
        telefone: row["Telefone"] || null,
        situacao: (row["Situação"] === "Inativo" ? "Inativo" : "Ativo") as "Ativo" | "Inativo"
      };
      
      // Insert into database
      await createCentroCusto(centroCustoData);
      results.success.push(`${row["Código"]} - ${row["Nome do Centro de Custo"]}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      results.errors.push(`Erro ao processar ${row["Código"]} - ${row["Nome do Centro de Custo"]}: ${errorMessage}`);
    }
  }
  
  return results;
};

// Import centros de custo from Excel
export const importCentrosCusto = async (data: CentroCustoFormData[]): Promise<{ inserted: number; errors: string[] }> => {
  const results = {
    inserted: 0,
    errors: [] as string[]
  };
  
  for (const item of data) {
    try {
      // Validate required fields
      if (!item.codigo_centro_custo || !item.nome_centro_custo) {
        results.errors.push(`Dados incompletos: Código e nome são obrigatórios`);
        continue;
      }
      
      // Check if already exists
      const exists = await checkCentroCustoExists(item.codigo_centro_custo, item.nome_centro_custo);
      if (exists) {
        results.errors.push(`Centro de custo já existe: ${item.codigo_centro_custo} - ${item.nome_centro_custo}`);
        continue;
      }
      
      // Insert into database
      await createCentroCusto(item);
      results.inserted++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      results.errors.push(`Erro ao processar ${item.codigo_centro_custo} - ${item.nome_centro_custo}: ${errorMessage}`);
    }
  }
  
  return results;
};
