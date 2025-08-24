
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ProgramacaoEntregaWithItems } from "@/types/programacaoEntrega";
import { fetchOperatingVehicles, fetchApontadorByEquipeId } from "@/services/programacaoEntregaService";
import { fetchEquipes } from "@/services/equipe/fetchEquipes";
import { supabase } from "@/integrations/supabase/client";
import { programacaoSchema, itemSchema, ProgramacaoFormValues, ItemFormValues } from "@/validations/programacaoSchema";
import { useFormInitialization } from "./programacao/useFormInitialization";
import { useFormSubmission } from "./programacao/useFormSubmission";
import { useItemManagement } from "./programacao/useItemManagement";
import { useToast } from "@/hooks/use-toast";
import { fetchCentroCustoForProgramacao } from "@/services/centroCustoRegistroService";
import { getCurrentBrazilianDate, formatBrazilianDateToString } from "@/utils/timezoneUtils";
import { useProgramacaoProgress } from "@/hooks/useProgramacaoProgress";
import { buscarRequisicoesDisponiveis } from "@/services/programacao/massaControlService";

export const useProgramacaoEntregaForm = (
  programacao: ProgramacaoEntregaWithItems | null,
  onSuccess: () => void
) => {
  const { toast } = useToast();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);
  const [selectedCaminhaoId, setSelectedCaminhaoId] = useState<string | null>(null);
  const [centroCustoNome, setCentroCustoNome] = useState<string>("");

  // Get current date in Brazilian timezone
  const getCurrentDate = () => {
    const currentDate = getCurrentBrazilianDate();
    console.log("getCurrentDate called, returning Brazilian date:", currentDate);
    return currentDate;
  };

  // Initialize the main form with ProgramacaoFormValues type
  const form = useForm<ProgramacaoFormValues>({
    resolver: zodResolver(programacaoSchema),
    defaultValues: {
      requisicao_id: programacao?.requisicao_id || "",
      centro_custo_id: programacao?.centro_custo_id || "",
      data_entrega: programacao?.data_entrega || getCurrentDate(),
      ruas: [],
      itens: [],
    },
  });

  // Initialize the item form with ItemFormValues type - removed logradouro as required field
  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      requisicao_id: "",
      centro_custo_nome: "", // This will be the main identifier during programming
      quantidade_massa: 0, // Starts empty (0) - will be in KG from NumberInput
      caminhao_id: "",
      tipo_lancamento: "",
      equipe_id: "",
      apontador_id: "",
      usina_id: "",
      data_entrega: getCurrentDate(),
      cancelled: false,
      cancelReason: ""
    }
  });

  // Use the modular hooks
  const { 
    selectedRequisicaoId,
    setSelectedRequisicaoId,
    requisicaoDetails,
    fetchRequisicaoDetails
  } = useFormInitialization(programacao, form);

  const { isSubmitting, onSubmit } = useFormSubmission(programacao, onSuccess);

  // Queries for required data
  const { data: caminhoes = [] } = useQuery({
    queryKey: ['operatingVehicles'],
    queryFn: fetchOperatingVehicles,
  });

  // Buscar apenas requisições que ainda podem receber programação
  const { data: requisicoes = [] } = useQuery({
    queryKey: ['requisicoes-disponiveis'],
    queryFn: buscarRequisicoesDisponiveis,
    staleTime: 30000, // Cache por 30 segundos
  });

  const { data: equipes = [] } = useQuery({
    queryKey: ['equipes'],
    queryFn: () => fetchEquipes(),
  });

  const { data: usinas = [] } = useQuery({
    queryKey: ['usinas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_usinas')
        .select('*')
        .order('nome_usina');

      if (error) throw error;
      return data || [];
    }
  });

  // Watch for changes
  const watchedRequisicaoId = form.watch("requisicao_id");
  const watchedEquipeId = itemForm.watch("equipe_id");
  const watchedCaminhaoId = itemForm.watch("caminhao_id");
  const watchItens = form.watch("itens") || [];
  const watchedDataEntrega = form.watch("data_entrega");

  // Hook de progresso inteligente
  const progressHook = useProgramacaoProgress({ 
    requisicaoId: selectedRequisicaoId,
    enabled: !!selectedRequisicaoId 
  });

  const {
    addItem,
    removeItem,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    showCancelDialog,
    itemToCancel,
    calculateProgrammedQuantity
  } = useItemManagement(form, progressHook);

  // Effect for handling requisição changes
  useEffect(() => {
    const handleRequisicaoChange = async () => {
      if (watchedRequisicaoId) {
        setSelectedRequisicaoId(watchedRequisicaoId);
        
        try {
          await fetchRequisicaoDetails(watchedRequisicaoId);

          const requisicao = requisicoes.find(req => req.id === watchedRequisicaoId);
          if (requisicao?.centro_custo_id) {
            form.setValue("centro_custo_id", requisicao.centro_custo_id);

            // Get and set the centro_custo name for display
            const centroCustoInfo = requisicao.centro_custo && 
              typeof requisicao.centro_custo === 'object' && 
              requisicao.centro_custo !== null ? 
              requisicao.centro_custo : null;
            
            if (centroCustoInfo && 'nome_centro_custo' in centroCustoInfo) {
              const nomeCentroCusto = String(centroCustoInfo.nome_centro_custo || '');
              setCentroCustoNome(nomeCentroCusto);
              console.log("Setting centro custo nome:", nomeCentroCusto);
              
              // Immediately update item form if adding item
              if (isAddingItem) {
                itemForm.setValue("centro_custo_nome", nomeCentroCusto);
                console.log("Updated item form centro_custo_nome:", nomeCentroCusto);
              }
            }
          }
          
          if (isAddingItem) {
            itemForm.setValue("requisicao_id", watchedRequisicaoId);
          }
        } catch (error) {
          console.error('Error handling requisição change:', error);
          toast({
            title: "Erro ao carregar detalhes da requisição",
            description: "Ocorreu um erro ao carregar os detalhes da requisição",
            variant: "destructive",
          });
        }
      }
    };

    handleRequisicaoChange();
  }, [watchedRequisicaoId, requisicoes, form, isAddingItem, itemForm, toast, fetchRequisicaoDetails, setSelectedRequisicaoId]);

  // Effect for handling equipe changes
  useEffect(() => {
    const updateApontador = async () => {
      if (watchedEquipeId) {
        setSelectedEquipeId(watchedEquipeId);
        
        try {
          const equipe = equipes.find(eq => eq.id === watchedEquipeId);
          if (equipe && typeof equipe === 'object' && 'apontador_id' in equipe && equipe.apontador_id) {
            itemForm.setValue("apontador_id", equipe.apontador_id);
          } else {
            const apontador = await fetchApontadorByEquipeId(watchedEquipeId);
            if (apontador && typeof apontador === 'object' && 'id' in apontador && apontador.id) {
              itemForm.setValue("apontador_id", String(apontador.id));
            }
          }
        } catch (error) {
          console.error('Error fetching apontador:', error);
        }
      }
    };

    updateApontador();
  }, [watchedEquipeId, itemForm, equipes, fetchApontadorByEquipeId]);

  // Effect for handling caminhão changes
  useEffect(() => {
    if (watchedCaminhaoId) {
      setSelectedCaminhaoId(watchedCaminhaoId);
      // Users must manually enter the quantity for each truck
    }
  }, [watchedCaminhaoId]);

  // Effect for synchronizing dates between main form and item form
  useEffect(() => {
    if (isAddingItem && watchedDataEntrega) {
      console.log("Synchronizing item date with main form date:", watchedDataEntrega);
      itemForm.setValue("data_entrega", watchedDataEntrega);
    }
  }, [watchedDataEntrega, isAddingItem, itemForm]);

  // Effect for resetting item form when adding new item - removed logradouro field
  useEffect(() => {
    if (isAddingItem) {
      const currentDataEntrega = form.getValues().data_entrega || getCurrentDate();
      console.log("Resetting item form with Brazilian date:", currentDataEntrega);
      console.log("Centro custo nome available:", centroCustoNome);
      
      itemForm.reset({
        requisicao_id: form.getValues().requisicao_id || "",
        centro_custo_nome: centroCustoNome, // Required field for programming
        quantidade_massa: 0, // Always start at 0 (empty) - in KG
        caminhao_id: "",
        tipo_lancamento: "",
        equipe_id: "",
        apontador_id: "",
        usina_id: "",
        data_entrega: currentDataEntrega,
        cancelled: false,
        cancelReason: ""
      });
      
      // Force update the centro_custo_nome field if it's available
      if (centroCustoNome) {
        setTimeout(() => {
          itemForm.setValue("centro_custo_nome", centroCustoNome);
          console.log("Force updated centro_custo_nome:", centroCustoNome);
        }, 100);
      }
    }
  }, [isAddingItem, itemForm, form, centroCustoNome]);

  return {
    form,
    itemForm,
    isSubmitting,
    isAddingItem,
    setIsAddingItem,
    onSubmit,
    addItem,
    removeItem,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    showCancelDialog,
    itemToCancel,
    requisicoes,
    equipes,
    usinas,
    caminhoes,
    selectedRequisicaoId,
    selectedEquipeId,
    selectedCaminhaoId,
    requisicaoDetails,
    calculateProgrammedQuantity,
    watchItens,
    centroCustoNome,
    progressHook
  };
};
