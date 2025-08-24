
import { supabase } from "@/integrations/supabase/client";
import { Requisicao, RequisicaoWithRuas, RuaRequisicao, RequisicaoFilters } from "@/types/requisicao";
import { debugLog, logSQLError, prettyStringify } from "@/lib/debug";
import { getCurrentUser } from "@/lib/auth";

// Get all requisitions with optional filters
export const fetchRequisicoes = async (filters: RequisicaoFilters = {}) => {
  let query = supabase
    .from('bd_requisicoes')
    .select(`
      *,
      centro_custo:bd_centros_custo(id, nome_centro_custo),
      engenheiro:bd_funcionarios(id, nome_completo)
    `);

  // Apply filters
  if (filters.numero) {
    query = query.ilike('numero', `%${filters.numero}%`);
  }
  
  if (filters.centro_custo_id) {
    query = query.eq('centro_custo_id', filters.centro_custo_id);
  }
  
  if (filters.engenheiro_id) {
    query = query.eq('engenheiro_id', filters.engenheiro_id);
  }
  
  if (filters.data_inicio && filters.data_fim) {
    query = query.gte('data_requisicao', filters.data_inicio.toISOString().split('T')[0])
                .lte('data_requisicao', filters.data_fim.toISOString().split('T')[0]);
  } else if (filters.data_inicio) {
    query = query.gte('data_requisicao', filters.data_inicio.toISOString().split('T')[0]);
  } else if (filters.data_fim) {
    query = query.lte('data_requisicao', filters.data_fim.toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requisicoes:', error);
    throw error;
  }

  return data || [];
};

// Get a single requisition with all its streets
export const fetchRequisicaoById = async (id: string): Promise<RequisicaoWithRuas> => {
  // Fetch the requisition
  const { data: requisicao, error } = await supabase
    .from('bd_requisicoes')
    .select(`
      *,
      centro_custo:bd_centros_custo(id, nome_centro_custo),
      engenheiro:bd_funcionarios(id, nome_completo)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching requisicao:', error);
    throw error;
  }

  if (!requisicao) {
    throw new Error('Requisição não encontrada');
  }

  // Fetch the streets for this requisition
  const { data: ruas, error: ruasError } = await supabase
    .from('bd_ruas_requisicao')
    .select('*')
    .eq('requisicao_id', id);

  if (ruasError) {
    console.error('Error fetching ruas for requisicao:', ruasError);
    throw ruasError;
  }

  return {
    ...requisicao,
    ruas: ruas || []
  };
};

// Helper function to get and validate current user's funcionario ID
const getCurrentUserFuncionarioId = async (): Promise<string> => {
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.email) {
    throw new Error('Usuário não autenticado');
  }

  // Search for funcionario by email
  const { data: funcionarios, error } = await supabase
    .from('bd_funcionarios')
    .select('id, nome_completo, email')
    .eq('email', currentUser.email)
    .limit(1);

  if (error) {
    console.error('Error finding funcionario:', error);
    throw new Error('Erro ao buscar funcionário no sistema');
  }

  if (!funcionarios || funcionarios.length === 0) {
    throw new Error('Usuário não encontrado na tabela de funcionários. Entre em contato com o administrador.');
  }

  return funcionarios[0].id;
};

// Create a new requisition with streets
export const createRequisicao = async (
  requisicao: Omit<Requisicao, 'id' | 'numero' | 'created_at' | 'updated_at'>,
  ruas: Omit<RuaRequisicao, 'id' | 'requisicao_id' | 'created_at' | 'updated_at' | 'area' | 'volume'>[]
): Promise<string> => {
  debugLog("createRequisicao - Input requisicao", requisicao);
  debugLog("createRequisicao - Input ruas", ruas);
  
  // Security validation: ensure engenheiro_id matches current user
  const currentUserFuncionarioId = await getCurrentUserFuncionarioId();
  
  if (requisicao.engenheiro_id !== currentUserFuncionarioId) {
    throw new Error('Não é possível criar requisições em nome de terceiros. O engenheiro responsável deve ser o usuário logado.');
  }
  
  // Generate a unique requisition number (format: YYYY + sequential number)
  const year = new Date().getFullYear();
  const { data: lastReq, error: countError } = await supabase
    .from('bd_requisicoes')
    .select('numero')
    .ilike('numero', `${year}%`)
    .order('numero', { ascending: false })
    .limit(1);

  if (countError) {
    logSQLError(countError, "getting last requisition number");
    throw countError;
  }

  let numero: string;
  if (lastReq && lastReq.length > 0) {
    const lastNumber = parseInt(lastReq[0].numero.substring(4));
    numero = `${year}${(lastNumber + 1).toString().padStart(3, '0')}`;
  } else {
    numero = `${year}001`;
  }
  
  debugLog("createRequisicao - Generated numero", numero);

  // Create the requisition
  const { data: newRequisicao, error } = await supabase
    .from('bd_requisicoes')
    .insert({
      ...requisicao,
      numero
    })
    .select()
    .single();

  if (error) {
    logSQLError(error, "creating requisicao");
    throw error;
  }
  
  debugLog("createRequisicao - New requisicao created", newRequisicao);

  // Create the streets
  if (ruas.length > 0) {
    try {
      // Prepare streets for insert WITHOUT area and volume (let them be generated by the database)
      const ruasForInsert = ruas.map(rua => ({
        id: crypto.randomUUID(),
        requisicao_id: newRequisicao.id,
        logradouro: rua.logradouro,
        bairro: rua.bairro,
        largura: rua.largura,
        comprimento: rua.comprimento,
        pintura_ligacao: rua.pintura_ligacao,
        traco: rua.traco,
        espessura: rua.espessura
      }));
      
      debugLog("createRequisicao - Prepared streets for insertion", ruasForInsert);

      const { error: ruasError } = await supabase
        .from('bd_ruas_requisicao')
        .insert(ruasForInsert);

      if (ruasError) {
        logSQLError(ruasError, "creating ruas for requisicao");
        // Delete the requisition to avoid orphaned data
        await supabase.from('bd_requisicoes').delete().eq('id', newRequisicao.id);
        throw ruasError;
      }
    } catch (error) {
      console.error("Error in street creation block:", error);
      // Delete the requisition to avoid orphaned data
      await supabase.from('bd_requisicoes').delete().eq('id', newRequisicao.id);
      throw error;
    }
  }

  return newRequisicao.id;
};

// Update an existing requisition and its streets
export const updateRequisicao = async (
  id: string,
  requisicao: Partial<Omit<Requisicao, 'id' | 'numero' | 'created_at' | 'updated_at'>>,
  ruas: Omit<RuaRequisicao, 'id' | 'requisicao_id' | 'created_at' | 'updated_at' | 'area' | 'volume'>[]
): Promise<void> => {
  debugLog("updateRequisicao - Input requisicao", requisicao);
  debugLog("updateRequisicao - Input ruas", ruas);
  
  // Security validation: ensure engenheiro_id matches current user (if being updated)
  if (requisicao.engenheiro_id) {
    const currentUserFuncionarioId = await getCurrentUserFuncionarioId();
    
    if (requisicao.engenheiro_id !== currentUserFuncionarioId) {
      throw new Error('Não é possível alterar requisições para terceiros. O engenheiro responsável deve ser o usuário logado.');
    }
  }
  
  // Update the requisition
  const { error } = await supabase
    .from('bd_requisicoes')
    .update(requisicao)
    .eq('id', id);

  if (error) {
    logSQLError(error, "updating requisicao");
    throw error;
  }

  // Delete existing streets and add new ones
  if (ruas.length > 0) {
    // Delete existing streets
    const { error: deleteError } = await supabase
      .from('bd_ruas_requisicao')
      .delete()
      .eq('requisicao_id', id);

    if (deleteError) {
      logSQLError(deleteError, "deleting existing ruas");
      throw deleteError;
    }

    // Prepare streets for insert WITHOUT area and volume (let them be generated by the database)
    const ruasForInsert = ruas.map(rua => ({
      id: crypto.randomUUID(),
      requisicao_id: id,
      logradouro: rua.logradouro,
      bairro: rua.bairro,
      largura: rua.largura,
      comprimento: rua.comprimento,
      pintura_ligacao: rua.pintura_ligacao,
      traco: rua.traco,
      espessura: rua.espessura
    }));

    debugLog("updateRequisicao - Prepared streets for update", ruasForInsert);

    const { error: insertError } = await supabase
      .from('bd_ruas_requisicao')
      .insert(ruasForInsert);

    if (insertError) {
      logSQLError(insertError, "creating new ruas for requisicao");
      throw insertError;
    }
  }
};

// Check if requisition can be deleted (no cargo records exist)
export const checkRequisicaoCanBeDeleted = async (requisicaoId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  details: {
    totalProgramacoes: number;
    totalEntregas: number;
    totalCargas: number;
  }
}> => {
  debugLog("checkRequisicaoCanBeDeleted - Checking requisicao", requisicaoId);
  
  // Query to check dependencies through the relationship chain
  const { data: programacoes, error } = await supabase
    .from('bd_programacao_entrega')
    .select(`
      id,
      bd_lista_programacao_entrega(
        id,
        bd_registro_cargas(id)
      )
    `)
    .eq('requisicao_id', requisicaoId);

  if (error) {
    logSQLError(error, "checking requisicao dependencies");
    throw error;
  }

  const totalProgramacoes = programacoes?.length || 0;
  const totalEntregas = programacoes?.reduce((sum, prog) => 
    sum + (prog.bd_lista_programacao_entrega?.length || 0), 0) || 0;
  const totalCargas = programacoes?.reduce((sum, prog) => 
    sum + (prog.bd_lista_programacao_entrega?.reduce((subSum, entrega) => 
      subSum + (entrega.bd_registro_cargas?.length || 0), 0) || 0), 0) || 0;

  debugLog("checkRequisicaoCanBeDeleted - Dependencies found", {
    totalProgramacoes,
    totalEntregas, 
    totalCargas
  });

  const canDelete = totalCargas === 0;
  const reason = totalCargas > 0 ? 
    `Não é possível excluir: existem ${totalCargas} registro(s) de carga relacionados. Para excluir esta requisição, primeiro remova todos os registros de carga.` : 
    undefined;

  return {
    canDelete,
    reason,
    details: { totalProgramacoes, totalEntregas, totalCargas }
  };
};

// Delete a requisition with validation
export const deleteRequisicao = async (id: string): Promise<void> => {
  debugLog("deleteRequisicao - Starting deletion process for", id);
  
  // First, validate if deletion is allowed
  const validation = await checkRequisicaoCanBeDeleted(id);
  
  if (!validation.canDelete) {
    debugLog("deleteRequisicao - Deletion blocked", validation.reason);
    throw new Error(validation.reason || 'Não é possível excluir esta requisição');
  }

  debugLog("deleteRequisicao - Validation passed, proceeding with deletion", validation.details);

  // Proceed with deletion - CASCADE will handle related records
  const { error } = await supabase
    .from('bd_requisicoes')
    .delete()
    .eq('id', id);

  if (error) {
    logSQLError(error, "deleting requisicao");
    throw error;
  }

  debugLog("deleteRequisicao - Successfully deleted requisicao", id);
};

// Import requisitions from CSV/Excel
export const importRequisicoes = async (
  requisicoes: Array<{
    requisicao: Omit<Requisicao, 'id' | 'numero' | 'created_at' | 'updated_at'>;
    ruas: Omit<RuaRequisicao, 'id' | 'requisicao_id' | 'created_at' | 'updated_at'>[];
  }>
): Promise<{ success: string[]; errors: string[] }> => {
  const results = {
    success: [] as string[],
    errors: [] as string[]
  };

  for (const item of requisicoes) {
    try {
      const id = await createRequisicao(item.requisicao, item.ruas);
      results.success.push(id);
    } catch (error) {
      console.error('Error importing requisicao:', error);
      results.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return results;
};

// Export requisitions to Excel
export const exportRequisicoes = async (filters: RequisicaoFilters = {}): Promise<any[]> => {
  const requisicoes = await fetchRequisicoes(filters);
  const exportData = [];

  for (const requisicao of requisicoes) {
    const { data: ruas, error } = await supabase
      .from('bd_ruas_requisicao')
      .select('*')
      .eq('requisicao_id', requisicao.id);

    if (error) {
      console.error('Error fetching ruas for export:', error);
      throw error;
    }

    if (ruas.length === 0) {
      // If no streets, still export the requisition header
      exportData.push({
        numero: requisicao.numero,
        centro_custo: requisicao.centro_custo?.nome_centro_custo || '',
        diretoria: requisicao.diretoria || '',
        gerencia: requisicao.gerencia || '',
        engenheiro: requisicao.engenheiro?.nome_completo || '',
        data_requisicao: requisicao.data_requisicao,
        logradouro: '',
        bairro: '',
        largura: '',
        comprimento: '',
        area: '',
        pintura_ligacao: '',
        traco: '',
        espessura: '',
        volume: ''
      });
    } else {
      // Export each street with requisition details
      for (const rua of ruas) {
        exportData.push({
          numero: requisicao.numero,
          centro_custo: requisicao.centro_custo?.nome_centro_custo || '',
          diretoria: requisicao.diretoria || '',
          gerencia: requisicao.gerencia || '',
          engenheiro: requisicao.engenheiro?.nome_completo || '',
          data_requisicao: requisicao.data_requisicao,
          logradouro: rua.logradouro,
          bairro: rua.bairro || '',
          largura: rua.largura,
          comprimento: rua.comprimento,
          area: rua.area,
          pintura_ligacao: rua.pintura_ligacao,
          traco: rua.traco,
          espessura: rua.espessura,
          volume: rua.volume
        });
      }
    }
  }

  return exportData;
};
