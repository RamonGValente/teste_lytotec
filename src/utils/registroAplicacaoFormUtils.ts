
import { UseFormReturn } from "react-hook-form";
import { RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCarga } from "@/types/registroCargas";
import { Toast } from "@/types/toast";
import { formatDateToString } from "@/lib/utils";

/**
 * Get default values for the form from initial data or defaults
 */
export const getFormDefaultValues = (initialData?: any): RegistroAplicacaoSchema => {
  // Obtém a data atual no formato correto
  const today = formatDateToString(new Date());
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    lista_entrega_id: initialData?.lista_entrega_id || "",
    registro_carga_id: initialData?.registro_carga_id || "",
    logradouro_id: initialData?.logradouro_id || "",
    logradouro_aplicado: initialData?.logradouro_aplicado || "",
    data_aplicacao: initialData?.data_aplicacao || today,
    hora_chegada_local: initialData?.hora_chegada_local || currentTime,
    temperatura_chegada: initialData?.temperatura_chegada || null,
    hora_aplicacao: initialData?.hora_aplicacao || null,
    temperatura_aplicacao: initialData?.temperatura_aplicacao || null,
    bordo: initialData?.bordo || null,
    estaca_inicial: initialData?.estaca_inicial || null,
    comprimento: initialData?.comprimento || null,
    largura_media: initialData?.largura_media || null,
    // area_calculada: removido - não existe na tabela
    tonelada_aplicada: initialData?.tonelada_aplicada || null,
    espessura: initialData?.espessura || initialData?.espessura_calculada || null,
    hora_saida_caminhao: initialData?.hora_saida_caminhao || null,
    estaca_final: initialData?.estaca_final || null,
    anotacoes_apontador: initialData?.anotacoes_apontador || null,
    // Campos removidos - não existem mais na tabela
    aplicacao_sequencia: initialData?.aplicacao_sequencia || 1,
    carga_finalizada: initialData?.carga_finalizada === true ? true : false,
  };
};

/**
 * Initialize form with data from a lista programacao entrega and registro carga
 */
export const initializeFormFromEntrega = async (
  form: UseFormReturn<RegistroAplicacaoSchema>,
  entrega: ListaProgramacaoEntrega,
  regCarga: RegistroCarga,
  toast: (props: Toast) => void,
  aplicacaoSequencia: number = 1,
  massaRemanescenteAnterior?: number
) => {
  try {
    // Set values from entrega
    form.setValue("lista_entrega_id", entrega.id);
    form.setValue("registro_carga_id", regCarga.id);
    
    // Set default values for data and times - ensuring they're in the correct format
    const today = formatDateToString(new Date());
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    form.setValue("data_aplicacao", today);
    form.setValue("hora_chegada_local", currentTime);
    
    // Configurar campos para múltiplas aplicações
    form.setValue("aplicacao_sequencia", aplicacaoSequencia);
    
    console.log("✅ Form initialized - aplicacao_sequencia:", aplicacaoSequencia);
    console.log("✅ Form initialized - aplicacao_sequencia:", aplicacaoSequencia);
    
    return true;
  } catch (error) {
    console.error("Error initializing form:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao carregar os dados da entrega.",
      variant: "destructive",
    });
    
    return false;
  }
};
