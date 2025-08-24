
import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ItemFormValues, ProgramacaoFormValues } from "@/validations/programacaoSchema";
import { normalizeToToneladas, formatMassaFromDatabase } from "@/utils/massaConversionUtils";

export const useItemManagement = (
  form: UseFormReturn<ProgramacaoFormValues>,
  progressHook?: any
) => {
  const { toast } = useToast();
  const [itemToCancel, setItemToCancel] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const addItem = useCallback((data: ItemFormValues) => {
    // Validação inteligente de massa
    if (progressHook) {
      const quantidade = data.quantidade_massa || 0;
      const quantidadeToneladas = normalizeToToneladas(quantidade);
      
      const validacao = progressHook.validarQuantidadeProgramacao(quantidadeToneladas);
      if (!validacao.valida) {
        toast({
          title: "Quantidade inválida",
          description: validacao.motivo,
          variant: "destructive",
        });
        return;
      }
    }

    // Ensure tipo_lancamento is correctly mapped for UI display
    let displayTipoLancamento = data.tipo_lancamento;
    if (data.tipo_lancamento === 'Mecânico') {
      // The UI shows 'Mecânico' but we'll save it as 'Manual' in the database via the service
      displayTipoLancamento = 'Mecânico';
    }

    const newItem = {
      requisicao_id: data.requisicao_id || form.getValues().requisicao_id || "",
      centro_custo_nome: data.centro_custo_nome || "",
      // Use centro_custo_nome as logradouro placeholder for programming phase
      logradouro: data.centro_custo_nome || "Centro de Custo",
      quantidade_massa: data.quantidade_massa || 0,
      caminhao_id: data.caminhao_id || "",
      tipo_lancamento: displayTipoLancamento || "",
      equipe_id: data.equipe_id || "",
      apontador_id: data.apontador_id || "",
      usina_id: data.usina_id || "",
      data_entrega: data.data_entrega || form.getValues().data_entrega || "",
      status: "Pendente" as const,
      cancelled: false,
      cancelReason: ""
    };

    const currentItems = form.getValues().itens || [];
    form.setValue("itens", [...currentItems, newItem], { shouldValidate: true });
    
    toast({
      title: "Item adicionado",
      description: "Item adicionado com sucesso à programação",
    });

    // Atualizar progresso
    if (progressHook) {
      progressHook.refetch();
    }
  }, [form, toast, progressHook]);

  const removeItem = useCallback(
    (index: number) => {
      const currentItems = form.getValues().itens || [];
      const item = currentItems[index];

      if (!item) return;

      // Prevent removal of already sent or delivered items
      if (item.status === "Enviada" || item.status === "Entregue") {
        toast({
          title: "Operação não permitida",
          description:
            "Não é possível excluir uma entrega que já foi enviada ou entregue.",
          variant: "destructive",
        });
        return;
      }

      // Basic confirmation to avoid accidental deletion
      if (typeof window !== "undefined") {
        const confirmDelete = window.confirm(
          "Deseja realmente remover esta entrega da lista?"
        );
        if (!confirmDelete) return;
      }

      const newItems = [...currentItems];
      newItems.splice(index, 1);
      form.setValue("itens", newItems, { shouldValidate: true });
    },
    [form, toast]
  );

  const openCancelDialog = useCallback((index: number) => {
    const currentItems = form.getValues().itens || [];
    const item = currentItems[index];
    
    // Check if item exists and its status
    if (item) {
      if (item.status === 'Enviada' || item.status === 'Entregue') {
        toast({
          title: "Operação não permitida",
          description: "Não é possível cancelar uma entrega que já foi enviada ou entregue.",
          variant: "destructive",
        });
        return;
      }
      
      setItemToCancel(index);
      setShowCancelDialog(true);
    }
  }, [form, toast]);

  const closeCancelDialog = useCallback(() => {
    setShowCancelDialog(false);
    setItemToCancel(null);
  }, []);

  const confirmCancel = useCallback((reason: string) => {
    if (itemToCancel === null) return;
    
    const currentItems = form.getValues().itens || [];
    const newItems = [...currentItems];
    
    newItems[itemToCancel] = {
      ...newItems[itemToCancel],
      cancelled: true,
      status: 'Cancelada' as const,
      cancelReason: reason
    };
    
    form.setValue("itens", newItems, { shouldValidate: true });
    
    toast({
      title: "Entrega cancelada",
      description: "A entrega foi cancelada com sucesso.",
    });
    
    setShowCancelDialog(false);
    setItemToCancel(null);
  }, [form, itemToCancel, toast]);

  const calculateProgrammedQuantity = useCallback(() => {
    const itens = form.getValues().itens || [];
    return itens.reduce((sum, item) => {
      if (item.cancelled) return sum;
      
      // Usar função padronizada para conversão
      const quantity = typeof item.quantidade_massa === 'number' 
        ? normalizeToToneladas(item.quantidade_massa)
        : normalizeToToneladas(parseFloat(String(item.quantidade_massa || 0)));
      
      return sum + quantity;
    }, 0);
  }, [form]);

  return {
    addItem,
    removeItem,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    showCancelDialog,
    itemToCancel,
    calculateProgrammedQuantity
  };
};
