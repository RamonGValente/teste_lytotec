
import { supabase } from "@/integrations/supabase/client";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCarga, RegistroCargaFilters } from "@/types/registroCargas";
import { format } from "date-fns";

export const fetchListaProgramacaoEntregaByDate = async (
  date: Date
): Promise<ListaProgramacaoEntrega[]> => {
  try {
    console.log("🔍 Fetching entregas for date:", format(date, "yyyy-MM-dd"));
    
    const { data, error } = await supabase
      .from("bd_lista_programacao_entrega")
      .select(`
        *,
        caminhao:bd_caminhoes_equipamentos(
          id,
          placa,
          modelo,
          frota,
          numero_frota
        ),
        equipe:bd_equipes(
          id,
          nome_equipe
        ),
        usina:bd_usinas(
          id,
          nome_usina
        ),
        requisicao:bd_requisicoes(
          id,
          numero,
          centro_custo:bd_centros_custo(
            id,
            codigo_centro_custo,
            nome_centro_custo
          )
        )
      `)
      .eq("data_entrega", format(date, "yyyy-MM-dd"))
      .in("status", ["Pendente", "Enviada", "Entregue"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching entregas:", error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} entregas for date`);
    
    // Adicionar nome do centro de custo diretamente no objeto
    const processedData = data?.map(entrega => ({
      ...entrega,
      centro_custo_nome: entrega.requisicao?.centro_custo?.nome_centro_custo || entrega.logradouro
    })) || [];

    return processedData;
  } catch (error) {
    console.error("💥 Unexpected error in fetchListaProgramacaoEntregaByDate:", error);
    throw error;
  }
};

export const fetchListaProgramacaoEntregaFiltered = async (
  filters: RegistroCargaFilters
): Promise<ListaProgramacaoEntrega[]> => {
  try {
    console.log("🔍 Fetching filtered entregas:", filters);
    
    let query = supabase
      .from("bd_lista_programacao_entrega")
      .select(`
        *,
        caminhao:bd_caminhoes_equipamentos(
          id,
          placa,
          modelo,
          frota,
          numero_frota
        ),
        equipe:bd_equipes(
          id,
          nome_equipe
        ),
        usina:bd_usinas(
          id,
          nome_usina
        ),
        requisicao:bd_requisicoes(
          id,
          numero,
          centro_custo:bd_centros_custo(
            id,
            codigo_centro_custo,
            nome_centro_custo
          )
        )
      `);

    // Aplicar filtros
    if (filters.data_inicio) {
      const formattedDate = format(filters.data_inicio, "yyyy-MM-dd");
      query = query.eq("data_entrega", formattedDate);
    }

    if (filters.centro_custo_id && filters.centro_custo_id !== 'all') {
      query = query.eq('requisicao.centro_custo_id', filters.centro_custo_id);
    }

    if (filters.caminhao_id && filters.caminhao_id !== 'all') {
      query = query.eq('caminhao_id', filters.caminhao_id);
    }

    // Incluir diferentes status de entrega
    query = query.in("status", ["Pendente", "Enviada", "Entregue"]);
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching filtered entregas:", error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} filtered entregas`);
    
    // Adicionar nome do centro de custo diretamente no objeto
    const processedData = data?.map(entrega => ({
      ...entrega,
      centro_custo_nome: entrega.requisicao?.centro_custo?.nome_centro_custo || entrega.logradouro
    })) || [];

    return processedData;
  } catch (error) {
    console.error("💥 Unexpected error in fetchListaProgramacaoEntregaFiltered:", error);
    throw error;
  }
};

export const fetchRegistroCargaByListaEntregaId = async (
  listaEntregaId: string
): Promise<RegistroCarga | null> => {
  try {
    const { data, error } = await supabase
      .from("bd_registro_cargas")
      .select("*")
      .eq("lista_entrega_id", listaEntregaId)
      .eq("status_registro", "Ativo")
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching registro carga:", error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error("Unexpected error in fetchRegistroCargaByListaEntregaId:", error);
    return null;
  }
};

export const createRegistroCarga = async (
  registro: {
    lista_entrega_id: string;
    programacao_id: string;
    data_saida: string;
    hora_saida: string;
    tonelada_saida: number;
    tonelada_retorno?: number | null;
    temperatura_saida?: number | null;
    imagem_ticket_saida?: any;
    imagem_ticket_retorno?: any;
    status_registro: "Ativo" | "Concluído" | "Cancelado";
  }
): Promise<RegistroCarga> => {
  try {
    const { data, error } = await supabase
      .from("bd_registro_cargas")
      .insert(registro as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating registro carga:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in createRegistroCarga:", error);
    throw error;
  }
};

export const updateRegistroCarga = async (
  id: string,
  updates: Partial<RegistroCarga>
): Promise<RegistroCarga> => {
  try {
    const { data, error } = await supabase
      .from("bd_registro_cargas")
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating registro carga:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in updateRegistroCarga:", error);
    throw error;
  }
};
