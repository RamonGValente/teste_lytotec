
import { supabase } from "@/integrations/supabase/client";
import { ChamadoOS, ChamadoFilterParams } from "@/types/chamadoOS";
import { uploadImage } from "./storageService";

// Helper function to generate sequential number for chamados
const generateChamadoNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  
  // Get count of chamados for the current year
  const { count, error } = await supabase
    .from('bd_chamados_os')
    .select('*', { count: 'exact', head: true })
    .like('numero_chamado', `${year}%`);
    
  if (error) throw error;
  
  // Generate number in format YYYY + sequential 3-digit number (e.g., 2024001)
  const sequentialNumber = (count || 0) + 1;
  return `${year}${sequentialNumber.toString().padStart(3, '0')}`;
};

// Function to fetch chamados with filters
export const fetchChamados = async (
  filters: ChamadoFilterParams = {}
): Promise<ChamadoOS[]> => {
  let query = supabase
    .from('bd_chamados_os')
    .select(`
      *,
      centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
      caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.numero_chamado) {
    query = query.ilike('numero_chamado', `%${filters.numero_chamado}%`);
  }
  
  if (filters.caminhao_equipamento_id) {
    query = query.eq('caminhao_equipamento_id', filters.caminhao_equipamento_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.data_inicio) {
    query = query.gte('data_solicitacao', filters.data_inicio);
  }
  
  if (filters.data_fim) {
    query = query.lte('data_solicitacao', filters.data_fim);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  // Get solicitante details separately
  if (data && data.length > 0) {
    const solicitanteIds = [...new Set(data.map(chamado => chamado.solicitante_id))].filter(Boolean);
    
    if (solicitanteIds.length > 0) {
      const { data: solicitantes, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .in('id', solicitanteIds);
      
      if (!profileError && solicitantes) {
        // Map solicitante details to chamados
        return data.map(chamado => {
          const solicitante = solicitantes.find(s => s.id === chamado.solicitante_id);
          return {
            ...chamado,
            solicitante: solicitante ? solicitante : null
          };
        }) as ChamadoOS[];
      }
    }
  }
  
  return data as ChamadoOS[];
};

// Function to create a new chamado
export const createChamado = async (
  chamadoData: Omit<ChamadoOS, 'id' | 'numero_chamado' | 'data_solicitacao' | 'hora_solicitacao' | 'created_at' | 'updated_at'>,
  fotoFiles?: File[]
): Promise<ChamadoOS> => {
  try {
    // Generate chamado number
    const numero_chamado = await generateChamadoNumber();
    
    // Get current date and time
    const now = new Date();
    const data_solicitacao = now.toISOString().split('T')[0];
    const hora_solicitacao = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Upload photos if provided
    let fotos_avarias: string[] = [];
    if (fotoFiles && fotoFiles.length > 0) {
      fotos_avarias = await Promise.all(
        fotoFiles.map(file => uploadImage(file, 'os_photos'))
      );
    }
    
    // Create chamado record
    const { data, error } = await supabase
      .from('bd_chamados_os')
      .insert({
        ...chamadoData,
        numero_chamado,
        data_solicitacao,
        hora_solicitacao,
        fotos_avarias: fotos_avarias.length > 0 ? fotos_avarias : undefined
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Get solicitante details
    if (data && data.solicitante_id) {
      const { data: solicitante, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .eq('id', data.solicitante_id)
        .single();
        
      if (!profileError && solicitante) {
        return { ...data, solicitante } as ChamadoOS;
      }
    }
    
    return data as ChamadoOS;
  } catch (error) {
    console.error('Error creating chamado:', error);
    throw error;
  }
};

// Function to update an existing chamado
export const updateChamado = async (
  id: string,
  chamadoData: Partial<ChamadoOS>,
  newFotoFiles?: File[]
): Promise<ChamadoOS> => {
  try {
    // Get current chamado to preserve existing photos
    const { data: currentChamado, error: fetchError } = await supabase
      .from('bd_chamados_os')
      .select('fotos_avarias')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Upload new photos if provided
    let fotos_avarias = currentChamado.fotos_avarias || [];
    if (newFotoFiles && newFotoFiles.length > 0) {
      const newFotos = await Promise.all(
        newFotoFiles.map(file => uploadImage(file, 'os_photos'))
      );
      fotos_avarias = [...fotos_avarias, ...newFotos];
    }
    
    // Update chamado record
    const { data, error } = await supabase
      .from('bd_chamados_os')
      .update({
        ...chamadoData,
        fotos_avarias
      })
      .eq('id', id)
      .select(`
        *,
        centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
        caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
      `)
      .single();
      
    if (error) throw error;
    
    // Get solicitante details
    if (data && data.solicitante_id) {
      const { data: solicitante, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .eq('id', data.solicitante_id)
        .single();
        
      if (!profileError && solicitante) {
        return { ...data, solicitante } as ChamadoOS;
      }
    }
    
    return data as ChamadoOS;
  } catch (error) {
    console.error('Error updating chamado:', error);
    throw error;
  }
};

// Function to delete a chamado
export const deleteChamado = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('bd_chamados_os')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

// Function to get a single chamado by ID
export const getChamadoById = async (id: string): Promise<ChamadoOS> => {
  const { data, error } = await supabase
    .from('bd_chamados_os')
    .select(`
      *,
      centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
      caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  // Get solicitante details
  if (data && data.solicitante_id) {
    const { data: solicitante, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, nome_completo')
      .eq('id', data.solicitante_id)
      .single();
      
    if (!profileError && solicitante) {
      return { ...data, solicitante } as ChamadoOS;
    }
  }
  
  return data as ChamadoOS;
};

// Function to export chamados to Excel/CSV
export const exportChamadosToExcel = async (filters: ChamadoFilterParams = {}): Promise<Blob> => {
  // In a real application, this would generate an Excel file
  // For now, we'll mock this by creating a CSV file
  
  try {
    const chamados = await fetchChamados(filters);
    
    // Create CSV header
    const headers = ['Número', 'Data', 'Solicitante', 'Centro de Custo', 'Veículo', 'Tipo de Falha', 'Prioridade', 'Status'];
    
    // Format data for CSV
    const rows = chamados.map(chamado => [
      chamado.numero_chamado,
      new Date(chamado.data_solicitacao).toLocaleDateString('pt-BR'),
      chamado.solicitante?.nome_completo || chamado.solicitante?.email || 'N/A',
      chamado.centro_custo?.codigo_centro_custo || 'N/A',
      chamado.caminhao_equipamento?.placa || 'N/A',
      chamado.tipo_falha || 'N/A',
      chamado.prioridade,
      chamado.status
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create Blob with CSV content
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  } catch (error) {
    console.error('Error exporting chamados:', error);
    throw error;
  }
};
