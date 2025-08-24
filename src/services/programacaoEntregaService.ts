import { supabase } from "@/integrations/supabase/client";
import { ProgramacaoEntrega, ListaProgramacaoEntrega, ProgramacaoEntregaWithItems, ProgramacaoEntregaFilters, ItemFormValues } from "@/types/programacaoEntrega";
import { utils, writeFile } from "xlsx";

// Helper function to normalize status values to the union type
const normalizeStatus = (status: string | null | undefined): 'Pendente' | 'Enviada' | 'Cancelada' | 'Entregue' => {
  if (status === 'Enviada') return 'Enviada';
  if (status === 'Cancelada') return 'Cancelada';
  if (status === 'Entregue') return 'Entregue';
  return 'Pendente'; // Default to 'Pendente' for null, undefined, or any other value
};

// Helper function to validate and preserve tipo_lancamento values
const validateTipoLancamento = (tipo: string | null | undefined): string => {
  if (!tipo) return 'Manual'; // Default to 'Manual' if null or undefined
  
  // Keep the exact value as selected by the user
  const validTypes = ['Manual', 'Mecânico', 'Misto'];
  if (validTypes.includes(tipo)) {
    return tipo;
  }
  
  // Fallback to 'Manual' if the value is not recognized
  return 'Manual';
};

// Get all programações with optional filters
export const fetchProgramacoes = async (filters: ProgramacaoEntregaFilters = {}) => {
  let query = supabase
    .from('bd_programacao_entrega')
    .select(`
      *,
      requisicao:bd_requisicoes(id, numero),
      centro_custo:bd_centros_custo(id, codigo_centro_custo, nome_centro_custo)
    `);

  // Apply filters
  if (filters.numero_requisicao) {
    query = query.eq('bd_requisicoes.numero', filters.numero_requisicao);
  }
  
  if (filters.centro_custo_id) {
    query = query.eq('centro_custo_id', filters.centro_custo_id);
  }
  
  if (filters.data_inicio && filters.data_fim) {
    query = query.gte('data_entrega', filters.data_inicio.toISOString().split('T')[0])
                .lte('data_entrega', filters.data_fim.toISOString().split('T')[0]);
  } else if (filters.data_inicio) {
    query = query.gte('data_entrega', filters.data_inicio.toISOString().split('T')[0]);
  } else if (filters.data_fim) {
    query = query.lte('data_entrega', filters.data_fim.toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching programações:', error);
    throw error;
  }

  return data || [];
};

// Get a single programação with all its items
export const fetchProgramacaoById = async (id: string): Promise<ProgramacaoEntregaWithItems> => {
  console.log("Fetching programação by ID:", id);
  
  // Fetch the programação
  const { data: programacao, error } = await supabase
    .from('bd_programacao_entrega')
    .select(`
      *,
      requisicao:bd_requisicoes(id, numero),
      centro_custo:bd_centros_custo(id, nome_centro_custo)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching programação:', error);
    throw error;
  }

  if (!programacao) {
    console.error('Programação não encontrada com ID:', id);
    throw new Error('Programação não encontrada');
  }
  
  console.log("Found programação:", programacao);

  // Fetch the items for this programação with corrected query syntax
  const { data: itens, error: itensError } = await supabase
    .from('bd_lista_programacao_entrega')
    .select(`
      *,
      caminhao:bd_caminhoes_equipamentos!caminhao_id(id, placa, modelo, marca, frota, numero_frota),
      equipe:bd_equipes!equipe_id(id, nome_equipe),
      apontador:bd_funcionarios!apontador_id(id, nome_completo),
      usina:bd_usinas!usina_id(id, nome_usina)
    `)
    .eq('programacao_entrega_id', id);

  if (itensError) {
    console.error('Error fetching items for programação:', itensError);
    throw itensError;
  }
  
  console.log("Found items with corrected query:", itens);

  // Get the centro custo name for display
  let centroCustoName = "";
  if (programacao.centro_custo && typeof programacao.centro_custo === 'object') {
    centroCustoName = (programacao.centro_custo as any).nome_centro_custo || "";
  }

  // Process items correctly - don't override logradouro with centro_custo_nome
  const processedItems = (itens || []).map(item => {
    console.log("Processing item logradouro:", item.logradouro);
    console.log("Processing item caminhao data:", item.caminhao);
    
    return {
      ...item,
      cancelled: normalizeStatus(item.status) === 'Cancelada',
      status: normalizeStatus(item.status),
      // Keep the original logradouro from database, set centro_custo_nome separately
      logradouro: item.logradouro || "", 
      centro_custo_nome: centroCustoName, // Set centro custo name for UI context
      // Keep the tipo_lancamento exactly as stored in the database
      tipo_lancamento: item.tipo_lancamento || 'Manual'
    };
  }) as ListaProgramacaoEntrega[];
  
  console.log("Processed items with logradouro and caminhao data:", processedItems);

  return {
    ...programacao,
    itens: processedItems
  } as any;
};

// Create a new programação with items
export const createProgramacao = async (
  programacao: Omit<ProgramacaoEntrega, 'id' | 'created_at' | 'updated_at'>,
  itens: ItemFormValues[]
): Promise<string> => {
  // Create the programação
  const { data: newProgramacao, error } = await supabase
    .from('bd_programacao_entrega')
    .insert({
      requisicao_id: programacao.requisicao_id,
      centro_custo_id: programacao.centro_custo_id,
      data_entrega: programacao.data_entrega
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating programação:', error);
    throw error;
  }

  // Create the items - process cancelled items correctly
  if (itens.length > 0) {
    console.log("Total items to insert:", itens.length);
    
    // Map each item and apply necessary transformations
    const itensForInsert = itens.map(item => {
      console.log("Processing item for insert, original tipo_lancamento:", item.tipo_lancamento);
      
      // IMPORTANT: Keep the tipo_lancamento exactly as selected by the user
      let safeType = validateTipoLancamento(item.tipo_lancamento);
      
      console.log("Safe tipo_lancamento for database:", safeType);
      
      return {
        programacao_entrega_id: newProgramacao.id,
        requisicao_id: item.requisicao_id,
        logradouro: item.logradouro || item.centro_custo_nome || "", // Use logradouro first, then centro_custo_nome as fallback
        quantidade_massa: item.quantidade_massa,
        caminhao_id: item.caminhao_id,
        tipo_lancamento: safeType,  // Use the validated value for database
        equipe_id: item.equipe_id,
        apontador_id: item.apontador_id,
        usina_id: item.usina_id,
        status: item.status || (item.cancelled ? 'Cancelada' : 'Pendente'), 
        data_entrega: item.data_entrega || programacao.data_entrega // Ensure we always have a date
        // We don't include cancelReason as it's not a database field
      };
    });

    console.log("Items being inserted:", itensForInsert);

    const { error: itensError } = await supabase
      .from('bd_lista_programacao_entrega')
      .insert(itensForInsert);

    if (itensError) {
      // Delete the programação to avoid orphaned data
      await supabase.from('bd_programacao_entrega').delete().eq('id', newProgramacao.id);
      console.error('Error creating items for programação:', itensError);
      throw itensError;
    }
  }

  return newProgramacao.id;
};

// Update an existing programação with items
export const updateProgramacao = async (
  id: string,
  programacao: Partial<Omit<ProgramacaoEntrega, 'id' | 'created_at' | 'updated_at'>>,
  itens: ItemFormValues[]
): Promise<void> => {
  console.log("Updating programação ID:", id);
  console.log("With data:", programacao);
  console.log("Items count:", itens.length);
  
  // Update the programação
  const { error } = await supabase
    .from('bd_programacao_entrega')
    .update({
      requisicao_id: programacao.requisicao_id,
      centro_custo_id: programacao.centro_custo_id,
      data_entrega: programacao.data_entrega
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating programação:', error);
    throw error;
  }

  // Delete existing items and add new ones
  if (true) { // Always run this block to ensure we handle all items
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('bd_lista_programacao_entrega')
      .delete()
      .eq('programacao_entrega_id', id);

    if (deleteError) {
      console.error('Error deleting existing items:', deleteError);
      throw deleteError;
    }

    if (itens.length > 0) {
      console.log("Total items to update:", itens.length);
      
      // Add new items with proper status and data_entrega
      const itensForInsert = itens.map(item => {
        console.log("Processing item for update, original tipo_lancamento:", item.tipo_lancamento);
        
        // IMPORTANT: Keep the tipo_lancamento exactly as selected by the user
        let safeType = validateTipoLancamento(item.tipo_lancamento);
        
        console.log("Safe tipo_lancamento for database:", safeType);
        
        return {
          programacao_entrega_id: id,
          requisicao_id: item.requisicao_id,
          logradouro: item.logradouro || item.centro_custo_nome || "", // Use logradouro first, then centro_custo_nome as fallback
          quantidade_massa: item.quantidade_massa,
          caminhao_id: item.caminhao_id,
          tipo_lancamento: safeType,  // Use the validated value for database
          equipe_id: item.equipe_id,
          apontador_id: item.apontador_id,
          usina_id: item.usina_id,
          status: item.status || (item.cancelled ? 'Cancelada' : 'Pendente'),
          data_entrega: item.data_entrega || programacao.data_entrega // Ensure we always have a date
          // We don't include cancelReason as it's not a database field
        };
      });

      console.log("Items being inserted during update:", itensForInsert);

      const { error: insertError } = await supabase
        .from('bd_lista_programacao_entrega')
        .insert(itensForInsert);

      if (insertError) {
        console.error('Error creating new items for programação:', insertError);
        throw insertError;
      }
    }
  }
};

// Delete a programação
export const deleteProgramacao = async (id: string): Promise<void> => {
  // Due to ON DELETE CASCADE, deleting the programação will automatically delete all items
  const { error } = await supabase
    .from('bd_programacao_entrega')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting programação:', error);
    throw error;
  }
};

// Export programações to Excel
export const exportProgramacoes = async (filters: ProgramacaoEntregaFilters = {}): Promise<any[]> => {
  const programacoes = await fetchProgramacoes(filters);
  const exportData = [];

  for (const programacao of programacoes) {
    const { data: itens, error } = await supabase
      .from('bd_lista_programacao_entrega')
      .select(`
        *,
        caminhao:bd_caminhoes_equipamentos!caminhao_id(id, placa, modelo, marca, frota, numero_frota),
        equipe:bd_equipes!equipe_id(id, nome_equipe),
        apontador:bd_funcionarios!apontador_id(id, nome_completo),
        usina:bd_usinas!usina_id(id, nome_usina)
      `)
      .eq('programacao_entrega_id', programacao.id);

    if (error) {
      console.error('Error fetching items for export:', error);
      throw error;
    }

    if (itens.length === 0) {
      // If no items, still export the programação header
      exportData.push({
        numero_requisicao: programacao.requisicao?.numero || '',
        centro_custo: programacao.centro_custo?.nome_centro_custo || '',
        data_entrega: programacao.data_entrega,
        logradouro: '',
        quantidade_massa: '',
        tipo_lancamento: '',
        caminhao: '',
        equipe: '',
        apontador: '',
        usina: ''
      });
    } else {
      // Export each item with programação details
      for (const item of itens) {
        exportData.push({
          numero_requisicao: programacao.requisicao?.numero || '',
          centro_custo: programacao.centro_custo?.nome_centro_custo || '',
          data_programacao: programacao.data_entrega,
          data_entrega: item.data_entrega,
          logradouro: item.logradouro || '',
          quantidade_massa: item.quantidade_massa,
          tipo_lancamento: item.tipo_lancamento || '',
          caminhao: `${item.caminhao?.placa || ''} - ${item.caminhao?.modelo || ''}`,
          equipe: item.equipe?.nome_equipe || '',
          apontador: item.apontador?.nome_completo || '',
          usina: item.usina?.nome_usina || ''
        });
      }
    }
  }

  return exportData;
};

// Download programações as XLSX
export const downloadProgramacoesAsExcel = async (filters: ProgramacaoEntregaFilters = {}) => {
  try {
    const data = await exportProgramacoes(filters);
    
    // Create workbook and worksheet
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    
    // Generate filename with current date
    const now = new Date();
    const filename = `programacao_entrega_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    // Write workbook and trigger download
    writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting programações:', error);
    throw error;
  }
};

// Fetch caminhões that are operating - improved to include more statuses for editing
export const fetchOperatingVehicles = async () => {
  try {
    console.log("Iniciando a busca de veículos operando");
    const { data, error } = await supabase
      .from('bd_caminhoes_equipamentos')
      .select('id, placa, modelo, frota, marca, tipo_veiculo, capacidade, situacao')
      .in('situacao', ['Operando', 'Disponível']); // Include both for editing purposes
      
    if (error) {
      console.error('Error fetching operating vehicles:', error);
      throw error;
    }
    
    console.log("Veículos retornados:", data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchOperatingVehicles:', error);
    throw error;
  }
};

// Fetch apontador for a given equipe
export const fetchApontadorByEquipeId = async (equipeId: string) => {
  const { data, error } = await supabase
    .from('bd_equipes')
    .select('apontador_id, apontador:bd_funcionarios!bd_equipes_apontador_id_fkey(id, nome_completo)')
    .eq('id', equipeId)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching apontador for equipe:', error);
    throw error;
  }
  
  return data?.apontador || null;
};

// Update status of a delivery item
export const updateDeliveryItemStatus = async (itemId: string, status: 'Pendente' | 'Enviada' | 'Cancelada'): Promise<void> => {
  // First update to Pendente to avoid constraint issues
  if (status === 'Enviada') {
    try {
      await supabase
        .from('bd_lista_programacao_entrega')
        .update({ status: 'Pendente' })
        .eq('id', itemId);
    } catch (error) {
      console.error('Error updating to Pendente first:', error);
      // Continue anyway
    }
  }
  
  // Now update to the desired status
  const { error } = await supabase
    .from('bd_lista_programacao_entrega')
    .update({ status })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating delivery item status:', error);
    throw error;
  }
};
