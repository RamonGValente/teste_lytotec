
import { supabase } from "@/integrations/supabase/client";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroAplicacaoFilters } from "@/types/registroAplicacao";
import { format } from "date-fns";

// Tipos específicos para os dados retornados do Supabase
interface SupabaseCaminhao {
  id: string;
  placa?: string;
  modelo?: string;
  frota?: string;
  numero_frota?: string;
}

interface SupabaseEquipe {
  id: string;
  nome_equipe: string;
}

interface SupabaseUsina {
  id: string;
  nome_usina: string;
}

interface SupabaseCentroCusto {
  id: string;
  codigo_centro_custo?: string;
  nome_centro_custo: string;
}

interface SupabaseRequisicao {
  id: string;
  numero: string;
  centro_custo?: SupabaseCentroCusto | SupabaseCentroCusto[] | null;
}

interface SupabaseEntregaRaw {
  id: string;
  programacao_entrega_id: string;
  programacao_id?: string;
  logradouro: string;
  data_entrega: string;
  quantidade_massa: number;
  caminhao_id: string;
  usina_id: string;
  apontador_id: string;
  equipe_id: string;
  tipo_lancamento: string;
  status: string;
  requisicao_id: string;
  created_at?: string;
  updated_at?: string;
  caminhao?: SupabaseCaminhao | SupabaseCaminhao[] | null;
  equipe?: SupabaseEquipe | SupabaseEquipe[] | null;
  usina?: SupabaseUsina | SupabaseUsina[] | null;
  requisicao?: SupabaseRequisicao | SupabaseRequisicao[] | null;
}

// Função auxiliar para extrair primeiro item de array ou retornar o objeto
function extractFirst<T>(data: T | T[] | null | undefined): T | undefined {
  if (!data) return undefined;
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : undefined;
  }
  return data;
}

// Função para processar centro de custo
function processCentroCusto(centroCustoData: SupabaseCentroCusto | SupabaseCentroCusto[] | null | undefined) {
  const centroCusto = extractFirst(centroCustoData);
  if (!centroCusto) return undefined;
  
  return {
    id: centroCusto.id || '',
    codigo_centro_custo: centroCusto.codigo_centro_custo,
    nome_centro_custo: centroCusto.nome_centro_custo || ''
  };
}

export const fetchEntregasStable = async (
  filters: RegistroAplicacaoFilters = {},
  allowedTeamIds: string[] = []
): Promise<ListaProgramacaoEntrega[]> => {
  try {
    console.log("🔍 STABLE - Fetching entregas with filters:", filters);
    console.log("🔍 STABLE - Allowed teams:", allowedTeamIds);
    
    // Query principal com tipagem explícita - REMOVIDO o embed problemático do apontador
    let query = supabase
      .from("bd_lista_programacao_entrega")
      .select(`
        id,
        programacao_entrega_id,
        programacao_id,
        logradouro,
        data_entrega,
        quantidade_massa,
        caminhao_id,
        usina_id,
        apontador_id,
        equipe_id,
        tipo_lancamento,
        status,
        requisicao_id,
        created_at,
        updated_at,
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

    // Aplicar filtro de equipes apenas se não for SuperAdmin
    if (allowedTeamIds.length > 0) {
      console.log("🔒 STABLE - Aplicando filtro de equipes:", allowedTeamIds);
      query = query.in('equipe_id', allowedTeamIds);
    } else {
      console.log("🔓 STABLE - SuperAdmin: Sem filtro de equipes");
    }

    // Aplicar filtros específicos
    if (filters.data_inicio) {
      const formattedDate = format(filters.data_inicio, "yyyy-MM-dd");
      console.log("📅 STABLE - Filtrando por data:", formattedDate);
      query = query.eq("data_entrega", formattedDate);
    }

    if (filters.centro_custo_id && filters.centro_custo_id !== 'all') {
      console.log("🏢 STABLE - Filtrando por centro de custo:", filters.centro_custo_id);
      query = query.eq('requisicao.centro_custo_id', filters.centro_custo_id);
    }

    if (filters.caminhao_id && filters.caminhao_id !== 'all') {
      console.log("🚛 STABLE - Filtrando por caminhão:", filters.caminhao_id);
      query = query.eq('caminhao_id', filters.caminhao_id);
    }

    // Buscar entregas "Enviada" e "Entregue" para registro de aplicação
    query = query.in('status', ['Enviada', 'Entregue']);

    // Ordenar por data de entrega
    query = query.order("data_entrega", { ascending: false });

    const { data: rawData, error } = await query;

    if (error) {
      console.error("❌ STABLE - Erro ao buscar entregas:", error);
      throw new Error(`Erro na consulta: ${error.message}`);
    }

    console.log(`📊 STABLE - Entregas encontradas: ${rawData?.length || 0}`);

    if (!rawData || rawData.length === 0) {
      console.log("📭 STABLE - Nenhuma entrega encontrada");
      return [];
    }

    // Processar dados com type safety completo
    const entregasProcessadas = await Promise.all(
      (rawData as SupabaseEntregaRaw[]).map(async (entrega) => {
        try {
          // Buscar aplicações já realizadas para esta entrega
          const { data: aplicacoes } = await supabase
            .from('bd_registro_apontamento_aplicacao')
            .select('tonelada_aplicada')
            .eq('lista_entrega_id', entrega.id);

          const massaAplicada = aplicacoes?.reduce((total, app) => total + (app.tonelada_aplicada || 0), 0) || 0;
          const massaRemanescente = Math.max(0, (entrega.quantidade_massa || 0) - massaAplicada);

          // Processar relações com type safety
          const processedCaminhao = extractFirst(entrega.caminhao);
          const processedUsina = extractFirst(entrega.usina);
          const rawEquipe = extractFirst(entrega.equipe);
          const rawRequisicao = extractFirst(entrega.requisicao);

          // Processar equipe (SEM apontador para evitar ambiguidade)
          const processedEquipe = rawEquipe ? {
            id: rawEquipe.id || '',
            nome_equipe: rawEquipe.nome_equipe || ''
          } : undefined;

          // Processar requisição
          const processedRequisicao = rawRequisicao ? {
            id: rawRequisicao.id || '',
            numero: rawRequisicao.numero || '',
            centro_custo: processCentroCusto(rawRequisicao.centro_custo)
          } : undefined;

          // Construir entrega final com todos os campos obrigatórios
          const entregaProcessada: ListaProgramacaoEntrega = {
            id: entrega.id,
            programacao_entrega_id: entrega.programacao_entrega_id,
            programacao_id: entrega.programacao_id,
            logradouro: entrega.logradouro,
            data_entrega: entrega.data_entrega,
            quantidade_massa: entrega.quantidade_massa,
            caminhao_id: entrega.caminhao_id,
            usina_id: entrega.usina_id,
            apontador_id: entrega.apontador_id,
            equipe_id: entrega.equipe_id,
            tipo_lancamento: entrega.tipo_lancamento,
            status: entrega.status,
            requisicao_id: entrega.requisicao_id,
            created_at: entrega.created_at,
            updated_at: entrega.updated_at,
            massa_aplicada_total: massaAplicada,
            massa_remanescente: massaRemanescente,
            massa_total_carga: entrega.quantidade_massa,
            caminhao: processedCaminhao,
            equipe: processedEquipe,
            usina: processedUsina,
            requisicao: processedRequisicao
          };

          return entregaProcessada;
        } catch (error) {
          console.error(`❌ STABLE - Erro ao processar entrega ${entrega.id}:`, error);
          
          // Fallback seguro mantendo estrutura básica
          const fallbackEquipe = extractFirst(entrega.equipe);
          
          const fallbackEntrega: ListaProgramacaoEntrega = {
            id: entrega.id,
            programacao_entrega_id: entrega.programacao_entrega_id,
            programacao_id: entrega.programacao_id,
            logradouro: entrega.logradouro,
            data_entrega: entrega.data_entrega,
            quantidade_massa: entrega.quantidade_massa,
            caminhao_id: entrega.caminhao_id,
            usina_id: entrega.usina_id,
            apontador_id: entrega.apontador_id,
            equipe_id: entrega.equipe_id,
            tipo_lancamento: entrega.tipo_lancamento,
            status: entrega.status,
            requisicao_id: entrega.requisicao_id,
            created_at: entrega.created_at,
            updated_at: entrega.updated_at,
            massa_aplicada_total: 0,
            massa_remanescente: entrega.quantidade_massa || 0,
            massa_total_carga: entrega.quantidade_massa,
            caminhao: extractFirst(entrega.caminhao),
            equipe: fallbackEquipe ? { id: fallbackEquipe.id, nome_equipe: fallbackEquipe.nome_equipe } : undefined,
            usina: extractFirst(entrega.usina),
            requisicao: undefined
          };
          
          return fallbackEntrega;
        }
      })
    );

    console.log(`✅ STABLE - Entregas processadas com sucesso: ${entregasProcessadas.length}`);
    
    if (entregasProcessadas.length > 0) {
      console.log("📝 STABLE - Amostra de entrega:", {
        id: entregasProcessadas[0].id,
        logradouro: entregasProcessadas[0].logradouro,
        status: entregasProcessadas[0].status,
        massa_remanescente: entregasProcessadas[0].massa_remanescente
      });
    }

    return entregasProcessadas;
  } catch (error) {
    console.error("💥 STABLE - Erro inesperado ao buscar entregas:", error);
    // Lançar erro mais específico
    if (error instanceof Error) {
      throw new Error(`Falha ao carregar entregas: ${error.message}`);
    }
    throw new Error("Falha ao carregar entregas: Erro de conexão com o banco de dados");
  }
};
