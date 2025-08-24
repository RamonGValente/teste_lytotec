
import { supabase } from "@/integrations/supabase/client";

// Function to fetch funcionarios by role (function name)
export const fetchFuncionariosByRole = async (roleName: string): Promise<any[]> => {
  try {
    console.log(`Fetching funcionarios with role: ${roleName}`);
    
    const { data, error } = await supabase
      .from("bd_funcionarios")
      .select(`
        *,
        bd_funcoes (*)
      `)
      .not('funcao_id', 'is', null)
      .filter('bd_funcoes.nome_funcao', 'ilike', `%${roleName}%`);
    
    if (error) {
      console.error("Error fetching funcionarios by role:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} funcionarios with role ${roleName}`);
    return data || [];
  } catch (error) {
    console.error(`Error in fetchFuncionariosByRole(${roleName}):`, error);
    throw error;
  }
};
