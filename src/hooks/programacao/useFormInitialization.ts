
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProgramacaoEntregaWithItems } from "@/types/programacaoEntrega";
import { ProgramacaoFormValues, ItemFormValues } from "@/validations/programacaoSchema";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentBrazilianDate } from "@/utils/timezoneUtils";

export const useFormInitialization = (
  programacao: ProgramacaoEntregaWithItems | null,
  form: UseFormReturn<ProgramacaoFormValues>
) => {
  const [selectedRequisicaoId, setSelectedRequisicaoId] = useState<string | null>(null);
  const [requisicaoDetails, setRequisicaoDetails] = useState<any>({
    totalRuas: 0,
    areaTotal: 0,
    pesoTotal: 0,
  });

  useEffect(() => {
    const initializeFormWithExistingData = async () => {
      if (programacao) {
        console.log("Setting up form for editing with data:", programacao);
        
        form.setValue("requisicao_id", programacao.requisicao_id);
        form.setValue("centro_custo_id", programacao.centro_custo_id);
        form.setValue("data_entrega", programacao.data_entrega);
        
        if (programacao.itens && programacao.itens.length > 0) {
          const processedItems: ItemFormValues[] = programacao.itens.map(item => ({
            id: item.id,
            requisicao_id: item.requisicao_id || programacao.requisicao_id,
            logradouro: item.logradouro,
            quantidade_massa: Number(item.quantidade_massa),
            caminhao_id: item.caminhao_id,
            tipo_lancamento: item.tipo_lancamento === "Manual" ? "Mecânico" : item.tipo_lancamento,
            equipe_id: item.equipe_id,
            apontador_id: item.apontador_id,
            usina_id: item.usina_id,
            data_entrega: item.data_entrega || programacao.data_entrega,
            status: (item.status === 'Pendente' || item.status === 'Enviada' || item.status === 'Cancelada' || item.status === 'Entregue') 
              ? item.status 
              : 'Pendente',
            cancelled: item.cancelled || false
          }));
          
          form.setValue("itens", processedItems);
          setSelectedRequisicaoId(programacao.requisicao_id);
        }
      } else {
        // Use Brazilian timezone current date when creating new programação
        const currentDate = getCurrentBrazilianDate();
        console.log("Creating new programação with Brazilian current date:", currentDate);
        
        form.reset({
          requisicao_id: "",
          centro_custo_id: "",
          data_entrega: currentDate,
          itens: []
        });
      }
    };

    initializeFormWithExistingData();
  }, [programacao, form]);

  const fetchRequisicaoDetails = async (requisicaoId: string) => {
    try {
      const { data: ruasData, error } = await supabase
        .from('bd_ruas_requisicao')
        .select('*')
        .eq('requisicao_id', requisicaoId);
      
      if (error) throw error;
      
      const totalRuas = ruasData?.length || 0;
      const areaTotal = ruasData?.reduce((sum, rua) => sum + (rua.area || 0), 0) || 0;
      const pesoTotal = ruasData?.reduce((sum, rua) => sum + (rua.volume || 0), 0) || 0;
      
      setRequisicaoDetails({
        totalRuas,
        areaTotal,
        pesoTotal,
      });
    } catch (error) {
      console.error('Error fetching requisição details:', error);
    }
  };

  return {
    selectedRequisicaoId,
    setSelectedRequisicaoId,
    requisicaoDetails,
    fetchRequisicaoDetails
  };
};
