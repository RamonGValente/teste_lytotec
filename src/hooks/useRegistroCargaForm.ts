
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCargaFormValues } from "@/types/registroCargas";
import { 
  getCurrentBrazilianDate,
} from "@/utils/timezoneUtils";
import { createRegistroCarga, updateRegistroCarga, fetchRegistroCargaByListaEntregaId } from "@/services/registroCargaService";
import { isDateAllowed } from "@/utils/dateValidation";

interface UseRegistroCargaFormProps {
  onSuccess?: () => void;
}

// Função para validar e normalizar valores numéricos
const safeNumber = (value: any, defaultValue?: number): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : Math.max(0, num);
};

// Função para validar dados antes do submit
const validateFormData = (data: RegistroCargaFormValues, ticketSaidaPreview: string | null): string | null => {
  console.log("🔍 [VALIDAÇÃO] Iniciando validação dos dados:", data);
  console.log("🖼️ [VALIDAÇÃO] Preview da imagem:", ticketSaidaPreview ? "PRESENTE" : "AUSENTE");
  console.log("📎 [VALIDAÇÃO] Arquivo no formulário:", data.imagem_ticket_saida ? "PRESENTE" : "AUSENTE");
  
  if (!data.lista_entrega_id) {
    console.log("❌ [VALIDAÇÃO] ID da entrega é obrigatório");
    return "ID da entrega é obrigatório";
  }
  
  if (!data.data_saida) {
    console.log("❌ [VALIDAÇÃO] Data de saída é obrigatória");
    return "Data de saída é obrigatória";
  }

  // Validar data de saída
  const dateValidation = isDateAllowed(data.data_saida);
  if (!dateValidation.isValid) {
    console.log("❌ [VALIDAÇÃO] Data de saída inválida:", dateValidation.message);
    return dateValidation.message || "Data de saída inválida";
  }
  
  if (!data.hora_saida) {
    console.log("❌ [VALIDAÇÃO] Hora de saída é obrigatória");
    return "Hora de saída é obrigatória";
  }
  
  // Validação aprimorada da imagem do ticket de saída
  console.log("🔍 [VALIDAÇÃO] Detalhes da imagem:", {
    arquivoType: typeof data.imagem_ticket_saida,
    arquivoInstance: data.imagem_ticket_saida instanceof File ? "File" : "Other",
    arquivoNull: data.imagem_ticket_saida === null,
    arquivoUndefined: data.imagem_ticket_saida === undefined,
    previewPresente: !!ticketSaidaPreview,
    previewValue: ticketSaidaPreview
  });
  
  // Verificar se é um arquivo File válido ou se existe preview/URL
  const isValidFile = data.imagem_ticket_saida instanceof File && data.imagem_ticket_saida.size > 0;
  const isValidUrl = typeof data.imagem_ticket_saida === 'string' && data.imagem_ticket_saida.length > 0;
  const hasValidPreview = typeof ticketSaidaPreview === 'string' && ticketSaidaPreview.length > 0;
  
  const hasTicketImage = isValidFile || isValidUrl || hasValidPreview;
  
  console.log("🔍 [VALIDAÇÃO] Resultado da verificação:", {
    isValidFile,
    isValidUrl,
    hasValidPreview,
    hasTicketImage
  });
  
  if (!hasTicketImage) {
    console.log("❌ [VALIDAÇÃO] Imagem do ticket de saída é obrigatória");
    return "Imagem do ticket de saída é obrigatória";
  }
  
  const toneladaSaida = Number(data.tonelada_saida);
  if (isNaN(toneladaSaida) || toneladaSaida <= 0) {
    console.log("❌ [VALIDAÇÃO] Tonelada de saída deve ser maior que zero");
    return "Tonelada de saída deve ser maior que zero";
  }
  
  console.log("✅ [VALIDAÇÃO] Todos os dados válidos");
  return null;
};

export const useRegistroCargaForm = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [ticketSaidaPreview, setTicketSaidaPreview] = useState<string | null>(null);
  const [ticketRetornoPreview, setTicketRetornoPreview] = useState<string | null>(null);
  const [currentListaEntregaId, setCurrentListaEntregaId] = useState<string | null>(null);

  const form = useForm<RegistroCargaFormValues>({
    defaultValues: {
      data_saida: getCurrentBrazilianDate(),
      temperatura_saida: undefined,
      tonelada_saida: undefined,
      tonelada_retorno: undefined,
      hora_saida: "",
      lista_entrega_id: "",
      programacao_id: "",
      imagem_ticket_saida: null,
      imagem_ticket_retorno: null,
      status_registro: "Ativo",
    },
  });

  const handleTicketSaidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("📸 [IMAGEM] Arquivo selecionado:", file ? `${file.name} (${file.size} bytes)` : "Nenhum");
    
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        console.log("❌ [IMAGEM] Tipo inválido:", file.type);
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (JPEG, PNG ou WebP)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log("❌ [IMAGEM] Arquivo muito grande:", file.size);
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ [IMAGEM] Arquivo válido, criando preview...");
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("📸 [IMAGEM] Preview criado com sucesso");
        setTicketSaidaPreview(reader.result as string);
      };
      reader.onerror = () => {
        console.log("❌ [IMAGEM] Erro ao criar preview");
        toast({
          title: "Erro",
          description: "Erro ao processar a imagem",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
      
      // Definir o arquivo no formulário
      console.log("📝 [IMAGEM] Definindo arquivo no formulário");
      form.setValue("imagem_ticket_saida", file, { shouldValidate: true });
    } else {
      console.log("🗑️ [IMAGEM] Removendo arquivo e preview");
      setTicketSaidaPreview(null);
      form.setValue("imagem_ticket_saida", null);
    }
  };

  const handleTicketRetornoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (JPEG, PNG ou WebP)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketRetornoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("imagem_ticket_retorno", file);
    }
  };

  const initializeFromListaEntrega = useCallback(async (entrega: ListaProgramacaoEntrega) => {
    try {
      console.log("📋 [CARGA] Inicializando formulário com entrega:", entrega);
      
      // Verificar se existe registro existente
      const existingRegistro = await fetchRegistroCargaByListaEntregaId(entrega.id);
      
      let defaultValues: any = {
        lista_entrega_id: entrega.id,
        programacao_id: entrega.programacao_id || entrega.programacao_entrega_id || "",
        data_saida: getCurrentBrazilianDate(),
        hora_saida: "",
        tonelada_saida: undefined,
        tonelada_retorno: undefined,
        temperatura_saida: undefined,
        status_registro: "Ativo" as const
      };

      if (existingRegistro) {
        console.log("🔄 [CARGA] Registro existente encontrado:", existingRegistro);
        
        // Preservar valores originais do banco (já em kg)
        defaultValues = {
          ...existingRegistro,
          data_saida: existingRegistro.data_saida || getCurrentBrazilianDate(),
          temperatura_saida: existingRegistro.temperatura_saida || undefined,
          tonelada_saida: existingRegistro.tonelada_saida || undefined,
          tonelada_retorno: existingRegistro.tonelada_retorno || undefined,
          hora_saida: existingRegistro.hora_saida || "",
          status_registro: (existingRegistro.status_registro as "Ativo" | "Concluído" | "Cancelado") || "Ativo"
        };

        // Definir previews de imagens se existirem
        if (existingRegistro.imagem_ticket_saida) {
          setTicketSaidaPreview(existingRegistro.imagem_ticket_saida);
        }
        
        if (existingRegistro.imagem_ticket_retorno) {
          setTicketRetornoPreview(existingRegistro.imagem_ticket_retorno);
        }
      }

      console.log("✅ [CARGA] Valores iniciais definidos:", defaultValues);
      form.reset(defaultValues);
      setCurrentListaEntregaId(entrega.id);
      
    } catch (error) {
      console.error("❌ [CARGA] Erro ao inicializar formulário:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da entrega",
        variant: "destructive",
      });
    }
  }, [form, toast]);

  const onSubmit = useCallback(async (data: RegistroCargaFormValues) => {
    console.log("🚀 [CARGA] Iniciando submit do formulário");
    console.log("📋 [CARGA] Dados recebidos:", data);
    console.log("🆔 [CARGA] Lista entrega ID atual:", currentListaEntregaId);
    
    if (!currentListaEntregaId) {
      console.error("❌ [CARGA] ID da entrega não encontrado");
      toast({
        title: "Erro",
        description: "ID da entrega não encontrado",
        variant: "destructive",
      });
      return;
    }

    // Validar dados antes do submit
    console.log("🔍 [CARGA] Iniciando validação dos dados");
    console.log("📋 [CARGA] Estado atual do formulário:", form.getValues());
    console.log("🖼️ [CARGA] Previews atuais:", { ticketSaidaPreview, ticketRetornoPreview });
    
    const validationError = validateFormData(data, ticketSaidaPreview);
    if (validationError) {
      console.error("❌ [CARGA] Erro de validação:", validationError);
      toast({
        title: "Erro de Validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    console.log("✅ [CARGA] Validação dos dados concluída com sucesso");

    try {
      setIsLoading(true);
      console.log("📤 [CARGA] Dados para envio (preservando valores originais):", data);

      const registroData = {
        lista_entrega_id: currentListaEntregaId,
        programacao_id: data.programacao_id || "",
        data_saida: data.data_saida || getCurrentBrazilianDate(),
        hora_saida: data.hora_saida || "",
        status_registro: data.status_registro || "Ativo" as const,
        // Manter valores originais como inseridos (preservando kg)
        tonelada_saida: data.tonelada_saida ? Number(data.tonelada_saida) : 0,
        tonelada_retorno: data.tonelada_retorno ? Number(data.tonelada_retorno) : null,
        temperatura_saida: data.temperatura_saida == null || data.temperatura_saida === undefined ? null : Number(data.temperatura_saida),
        imagem_ticket_saida: data.imagem_ticket_saida,
        imagem_ticket_retorno: data.imagem_ticket_retorno,
      };

      console.log("💾 [CARGA] Dados para salvar (valores originais):", registroData);

      // Fazer upload das imagens antes de salvar no banco
      let imagemTicketSaidaUrl = registroData.imagem_ticket_saida;
      let imagemTicketRetornoUrl = registroData.imagem_ticket_retorno;
      
      // Upload da imagem de saída (obrigatória)
      if (imagemTicketSaidaUrl instanceof File) {
        console.log("📤 [CARGA] Fazendo upload da imagem de saída...");
        const { uploadImage } = await import("@/services/storageService");
        imagemTicketSaidaUrl = await uploadImage(imagemTicketSaidaUrl, "tickets");
        console.log("✅ [CARGA] Upload da imagem de saída concluído:", imagemTicketSaidaUrl);
      }
      
      // Upload da imagem de retorno (opcional)
      if (imagemTicketRetornoUrl instanceof File) {
        console.log("📤 [CARGA] Fazendo upload da imagem de retorno...");
        const { uploadImage } = await import("@/services/storageService");
        imagemTicketRetornoUrl = await uploadImage(imagemTicketRetornoUrl, "tickets");
        console.log("✅ [CARGA] Upload da imagem de retorno concluído:", imagemTicketRetornoUrl);
      }
      
      // Atualizar dados com URLs das imagens
      const finalRegistroData = {
        ...registroData,
        imagem_ticket_saida: imagemTicketSaidaUrl,
        imagem_ticket_retorno: imagemTicketRetornoUrl
      };
      
      console.log("🔄 [CARGA] Dados finais para salvar:", finalRegistroData);

      // Verificar se é atualização ou criação
      const existingRegistro = await fetchRegistroCargaByListaEntregaId(currentListaEntregaId);
      
      if (existingRegistro) {
        console.log("🔄 [CARGA] Atualizando registro existente:", existingRegistro.id);
        await updateRegistroCarga(existingRegistro.id, finalRegistroData);
      } else {
        console.log("✨ [CARGA] Criando novo registro");
        await createRegistroCarga(finalRegistroData);
      }
      
      toast({
        title: "Sucesso",
        description: "Registro de carga salvo com sucesso",
      });
      
      onSuccess?.();
      
    } catch (error: any) {
      console.error("❌ [CARGA] Erro ao salvar registro:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentListaEntregaId, toast, onSuccess, ticketSaidaPreview, ticketRetornoPreview, form]);

  return {
    form,
    isLoading,
    ticketSaidaPreview,
    ticketRetornoPreview,
    handleTicketSaidaChange,
    handleTicketRetornoChange,
    onSubmit: form.handleSubmit(onSubmit),
    initializeFromListaEntrega,
  };
};
