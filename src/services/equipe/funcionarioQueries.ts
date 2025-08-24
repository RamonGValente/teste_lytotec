
import { supabase } from "@/integrations/supabase/client";

// Function to fetch funcionarios by exact role
export const fetchFuncionariosByRole = async (role: string): Promise<any[]> => {
  try {
    console.log(`Fetching funcionarios with exact role: ${role}`);
    
    const { data, error } = await supabase
      .from("bd_funcionarios")
      .select(`
        id,
        nome_completo,
        funcao_id,
        bd_funcoes (id, nome_funcao)
      `)
      .eq("bd_funcoes.nome_funcao", role);

    if (error) {
      console.error(`Error fetching funcionarios with role ${role}:`, error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} funcionarios with role ${role}:`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching funcionarios with role ${role}:`, error);
    throw error;
  }
};

// Function to fetch funcionarios by role name containing a keyword
export const fetchFuncionariosByRoleKeyword = async (keyword: string): Promise<any[]> => {
  try {
    console.log(`Fetching funcionarios with role containing keyword: ${keyword}`);
    
    const { data, error } = await supabase
      .from("bd_funcionarios")
      .select(`
        id,
        nome_completo,
        funcao_id,
        bd_funcoes (id, nome_funcao)
      `)
      .ilike("bd_funcoes.nome_funcao", `%${keyword}%`);

    if (error) {
      console.error(`Error fetching funcionarios with role keyword ${keyword}:`, error);
      throw new Error(error.message);
    }
    
    console.log(`Found ${data?.length || 0} funcionarios with role keyword ${keyword}:`, data);
    return data || [];
  } catch (error) {
    console.error(`Error fetching funcionarios with role keyword ${keyword}:`, error);
    throw error;
  }
};
