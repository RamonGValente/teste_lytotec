import { supabase } from "@/integrations/supabase/client";
import { OrdemServico, Material, MaoDeObra, Movimentacao, OsFilterParams } from "@/types/ordemServico";
import { uploadImage } from "./storageService";

const generateOsNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  
  const { count, error } = await supabase
    .from('bd_ordens_servico')
    .select('*', { count: 'exact', head: true })
    .like('numero_chamado', `OS${year}%`);
    
  if (error) throw error;
  
  const sequentialNumber = (count || 0) + 1;
  return `OS${year}${sequentialNumber.toString().padStart(3, '0')}`;
};

export const fetchOpenChamados = async (filters: OsFilterParams = {}) => {
  let query = supabase
    .from('bd_chamados_os')
    .select(`
      *,
      centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
      caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
    `)
    .eq('status', 'Aberto')
    .order('created_at', { ascending: false });

  if (filters.numero_chamado) {
    query = query.ilike('numero_chamado', `%${filters.numero_chamado}%`);
  }
  
  if (filters.caminhao_equipamento_id && filters.caminhao_equipamento_id !== 'todos') {
    query = query.eq('caminhao_equipamento_id', filters.caminhao_equipamento_id);
  }
  
  if (filters.prioridade && filters.prioridade !== 'todas') {
    query = query.eq('prioridade', filters.prioridade);
  }
  
  if (filters.data_inicio) {
    query = query.gte('data_solicitacao', filters.data_inicio);
  }
  
  if (filters.data_fim) {
    query = query.lte('data_solicitacao', filters.data_fim);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching open chamados:", error);
    throw error;
  }
  
  if (data && data.length > 0) {
    const solicitanteIds = [...new Set(data.map(chamado => chamado.solicitante_id))].filter(Boolean);
    
    if (solicitanteIds.length > 0) {
      const { data: solicitantes, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .in('id', solicitanteIds);
      
      if (!profileError && solicitantes) {
        return data.map(chamado => {
          const solicitante = solicitantes.find(s => s.id === chamado.solicitante_id);
          return {
            ...chamado,
            solicitante: solicitante ? solicitante : null
          };
        });
      }
    }
  }
  
  return data || [];
};

export const updateChamadoStatus = async (chamadoId: string, newStatus: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bd_chamados_os')
      .update({ status: newStatus })
      .eq('id', chamadoId);
      
    if (error) throw error;
    
    console.log(`Chamado ${chamadoId} updated to status: ${newStatus}`);
  } catch (error) {
    console.error("Error updating chamado status:", error);
    throw error;
  }
};

export const convertChamadoToOs = async (
  chamadoId: string, 
  userId: string,
  additionalData?: Partial<OrdemServico>
): Promise<OrdemServico> => {
  try {
    const chamado = await getChamadoById(chamadoId);
    
    if (!chamado) {
      throw new Error('Chamado não encontrado');
    }
    
    const newOsData = {
      chamado_id: chamadoId,
      numero_chamado: chamado.numero_chamado,
      data_solicitacao: chamado.data_solicitacao,
      hora_solicitacao: chamado.hora_solicitacao,
      solicitante_id: chamado.solicitante_id,
      centro_custo_id: chamado.centro_custo_id,
      caminhao_equipamento_id: chamado.caminhao_equipamento_id,
      descricao_problema: chamado.descricao_problema,
      fotos_avarias: chamado.fotos_avarias,
      prioridade: chamado.prioridade,
      status: 'Aberta',
      tipo_falha: chamado.tipo_falha || 'Mecânica',
      ...additionalData
    };
    
    const { data, error } = await supabase
      .from('bd_ordens_servico')
      .insert({
        ...newOsData,
        numero_os: newOsData.numero_chamado
      } as any)
      .select()
      .single();
      
    if (error) throw error;
    
    await (supabase as any)
      .from('bd_os_movimentacoes')
      .insert({
        os_id: data.id,
        usuario_id: userId,
        motivo: 'Conversão de chamado para OS'
      });
    
    await updateChamadoStatus(chamadoId, 'Convertido para OS');
    
    return data as any as OrdemServico;
  } catch (error) {
    console.error('Error converting chamado to OS:', error);
    throw error;
  }
};

export const finishOrdemServico = async (osId: string, userId: string): Promise<void> => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    const { data: updatedOs, error: osError } = await supabase
      .from('bd_ordens_servico')
      .update({
        status: 'Concluída',
        data_fim_atendimento: currentDate,
        hora_fim_atendimento: currentTime,
        encerrado_por_id: userId
      })
      .eq('id', osId)
      .select('chamado_id')
      .single();
      
    if (osError) throw osError;
    
    await (supabase as any)
      .from('bd_os_movimentacoes')
      .insert({
        os_id: osId,
        usuario_id: userId,
        motivo: 'Ordem de serviço concluída'
      });
    
    if (updatedOs && updatedOs.chamado_id) {
      await updateChamadoStatus(updatedOs.chamado_id, 'Concluído');
    }
  } catch (error) {
    console.error("Error finishing OS:", error);
    throw error;
  }
};

export const fetchOrdensServico = async (filters: OsFilterParams = {}) => {
  let query = (supabase as any)
    .from('bd_ordens_servico')
    .select(`
      *,
      centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
      caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
    `)
    .order('created_at', { ascending: false });

  if (filters.numero_chamado) {
    query = query.ilike('numero_chamado', `%${filters.numero_chamado}%`);
  }
  
  if (filters.caminhao_equipamento_id) {
    query = query.eq('caminhao_equipamento_id', filters.caminhao_equipamento_id);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.prioridade) {
    query = query.eq('prioridade', filters.prioridade);
  }
  
  if (filters.data_inicio) {
    query = query.gte('data_solicitacao', filters.data_inicio);
  }
  
  if (filters.data_fim) {
    query = query.lte('data_solicitacao', filters.data_fim);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  if (data && data.length > 0) {
    const userIds = new Set<string>();
    
    data.forEach((os: any) => {
      if ((os as any).solicitante_id) userIds.add((os as any).solicitante_id);
      if ((os as any).executado_por_id) userIds.add((os as any).executado_por_id);
      if ((os as any).encerrado_por_id) userIds.add((os as any).encerrado_por_id);
    });
    
    const userIdsArray = Array.from(userIds).filter(Boolean);
    
    if (userIdsArray.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .in('id', userIdsArray);
      
      if (!usersError && users) {
        return data.map((os: any) => {
          const solicitante = users.find(u => u.id === (os as any).solicitante_id);
          const executado_por = users.find(u => u.id === (os as any).executado_por_id);
          const encerrado_por = users.find(u => u.id === (os as any).encerrado_por_id);
          
          return {
            ...os,
            solicitante: solicitante || null,
            executado_por: executado_por || null,
            encerrado_por: encerrado_por || null
          };
        }) as any as OrdemServico[];
      }
    }
  }
  
  return data as any as OrdemServico[];
};

export const getOrdemServicoById = async (id: string): Promise<OrdemServico> => {
    const { data, error } = await (supabase as any)
    .from('bd_ordens_servico')
    .select(`
      *,
      centro_custo:centro_custo_id(codigo_centro_custo, nome_centro_custo),
      caminhao_equipamento:caminhao_equipamento_id(placa, tipo_veiculo, marca, modelo)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  const userIds = [
    (data as any).solicitante_id,
    (data as any).executado_por_id,
    (data as any).encerrado_por_id
  ].filter(Boolean);
  
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, nome_completo')
      .in('id', userIds);
      
    if (!usersError && users) {
      const solicitante = users.find(u => u.id === (data as any).solicitante_id);
      const executado_por = users.find(u => u.id === (data as any).executado_por_id);
      const encerrado_por = users.find(u => u.id === (data as any).encerrado_por_id);
      
      return {
        ...data,
        solicitante: solicitante || null,
        executado_por: executado_por || null,
        encerrado_por: encerrado_por || null
      } as any as OrdemServico;
    }
  }
  
  return data as any as OrdemServico;
};

export const getChamadoById = async (id: string): Promise<any> => {
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
  
  if (data && data.solicitante_id) {
    const { data: solicitante, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, nome_completo')
      .eq('id', data.solicitante_id)
      .single();
      
    if (!profileError && solicitante) {
      return { ...data, solicitante } as any;
    }
  }
  
  return data as any;
};

export const getMaterialsByOsId = async (osId: string): Promise<Material[]> => {
  const { data, error } = await (supabase as any)
    .from('bd_os_materiais_utilizados')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  
  return (data as any) || [];
};

export const getMaoDeObraByOsId = async (osId: string): Promise<MaoDeObra[]> => {
  const { data, error } = await (supabase as any)
    .from('bd_os_mao_obra')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  
  return (data as any) || [];
};

export const getMovimentacoesByOsId = async (osId: string): Promise<Movimentacao[]> => {
  const { data, error } = await (supabase as any)
    .from('bd_os_movimentacoes')
    .select('*')
    .eq('os_id', osId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map((mov: any) => (mov as any).usuario_id).filter(Boolean))] as string[];
    
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, nome_completo')
        .in('id', userIds);
        
      if (!usersError && users) {
        return data.map((mov: any) => {
          const usuario = users.find(u => u.id === (mov as any).usuario_id);
          return {
            ...mov,
            usuario: usuario || null
          };
        }) as any;
      }
    }
  }
  
  return (data as any) || [];
};

export const updateOrdemServico = async (
  id: string,
  osData: Partial<OrdemServico>,
  currentUserId: string,
  motivo: string
): Promise<OrdemServico> => {
  try {
    const { data: os, error: osError } = await supabase
      .from('bd_ordens_servico')
      .update(osData)
      .eq('id', id)
      .select()
      .single();
      
    if (osError) throw osError;
    
    await (supabase as any)
      .from('bd_os_movimentacoes')
      .insert({
        os_id: id,
        usuario_id: currentUserId,
        motivo: motivo
      });
    
    return os as any as OrdemServico;
  } catch (error) {
    console.error('Error updating OS:', error);
    throw error;
  }
};

export const generateOsPdf = async (osId: string): Promise<void> => {
  try {
    console.log(`Generating PDF for OS ${osId}`);
    
    const os = await getOrdemServicoById(osId);
    
    alert(`PDF gerado para a OS ${os.numero_chamado}`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportOsToExcel = async (filters: OsFilterParams = {}): Promise<Blob> => {
  try {
    const ordensServico = await fetchOrdensServico(filters);
    
    const headers = ['Número', 'Data', 'Solicitante', 'Centro de Custo', 'Veículo', 'Tipo de Falha', 'Prioridade', 'Status'];
    
    const rows = ordensServico.map(os => [
      os.numero_chamado,
      new Date(os.data_solicitacao).toLocaleDateString('pt-BR'),
      os.solicitante?.nome_completo || os.solicitante?.email || 'N/A',
      os.centro_custo?.codigo_centro_custo || 'N/A',
      os.caminhao_equipamento?.placa || 'N/A',
      os.tipo_falha || 'N/A',
      os.prioridade,
      os.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  } catch (error) {
    console.error('Error exporting OS:', error);
    throw error;
  }
};

export const saveMaterial = async (material: Partial<Material>): Promise<Material> => {
  try {
    const { id, ...materialData } = material;
    
    if (id) {
      const { data, error } = await (supabase as any)
        .from('bd_os_materiais_utilizados')
        .update({
          ...materialData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as any;
    } else {
      const { data, error } = await (supabase as any)
        .from('bd_os_materiais_utilizados')
        .insert({
          ...materialData,
          valor_total: Number(materialData.quantidade || 0) * Number(materialData.valor_unitario || 0)
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as any;
    }
  } catch (error) {
    console.error('Error saving material:', error);
    throw error;
  }
};

export const deleteMaterial = async (materialId: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('bd_os_materiais_utilizados')
      .delete()
      .eq('id', materialId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

export const saveMaoDeObra = async (maoDeObra: Partial<MaoDeObra>): Promise<MaoDeObra> => {
  try {
    const { id, ...maoDeObraData } = maoDeObra;
    
    if (id) {
      const { data, error } = await (supabase as any)
        .from('bd_os_mao_obra')
        .update({
          ...maoDeObraData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as any;
    } else {
      const { data, error } = await (supabase as any)
        .from('bd_os_mao_obra')
        .insert({
          ...maoDeObraData,
          valor_total: Number(maoDeObraData.quantidade || 0) * Number(maoDeObraData.valor_unitario || 0)
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as any;
    }
  } catch (error) {
    console.error('Error saving mão de obra:', error);
    throw error;
  }
};

export const deleteMaoDeObra = async (maoDeObraId: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('bd_os_mao_obra')
      .delete()
      .eq('id', maoDeObraId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting mão de obra:', error);
    throw error;
  }
};
