
import { supabase } from "@/integrations/supabase/client";
import { Funcionario, FuncionarioFormData, FuncionarioFilter } from "@/types/funcionario";
import { addDays } from "date-fns";

// Function to fetch funcionarios with filters
export const fetchFuncionarios = async (filters: FuncionarioFilter = {}): Promise<Funcionario[]> => {
  try {
    let query = supabase
      .from("bd_funcionarios")
      .select(`
        *,
        bd_funcoes (*),
        bd_departamentos (*),
        bd_centros_custo (*),
        bd_empresas (*)
      `);

    // Apply filters
    if (filters.nome_completo) {
      query = query.ilike("nome_completo", `%${filters.nome_completo}%`);
    }

    if (filters.data_admissao_inicio) {
      query = query.gte("data_admissao", filters.data_admissao_inicio);
    }

    if (filters.data_admissao_fim) {
      query = query.lte("data_admissao", filters.data_admissao_fim);
    }

    // For function filter - handle both UUID and text search, exclude nulls
    if (filters.funcao_id) {
      // First exclude null values
      query = query.not('funcao_id', 'is', null);
      
      // Check if it's a UUID or a search string
      if (filters.funcao_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq("funcao_id", filters.funcao_id);
      } else {
        // If not a UUID, search by funcao name using a join
        query = query.filter('bd_funcoes.nome_funcao', 'ilike', `%${filters.funcao_id}%`);
      }
    }

    // For department filter - handle both UUID and text search, exclude nulls
    if (filters.departamento_id) {
      // First exclude null values
      query = query.not('departamento_id', 'is', null);
      
      // Check if it's a UUID or a search string
      if (filters.departamento_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq("departamento_id", filters.departamento_id);
      } else {
        // If not a UUID, search by departamento name using a join
        query = query.filter('bd_departamentos.nome_departamento', 'ilike', `%${filters.departamento_id}%`);
      }
    }

    // For cost center filter - handle both UUID and text search, exclude nulls
    if (filters.centro_custo_id) {
      // First exclude null values
      query = query.not('centro_custo_id', 'is', null);
      
      // Check if it's a UUID or a search string
      if (filters.centro_custo_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        query = query.eq("centro_custo_id", filters.centro_custo_id);
      } else {
        // If not a UUID, search by centro_custo name using a join
        query = query.filter('bd_centros_custo.nome_centro_custo', 'ilike', `%${filters.centro_custo_id}%`);
      }
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    
    // Buscar as equipes separadamente para evitar conflito de relacionamentos múltiplos
    const funcionariosComEquipes = await Promise.all(
      (data || []).map(async (funcionario) => {
        if (funcionario.equipe_id) {
          const { data: equipe } = await supabase
            .from("bd_equipes")
            .select("*")
            .eq("id", funcionario.equipe_id)
            .single();
          
          return {
            ...funcionario,
            bd_equipes: equipe
          };
        }
        return funcionario;
      })
    );
    
    return funcionariosComEquipes as unknown as Funcionario[];
  } catch (error) {
    console.error("Error fetching funcionarios:", error);
    throw error;
  }
};

// Function to get funcionario by ID
export const getFuncionarioById = async (id: string): Promise<Funcionario> => {
  try {
    const { data, error } = await supabase
      .from("bd_funcionarios")
      .select(`
        *,
        bd_funcoes (*),
        bd_departamentos (*),
        bd_centros_custo (*),
        bd_empresas (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    
    // Buscar a equipe separadamente para evitar conflito de relacionamentos múltiplos
    let funcionarioComEquipe = data;
    if (data.equipe_id) {
      const { data: equipe } = await supabase
        .from("bd_equipes")
        .select("*")
        .eq("id", data.equipe_id)
        .single();
      
      funcionarioComEquipe = {
        ...data,
        bd_equipes: equipe
      } as any;
    }
    
    return funcionarioComEquipe as unknown as Funcionario;
  } catch (error) {
    console.error(`Error fetching funcionario with id ${id}:`, error);
    throw error;
  }
};

// Helper function to sanitize date fields and UUID references
const sanitizeFormData = (data: FuncionarioFormData) => {
  const sanitizedData = { ...data };
  
  // Convert empty strings to null for date fields
  if (sanitizedData.data_nascimento === "") sanitizedData.data_nascimento = null;
  if (sanitizedData.data_admissao === "") sanitizedData.data_admissao = null;
  if (sanitizedData.data_ferias === "") sanitizedData.data_ferias = null;
  if (sanitizedData.data_demissao === "") sanitizedData.data_demissao = null;
  
  // Convert empty strings to null for UUID references
  if (sanitizedData.funcao_id === "") sanitizedData.funcao_id = null;
  if (sanitizedData.departamento_id === "") sanitizedData.departamento_id = null;
  if (sanitizedData.centro_custo_id === "") sanitizedData.centro_custo_id = null;
  if (sanitizedData.empresa_id === "") sanitizedData.empresa_id = null;
  if (sanitizedData.equipe_id === "") sanitizedData.equipe_id = null;
  
  return sanitizedData;
};

// Function to create new funcionario
export const createFuncionario = async (data: FuncionarioFormData): Promise<Funcionario> => {
  try {
    // Sanitize form data (convert empty strings to null)
    const sanitizedData = sanitizeFormData(data);
    
    // Calculate data_ferias if data_admissao is provided
    let funcionarioData = { ...sanitizedData };
    if (funcionarioData.data_admissao) {
      const admissionDate = new Date(funcionarioData.data_admissao);
      const feriasDays = 365; // 1 year for vacation
      const feriasDate = addDays(admissionDate, feriasDays);
      funcionarioData.data_ferias = feriasDate.toISOString().split("T")[0];
    }

    // Set status based on admission and dismissal dates
    if (!funcionarioData.status) {
      if (!funcionarioData.data_demissao) {
        funcionarioData.status = "Ativo";
      } else {
        const today = new Date();
        const dismissalDate = new Date(funcionarioData.data_demissao);
        funcionarioData.status = dismissalDate > today ? "Aviso Prévio" : "Inativo";
      }
    }

    // Log the data being sent to the database for debugging
    console.log("Creating funcionario with data:", funcionarioData);

    const { data: newFuncionario, error } = await supabase
      .from("bd_funcionarios")
      .insert(funcionarioData as any)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message);
    }
    
    return newFuncionario as unknown as Funcionario;
  } catch (error) {
    console.error("Error creating funcionario:", error);
    throw error;
  }
};

// Function to update funcionario
export const updateFuncionario = async (id: string, data: FuncionarioFormData): Promise<Funcionario> => {
  try {
    // Sanitize form data (convert empty strings to null)
    const sanitizedData = sanitizeFormData(data);
    
    // Calculate data_ferias if data_admissao is provided and different from existing
    let funcionarioData = { ...sanitizedData };
    if (funcionarioData.data_admissao) {
      const admissionDate = new Date(funcionarioData.data_admissao);
      const feriasDays = 365; // 1 year for vacation
      const feriasDate = addDays(admissionDate, feriasDays);
      funcionarioData.data_ferias = feriasDate.toISOString().split("T")[0];
    }

    // Set status based on admission and dismissal dates
    if (!funcionarioData.status) {
      if (!funcionarioData.data_demissao) {
        funcionarioData.status = "Ativo";
      } else {
        const today = new Date();
        const dismissalDate = new Date(funcionarioData.data_demissao);
        funcionarioData.status = dismissalDate > today ? "Aviso Prévio" : "Inativo";
      }
    }

    // Log the data being sent to the database for debugging
    console.log("Updating funcionario with data:", funcionarioData);

    const { data: updatedFuncionario, error } = await supabase
      .from("bd_funcionarios")
      .update(funcionarioData as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message);
    }
    
    return updatedFuncionario as unknown as Funcionario;
  } catch (error) {
    console.error(`Error updating funcionario with id ${id}:`, error);
    throw error;
  }
};

// Function to check if a funcionario has references in other tables
export const checkFuncionarioReferences = async (id: string): Promise<{ hasReferences: boolean; referencedIn: string[] }> => {
  try {
    console.log("🔍 Verificando referências do funcionário:", id);
    
    const references: string[] = [];
    
    // Check references in bd_registro_apontamento_cam_equipa
    const { count: apontamentosCount, error: apontamentosError } = await supabase
      .from("bd_registro_apontamento_cam_equipa")
      .select("id", { count: "exact", head: true })
      .eq("operador_id", id);
    
    if (apontamentosError) {
      console.error("❌ Erro ao verificar apontamentos:", apontamentosError);
      throw apontamentosError;
    }
    if (apontamentosCount && apontamentosCount > 0) {
      references.push("Registros de Apontamento de Caminhões/Equipamentos");
      console.log("⚠️ Encontradas referências em apontamentos:", apontamentosCount);
    }
    
    // Check references in bd_equipes (for encarregado_id and apontador_id)
    const { count: equipesEncarregadoCount, error: equipesEncarregadoError } = await supabase
      .from("bd_equipes")
      .select("id", { count: "exact", head: true })
      .eq("encarregado_id", id);
    
    if (equipesEncarregadoError) {
      console.error("❌ Erro ao verificar equipes (encarregado):", equipesEncarregadoError);
      throw equipesEncarregadoError;
    }
    if (equipesEncarregadoCount && equipesEncarregadoCount > 0) {
      references.push("Equipes (como Encarregado)");
      console.log("⚠️ Encontradas referências em equipes como encarregado:", equipesEncarregadoCount);
    }
    
    const { count: equipesApontadorCount, error: equipesApontadorError } = await supabase
      .from("bd_equipes")
      .select("id", { count: "exact", head: true })
      .eq("apontador_id", id);
    
    if (equipesApontadorError) {
      console.error("❌ Erro ao verificar equipes (apontador):", equipesApontadorError);
      throw equipesApontadorError;
    }
    if (equipesApontadorCount && equipesApontadorCount > 0) {
      references.push("Equipes (como Apontador)");
      console.log("⚠️ Encontradas referências em equipes como apontador:", equipesApontadorCount);
    }
    
    // Check references in bd_avaliacao_equipe
    const { count: avaliacaoCount, error: avaliacaoError } = await (supabase as any)
      .from("bd_avaliacao_equipe")
      .select("id", { count: "exact", head: true })
      .eq("colaborador_id", id);
    
    if (avaliacaoError) {
      console.error("❌ Erro ao verificar avaliações:", avaliacaoError);
      throw avaliacaoError;
    }
    if (avaliacaoCount && avaliacaoCount > 0) {
      references.push("Avaliações de Equipe");
      console.log("⚠️ Encontradas referências em avaliações:", avaliacaoCount);
    }
    
    console.log("✅ Verificação de referências concluída:", { hasReferences: references.length > 0, referencedIn: references });
    
    return {
      hasReferences: references.length > 0,
      referencedIn: references
    };
  } catch (error) {
    console.error("❌ Erro ao verificar referências do funcionário:", error);
    throw new Error("Não foi possível verificar referências do funcionário");
  }
};

// Function to delete funcionario with SuperAdmin bypass
export const deleteFuncionarioWithBypass = async (id: string): Promise<void> => {
  try {
    console.log("🗑️ Tentando excluir funcionário com bypass SuperAdmin:", id);
    
    const { data, error } = await (supabase as any).rpc('delete_funcionario_with_admin_bypass', {
      funcionario_id: id
    });

    if (error) {
      console.error("❌ Erro ao excluir funcionário com bypass:", error);
      throw new Error(error.message);
    }
    
    if (data === false) {
      console.error("❌ Usuário não tem permissão para bypass");
      throw new Error("Usuário não tem permissão para forçar exclusão");
    }
    
    console.log("✅ Funcionário excluído com bypass SuperAdmin:", id);
  } catch (error) {
    console.error(`❌ Erro ao excluir funcionário com bypass ${id}:`, error);
    throw error;
  }
};

// Function to delete funcionario (standard)
export const deleteFuncionario = async (id: string): Promise<void> => {
  try {
    console.log("🗑️ Tentando excluir funcionário:", id);
    
    const { error } = await supabase
      .from("bd_funcionarios")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao excluir funcionário:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Funcionário excluído com sucesso:", id);
  } catch (error) {
    console.error(`❌ Erro ao excluir funcionário com id ${id}:`, error);
    throw error;
  }
};

// Function to debug user authentication
export const debugUserAuth = async (): Promise<any> => {
  try {
    const { data, error } = await (supabase as any).rpc('debug_user_authentication');
    
    if (error) {
      console.error("❌ Erro ao fazer debug de autenticação:", error);
      throw error;
    }
    
    console.log("🔐 Debug de autenticação:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro no debug de autenticação:", error);
    throw error;
  }
};

// Function to process import data
export const processImportData = async (
  importData: any[]
): Promise<{ success: number; errors: any[] }> => {
  const results = {
    success: 0,
    errors: [] as any[],
  };

  try {
    console.log("Iniciando importação de funcionários, total:", importData.length);
    
    for (const item of importData) {
      try {
        // Transform imported data to match our model
        const funcionarioData: FuncionarioFormData = {
          nome_completo: item["Nome Completo"] || item.nome_completo || "",
          cpf: item.CPF || item.cpf || "",
          data_nascimento: formatExcelDate(item["Data de Nascimento"] || item.data_nascimento),
          email: item.Email || item.email || null,
          endereco_completo: item.Endereço || item.endereco_completo || null,
          escolaridade: item.Escolaridade || item.escolaridade || null,
          genero: item.Gênero || item.genero || null,
          
          // Buscar IDs com base nos nomes
          funcao_id: await getFuncaoIdByName(item.Função || item.funcao),
          departamento_id: await getDepartamentoIdByName(item.Departamento || item.departamento),
          centro_custo_id: await getCentroCustoIdByName(item["Centro de Custo"] || item.centro_custo),
          empresa_id: await getEmpresaIdByName(item.Empresa || item.empresa),
          
          data_admissao: formatExcelDate(item["Data de Admissão"] || item.data_admissao),
          data_demissao: formatExcelDate(item["Data de Demissão"] || item.data_demissao),
          status: item.Status || item.status || "Ativo",
          
          // Dados financeiros
          salario_base: parseNumericField(item["Salário Base"] || item.salario_base),
          insalubridade: parseNumericField(item.Insalubridade || item.insalubridade),
          periculosidade: parseNumericField(item.Periculosidade || item.periculosidade),
          gratificacao: parseNumericField(item.Gratificação || item.gratificacao),
          adicional_noturno: parseNumericField(item.Adicional || item.adicional_noturno),
          custo_passagem: parseNumericField(item["Custo Passagem"] || item.custo_passagem),
          refeicao: parseNumericField(item.Refeição || item.refeicao),
          diarias: parseNumericField(item.Diárias || item.diarias),
        };

        console.log("Dados processados:", funcionarioData);

        // Sanitize the data before inserting
        const sanitizedData = sanitizeFormData(funcionarioData);

        // Calculate data_ferias if data_admissao is provided
        if (sanitizedData.data_admissao) {
          const admissionDate = new Date(sanitizedData.data_admissao);
          const feriasDays = 365; // 1 year for vacation
          const feriasDate = addDays(admissionDate, feriasDays);
          sanitizedData.data_ferias = feriasDate.toISOString().split('T')[0];
        }

        console.log("Processando funcionário:", sanitizedData.nome_completo);
        
        // Logging para debug
        console.log("Dados a inserir:", JSON.stringify(sanitizedData));

        // Verifica CPF duplicado
        const { data: existingFuncionario, error: checkError } = await supabase
          .from("bd_funcionarios")
          .select("id")
          .eq("cpf", sanitizedData.cpf)
          .maybeSingle();
        
        if (checkError) {
          throw new Error(`Erro ao verificar CPF: ${checkError.message}`);
        }
        
        if (existingFuncionario) {
          // Atualiza funcionário existente
          const { data: updatedData, error: updateError } = await supabase
            .from("bd_funcionarios")
            .update(sanitizedData as any)
            .eq("id", existingFuncionario.id)
            .select();
            
          if (updateError) {
            throw new Error(`Erro ao atualizar funcionário: ${updateError.message}`);
          }
          
          console.log("Funcionário atualizado com sucesso:", updatedData);
          results.success++;
        } else {
          // Create the funcionario
          const { data, error } = await supabase
            .from("bd_funcionarios")
            .insert(sanitizedData as any)
            .select();

          if (error) {
            console.error("Erro na inserção:", error);
            throw new Error(`Erro ao inserir funcionário: ${error.message}`);
          }

          console.log("Funcionário inserido com sucesso:", data);
          results.success++;
        }
      } catch (error: any) {
        console.error("Erro ao processar item:", item, error);
        results.errors.push({
          item,
          error: error.message || "Erro desconhecido",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Erro ao processar dados da importação:", error);
    throw error;
  }
};

// Helper functions for import process
async function getFuncaoIdByName(funcaoName: string | undefined | null): Promise<string | undefined> {
  if (!funcaoName) return undefined;
  
  console.log("Buscando função:", funcaoName);
  
  const { data } = await supabase
    .from('bd_funcoes')
    .select('id')
    .ilike('nome_funcao', funcaoName)
    .limit(1);
    
  console.log("Resultado da busca de função:", data);
  return data && data.length > 0 ? data[0].id : undefined;
}

async function getDepartamentoIdByName(departamentoName: string | undefined | null): Promise<string | undefined> {
  if (!departamentoName) return undefined;
  
  console.log("Buscando departamento:", departamentoName);
  
  const { data } = await supabase
    .from('bd_departamentos')
    .select('id')
    .ilike('nome_departamento', departamentoName)
    .limit(1);
    
  console.log("Resultado da busca de departamento:", data);
  return data && data.length > 0 ? data[0].id : undefined;
}

async function getCentroCustoIdByName(centroCustoName: string | undefined | null): Promise<string | undefined> {
  if (!centroCustoName) return undefined;
  
  console.log("Buscando centro de custo:", centroCustoName);
  
  // First try to match by exact name
  let { data } = await supabase
    .from('bd_centros_custo')
    .select('id')
    .ilike('nome_centro_custo', centroCustoName)
    .limit(1);
  
  if (!data || data.length === 0) {
    // If no exact match, try to match with the code+name format
    // (e.g., "L473 - PAVIBRAS CONSORCIO RIO METROPOLE")
    const parts = centroCustoName.split(' - ');
    if (parts.length > 1) {
      // Try to match by code
      const codeSearch = await supabase
        .from('bd_centros_custo')
        .select('id')
        .ilike('codigo_centro_custo', parts[0])
        .limit(1);
      
      if (codeSearch.data && codeSearch.data.length > 0) {
        data = codeSearch.data;
      } else {
        // Try to match by name part
        const nameSearch = await supabase
          .from('bd_centros_custo')
          .select('id')
          .ilike('nome_centro_custo', `%${parts[1]}%`)
          .limit(1);
        
        if (nameSearch.data && nameSearch.data.length > 0) {
          data = nameSearch.data;
        }
      }
    }
  }
    
  console.log("Resultado da busca de centro de custo:", data);
  return data && data.length > 0 ? data[0].id : undefined;
}

async function getEmpresaIdByName(empresaName: string | undefined | null): Promise<string | undefined> {
  if (!empresaName) return undefined;
  
  console.log("Buscando empresa:", empresaName);
  
  const { data } = await supabase
    .from('bd_empresas')
    .select('id')
    .ilike('nome_empresa', empresaName)
    .limit(1);
    
  console.log("Resultado da busca de empresa:", data);
  return data && data.length > 0 ? data[0].id : undefined;
}

function parseNumericField(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  
  // Se for string, tenta converter para número
  if (typeof value === 'string') {
    // Remove R$ e qualquer caracter não numérico, exceto pontos e vírgulas
    const cleanedValue = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return cleanedValue ? parseFloat(cleanedValue) : undefined;
  }
  
  // Se já for número, retorna direto
  if (typeof value === 'number') {
    return value;
  }
  
  return undefined;
}

// Function to properly format Excel dates
function formatExcelDate(value: any): string | null {
  if (!value) return null;
  
  // If it's a number, treat it as an Excel date
  if (typeof value === 'number') {
    console.log("Convertendo data do Excel:", value);
    try {
      // Excel uses a date system based on January 1, 1900
      // Excel has a leap year bug where it thinks 1900 was a leap year
      // For dates after February 28, 1900, we need to subtract 1 day
      
      // Create a Date object from the Excel serial number
      // Excel date 1 = January 1, 1900
      const excelEpoch = new Date(Date.UTC(1900, 0, 1));
      let days = value - 1; // Subtract 1 because Excel day 1 is January 1, 1900
      
      // If date is after the fictional February 29, 1900, subtract a day
      if (value > 60) {
        days -= 1;
      }
      
      // Add the days to the epoch
      const milliseconds = days * 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + milliseconds);
      
      // Format as YYYY-MM-DD
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log("Data convertida:", formattedDate);
      return formattedDate;
    } catch (e) {
      console.error("Erro ao converter data do Excel:", e);
      return null;
    }
  }
  
  // If it's a string in the format DD/MM/YYYY
  if (typeof value === 'string' && value.includes('/')) {
    try {
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        const formattedDate = date.toISOString().split('T')[0];
        console.log("Data convertida de string:", formattedDate);
        return formattedDate;
      }
    } catch (e) {
      console.error("Erro ao converter data de string:", e);
    }
  }
  
  // If it's already in ISO format or another valid format
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Erro ao validar formato de data:", e);
    }
  }
  
  // Return original value if it's already a string
  return typeof value === 'string' ? value : null;
}
