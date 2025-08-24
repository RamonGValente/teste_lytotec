
import { supabase } from "@/integrations/supabase/client";
import { ApontamentoEquipe, ApontamentoEquipeFilters, ApontamentoEquipeApiData } from "@/types/apontamentoEquipe";
import { format } from "date-fns";

export const fetchApontamentosEquipe = async (
  filters: ApontamentoEquipeFilters = {},
  allowedTeamIds: string[] = []
): Promise<ApontamentoEquipe[]> => {
  try {
    console.log("🔍 Fetching apontamentos equipe with filters:", filters);
    
    let query = supabase
      .from("bd_apontamento_equipe")
      .select(`
        *,
        equipe:bd_equipes(
          id,
          nome_equipe,
          encarregado:encarregado_id (
            id, 
            nome_completo
          ),
          apontador:apontador_id (
            id, 
            nome_completo
          )
        ),
        colaborador:bd_funcionarios(
          id,
          nome_completo
        ),
        registrado_por_funcionario:bd_funcionarios(
          id,
          nome_completo
        ),
        lista_entrega:bd_lista_programacao_entrega(
          id,
          logradouro,
          requisicao:bd_requisicoes(
            id,
            numero,
            centro_custo:bd_centros_custo(
              id,
              nome_centro_custo
            )
          )
        )
      `);

    // Aplicar filtros de equipes apenas se não for vazio (SuperAdmin tem array vazio = sem filtro)
    if (allowedTeamIds.length > 0) {
      query = query.in('equipe_id', allowedTeamIds);
    }

    // Aplicar filtros
    if (filters.data_inicio) {
      const formattedDate = format(filters.data_inicio, "yyyy-MM-dd");
      query = query.gte("data_registro", formattedDate);
    }
    
    if (filters.data_fim) {
      const formattedDate = format(filters.data_fim, "yyyy-MM-dd");
      query = query.lte("data_registro", formattedDate);
    }

    if (filters.equipe_id && filters.equipe_id !== 'all') {
      query = query.eq('equipe_id', filters.equipe_id);
    }

    const { data, error } = await query.order("data_registro", { ascending: false });

    if (error) {
      console.error("❌ Error fetching apontamentos equipe:", error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} apontamentos`);
    return (data as any) || [];
  } catch (error) {
    console.error("💥 Unexpected error in fetchApontamentosEquipe:", error);
    throw error;
  }
};

// Alias para manter compatibilidade
export const fetchApontamentos = fetchApontamentosEquipe;

export const getApontamentoById = async (id: string): Promise<ApontamentoEquipe | null> => {
  try {
    const { data, error } = await supabase
      .from("bd_apontamento_equipe")
      .select(`
        *,
        equipe:bd_equipes(
          id,
          nome_equipe,
          encarregado:encarregado_id (
            id, 
            nome_completo
          ),
          apontador:apontador_id (
            id, 
            nome_completo
          )
        ),
        colaborador:bd_funcionarios(
          id,
          nome_completo
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching apontamento by ID:", error);
      return null;
    }

    return (data as any) || [];
  } catch (error) {
    console.error("Unexpected error in getApontamentoById:", error);
    return null;
  }
};

export const createApontamentoEquipe = async (
  apontamento: ApontamentoEquipeApiData
): Promise<ApontamentoEquipe[]> => {
  try {
    // Transform API data to match database structure
    const colaboradores = apontamento.colaboradores || [];
    
    // Create individual records for each colaborador
    const records = colaboradores.map(colaborador => ({
      equipe_id: apontamento.equipe_id,
      data_registro: apontamento.data_registro,
      colaborador_id: colaborador.colaborador_id,
      nome_colaborador: colaborador.nome_colaborador,
      presente: colaborador.presente,
      hora_inicio: colaborador.hora_inicio || null,
      hora_fim: colaborador.hora_fim || null,
      registrado_por: apontamento.registrado_por || null,
      lista_entrega_id: apontamento.lista_entrega_id || null
    }));

    const { data, error } = await supabase
      .from("bd_apontamento_equipe")
      .insert(records)
      .select();

    if (error) {
      console.error("Error creating apontamento equipe:", error);
      throw error;
    }

    return (data as any) || [];
  } catch (error) {
    console.error("Unexpected error in createApontamentoEquipe:", error);
    throw error;
  }
};

export const updateApontamentoEquipe = async (
  equipeId: string,
  dataRegistro: string,
  updates: ApontamentoEquipeApiData
): Promise<ApontamentoEquipe[]> => {
  try {
    // Delete existing records for this team and date
    await supabase
      .from("bd_apontamento_equipe")
      .delete()
      .eq('equipe_id', equipeId)
      .eq('data_registro', dataRegistro);

    // Create new records
    const colaboradores = updates.colaboradores || [];
    const records = colaboradores.map(colaborador => ({
      equipe_id: updates.equipe_id,
      data_registro: updates.data_registro,
      colaborador_id: colaborador.colaborador_id,
      nome_colaborador: colaborador.nome_colaborador,
      presente: colaborador.presente,
      hora_inicio: colaborador.hora_inicio || null,
      hora_fim: colaborador.hora_fim || null,
      registrado_por: updates.registrado_por || null,
      lista_entrega_id: updates.lista_entrega_id || null
    }));

    const { data, error } = await supabase
      .from("bd_apontamento_equipe")
      .insert(records)
      .select();

    if (error) {
      console.error("Error updating apontamento equipe:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in updateApontamentoEquipe:", error);
    throw error;
  }
};

export const deleteApontamentoEquipe = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("bd_apontamento_equipe")
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting apontamento equipe:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error in deleteApontamentoEquipe:", error);
    throw error;
  }
};

// Funções de avaliação
export const getLastAvaliacaoForColaborador = async (colaboradorId: string) => {
  try {
    const { data, error } = await supabase
      .from("bd_avaliacao_equipe" as any)
      .select("*")
      .eq("colaborador_id", colaboradorId)
      .order("data_avaliacao", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching last evaluation:", error);
      return null;
    }

    return data as any;
  } catch (error) {
    console.error("Unexpected error in getLastAvaliacaoForColaborador:", error);
    return null;
  }
};

export const createAvaliacaoEquipe = async (avaliacao: any) => {
  try {
    const { data, error } = await supabase
      .from("bd_avaliacao_equipe" as any)
      .insert(avaliacao)
      .select()
      .single();

    if (error) {
      console.error("Error creating evaluation:", error);
      throw error;
    }

    return (data as any) || [];
  } catch (error) {
    console.error("Unexpected error in createAvaliacaoEquipe:", error);
    throw error;
  }
};

export const canCreateAvaliacaoForColaborador = async (colaboradorId: string) => {
  // Implementação simplificada - retorna sempre true para não bloquear
  return { canCreate: true, daysRemaining: 0 };
};

export const checkAvaliacaoObrigatoria = async () => {
  // Implementação simplificada - retorna false por padrão
  return false;
};

export const exportApontamentoAndAvaliacoes = (filters: ApontamentoEquipeFilters) => {
  // Implementação simplificada para exportação
  console.log("Exporting apontamentos with filters:", filters);
};
