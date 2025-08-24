import { supabase } from "@/integrations/supabase/client";
import { RegistroAplicacaoDetalhesFormValues } from "@/types/registroAplicacaoDetalhes";

/**
 * Service otimizado para criar aplicações por rua usando RPC corrigida
 */
export const criarAplicacaoPorRua = async (
  listaEntregaId: string,
  registroCargaId: string,
  valores: RegistroAplicacaoDetalhesFormValues,
  dataAplicacao?: string,
  horaChegada?: string
) => {
  try {
    console.log("🏗️ [criarAplicacaoPorRua] Iniciando criação:", {
      listaEntregaId,
      registroCargaId,
      valores,
      dataAplicacao,
      horaChegada
    });

    // Validações adicionais antes de chamar RPC
    if (!valores.logradouro_nome?.trim()) {
      throw new Error("Nome do logradouro é obrigatório");
    }
    
    if (!valores.area_aplicada || valores.area_aplicada <= 0) {
      throw new Error("Área aplicada deve ser maior que zero");
    }
    
    if (!valores.tonelada_aplicada || valores.tonelada_aplicada <= 0) {
      throw new Error("Tonelada aplicada deve ser maior que zero");
    }

    // Se data de aplicação não foi fornecida, buscar da entrega
    let dataAplicacaoFinal = dataAplicacao;
    if (!dataAplicacaoFinal) {
      const { data: entregaData, error: entregaError } = await supabase
        .from('bd_lista_programacao_entrega')
        .select('data_entrega')
        .eq('id', listaEntregaId)
        .single();
      
      if (entregaError) {
        console.error("❌ [criarAplicacaoPorRua] Erro ao buscar data da entrega:", entregaError);
        // Fallback para data atual se não conseguir buscar
        dataAplicacaoFinal = new Date().toISOString().split('T')[0];
      } else {
        dataAplicacaoFinal = entregaData.data_entrega;
      }
    }
    
    console.log("📅 [criarAplicacaoPorRua] Data de aplicação final:", dataAplicacaoFinal);

    const { data, error } = await supabase.rpc('criar_aplicacao_por_rua', {
      p_lista_entrega_id: listaEntregaId,
      p_registro_carga_id: registroCargaId,
      p_logradouro_nome: valores.logradouro_nome.trim(),
      p_area_aplicada: valores.area_aplicada,
      p_tonelada_aplicada: valores.tonelada_aplicada,
      p_espessura_aplicada: valores.espessura_aplicada || null,
      p_comprimento: valores.comprimento || null,
      p_largura_media: valores.largura_media || null,
      p_bordo: valores.bordo || null,
      p_temperatura_aplicacao: valores.temperatura_aplicacao || null,
      p_observacoes_aplicacao: valores.observacoes_aplicacao?.trim() || null,
      p_hora_inicio_aplicacao: valores.hora_inicio_aplicacao || null,
      p_hora_fim_aplicacao: valores.hora_fim_aplicacao || null,
      p_data_aplicacao: dataAplicacaoFinal,
      p_hora_chegada_local: horaChegada || '08:00:00'
    });

    if (error) {
      console.error("❌ [criarAplicacaoPorRua] Erro na RPC:", error);
      throw new Error(`Erro ao criar aplicação: ${error.message}`);
    }

    console.log("✅ [criarAplicacaoPorRua] RPC executada com sucesso:", data);
    
    // Validar se a resposta é válida
    if (!data) {
      throw new Error("RPC não retornou dados");
    }

    const resultado = data as {
      success: boolean;
      registro_principal_id: string;
      detalhe_id: string;
      sequencia_aplicacao: number;
      massa_remanescente_nova: number;
    };
    
    if (!resultado.success) {
      throw new Error("RPC reportou falha na operação");
    }

    console.log("🎯 [criarAplicacaoPorRua] Aplicação criada com ID:", resultado.detalhe_id);

    return {
      id: resultado.detalhe_id,
      registro_aplicacao_id: resultado.registro_principal_id,
      sequencia_aplicacao: resultado.sequencia_aplicacao,
      massa_remanescente: resultado.massa_remanescente_nova,
      success: true
    };
  } catch (error) {
    console.error("❌ [criarAplicacaoPorRua] Erro geral:", error);
    // Re-throw com mensagem mais específica
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao criar aplicação por rua");
  }
};

/**
 * Buscar aplicações usando consulta direta por enquanto
 */
export const buscarAplicacoesPorRegistro = async (registroAplicacaoId: string) => {
  try {
    console.log("🔍 [buscarAplicacoesPorRegistro] Buscando para:", registroAplicacaoId);

    const { data, error } = await supabase
      .from("bd_registro_aplicacao_detalhes")
      .select("*")
      .eq("registro_aplicacao_id", registroAplicacaoId)
      .order("sequencia_aplicacao", { ascending: true });

    if (error) {
      console.error("❌ [buscarAplicacoesPorRegistro] Erro na consulta:", error);
      throw error;
    }

    console.log("✅ [buscarAplicacoesPorRegistro] Encontradas:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("❌ [buscarAplicacoesPorRegistro] Erro geral:", error);
    throw error;
  }
};

/**
 * Calcular massa remanescente manualmente por enquanto
 */
export const calcularMassaRemanescenteTempoReal = async (registroAplicacaoId: string) => {
  try {
    console.log("🔍 [calcularMassaRemanescenteTempoReal] Calculando para:", registroAplicacaoId);

    // Usar a função RPC otimizada diretamente
    const { data: massaRemanescente, error } = await supabase.rpc(
      'calcular_massa_remanescente_em_tempo_real',
      { p_registro_aplicacao_id: registroAplicacaoId }
    );

    if (error) {
      console.error("❌ [calcularMassaRemanescenteTempoReal] Erro na RPC:", error);
      
      // Fallback: calcular manualmente
      console.log("⚡ [calcularMassaRemanescenteTempoReal] Usando fallback manual...");
      return await calcularMassaRemanescenteFallback(registroAplicacaoId);
    }

    console.log("✅ [calcularMassaRemanescenteTempoReal] Massa remanescente via RPC:", massaRemanescente);
    return massaRemanescente || 0;
  } catch (error) {
    console.error("❌ [calcularMassaRemanescenteTempoReal] Erro geral:", error);
    
    // Fallback em caso de erro
    return await calcularMassaRemanescenteFallback(registroAplicacaoId);
  }
};

/**
 * Fallback manual para calcular massa remanescente
 */
const calcularMassaRemanescenteFallback = async (registroAplicacaoId: string) => {
  try {
    console.log("🔧 [calcularMassaRemanescenteFallback] Calculando manualmente para:", registroAplicacaoId);

    // Buscar informações do registro principal
    const { data: registro, error: registroError } = await supabase
      .from("bd_registro_apontamento_aplicacao")
      .select(`
        *,
        bd_registro_cargas!registro_carga_id(tonelada_real, tonelada_saida),
        bd_lista_programacao_entrega!lista_entrega_id(quantidade_massa)
      `)
      .eq("id", registroAplicacaoId)
      .single();

    if (registroError || !registro) {
      console.error("❌ [calcularMassaRemanescenteFallback] Erro ao buscar registro:", registroError);
      return 0;
    }

    // Calcular massa total disponível
    const massaTotal = registro.bd_registro_cargas?.tonelada_real || 
                      registro.bd_registro_cargas?.tonelada_saida || 
                      registro.bd_lista_programacao_entrega?.quantidade_massa || 0;

    // Buscar total aplicado nos detalhes
    const { data: detalhes, error: detalhesError } = await supabase
      .from("bd_registro_aplicacao_detalhes")
      .select("tonelada_aplicada")
      .eq("registro_aplicacao_id", registroAplicacaoId);

    if (detalhesError) {
      console.error("❌ [calcularMassaRemanescenteFallback] Erro ao buscar detalhes:", detalhesError);
      return massaTotal;
    }

    const totalAplicado = (detalhes || []).reduce((sum, detalhe) => sum + (detalhe.tonelada_aplicada || 0), 0);
    const massaRemanescente = Math.max(0, massaTotal - totalAplicado);

    console.log("✅ [calcularMassaRemanescenteFallback] Massa total:", massaTotal, "Aplicado:", totalAplicado, "Remanescente:", massaRemanescente);

    return massaRemanescente;
  } catch (error) {
    console.error("❌ [calcularMassaRemanescenteFallback] Erro geral:", error);
    return 0;
  }
};