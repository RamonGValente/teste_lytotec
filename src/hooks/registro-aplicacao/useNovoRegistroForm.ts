import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { RegistroCarga } from "@/types/registroCargas";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroAplicacao } from "@/types/registroAplicacao";
import { registroAplicacaoSchema, RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { fetchRegistroAplicacaoByListaEntregaId } from "@/services/registro-aplicacao/fetchRegistroAplicacao";
import { supabase } from "@/integrations/supabase/client";

export const useNovoRegistroForm = (
  entrega: ListaProgramacaoEntrega | null,
  registroCarga: RegistroCarga | null,
  onSuccess: () => void
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [registroExistente, setRegistroExistente] = useState<RegistroAplicacao | null>(null);

  const form = useForm<RegistroAplicacaoSchema>({
    resolver: zodResolver(registroAplicacaoSchema),
    defaultValues: {
      lista_entrega_id: '',
      registro_carga_id: '',
      data_aplicacao: new Date().toISOString().split('T')[0],
      hora_chegada_local: '',
      tonelada_aplicada: 0,
      // area_calculada: removido - não existe na tabela
      logradouro_aplicado: '',
      aplicacao_sequencia: 1,
      carga_finalizada: false,
    },
  });

  // Carregar dados existentes quando entrega e carga estiverem disponíveis
  useEffect(() => {
    const loadExistingData = async () => {
      if (!entrega?.id || dataLoaded) return;
      
      setIsLoadingData(true);
      try {
        console.log("🔍 [FORM] Verificando registro existente para entrega:", entrega.id);
        
        const existingRegistro = await fetchRegistroAplicacaoByListaEntregaId(entrega.id);
        
        if (existingRegistro) {
          console.log("📋 [FORM] Registro existente encontrado:", existingRegistro.id);
          setRegistroExistente(existingRegistro);
          
          // Preencher formulário com dados existentes
          form.reset({
            lista_entrega_id: existingRegistro.lista_entrega_id,
            registro_carga_id: existingRegistro.registro_carga_id,
            data_aplicacao: existingRegistro.data_aplicacao,
            hora_chegada_local: existingRegistro.hora_chegada_local,
            hora_saida_caminhao: existingRegistro.hora_saida_caminhao || '',
            temperatura_chegada: existingRegistro.temperatura_chegada || undefined,
            anotacoes_apontador: existingRegistro.anotacoes_apontador || '',
            tonelada_aplicada: existingRegistro.tonelada_aplicada || registroCarga?.tonelada_real || 0,
            // area_calculada: removido - não existe na tabela
            logradouro_aplicado: existingRegistro.logradouro_aplicado || entrega.logradouro,
            aplicacao_sequencia: existingRegistro.aplicacao_sequencia || 1,
            
            carga_finalizada: existingRegistro.carga_finalizada || false,
          });
        } else {
          console.log("✨ [FORM] Novo registro - inicializando com dados da entrega");
          
          // Inicializar com dados da entrega para novo registro
          form.reset({
            lista_entrega_id: entrega.id,
            registro_carga_id: registroCarga?.id || '',
            data_aplicacao: new Date().toISOString().split('T')[0],
            hora_chegada_local: '',
            tonelada_aplicada: registroCarga?.tonelada_real || 0,
            // area_calculada: removido - não existe na tabela
            logradouro_aplicado: entrega.logradouro,
            aplicacao_sequencia: 1,
            
            carga_finalizada: false,
          });
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error("❌ [FORM] Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do registro.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadExistingData();
  }, [entrega?.id, registroCarga?.id, dataLoaded, form, toast]);

  // Função de submit ajustada para receber callback no segundo parâmetro
  const handleDirectSubmit = async (formData: RegistroAplicacaoSchema, options?: { onSuccess?: () => void }) => {
    console.log("🚀 [FORM] Iniciando submit com dados:", formData);
    
    setIsLoading(true);
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Garantir que campos obrigatórios estão preenchidos
      if (!formData.lista_entrega_id || !formData.registro_carga_id) {
        throw new Error("IDs da entrega e carga são obrigatórios");
      }

      // CORREÇÃO: Garantir que tonelada_aplicada sempre tenha um valor
      const toneladaAplicada = formData.tonelada_aplicada || registroCarga?.tonelada_real || 0;
      
      if (toneladaAplicada <= 0) {
        throw new Error("Tonelada aplicada deve ser maior que zero");
      }

      // Preparar dados para envio
      const submitData = {
        lista_entrega_id: formData.lista_entrega_id,
        registro_carga_id: formData.registro_carga_id,
        data_aplicacao: formData.data_aplicacao,
        hora_chegada_local: formData.hora_chegada_local,
        // CORREÇÃO: Garantir que hora_saida_caminhao seja salva corretamente
        hora_saida_caminhao: formData.hora_saida_caminhao && formData.hora_saida_caminhao.trim() !== '' 
          ? formData.hora_saida_caminhao 
          : null,
        temperatura_chegada: formData.temperatura_chegada || null,
        anotacoes_apontador: formData.anotacoes_apontador || null,
        tonelada_aplicada: toneladaAplicada,
        // area_calculada: removido - não existe na tabela
        logradouro_aplicado: formData.logradouro_aplicado || entrega?.logradouro || '',
        aplicacao_sequencia: formData.aplicacao_sequencia || 1,
        
        carga_finalizada: formData.carga_finalizada || false,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      console.log("📦 [FORM] Dados preparados para envio:", submitData);
      console.log("🕐 [FORM] Hora de saída no submitData:", submitData.hora_saida_caminhao);

      let result;
      let error;
      
      if (registroExistente) {
        // Atualizar registro existente
        console.log("🔄 [FORM] Atualizando registro existente:", registroExistente.id);
        
        const { data: updatedData, error: updateError } = await supabase
          .from("bd_registro_apontamento_aplicacao")
          .update(submitData)
          .eq("id", registroExistente.id)
          .select()
          .single();

        error = updateError;
        result = updatedData;
      } else {
        // Criar novo registro
        console.log("✨ [FORM] Criando novo registro");
        
        const { data: newData, error: insertError } = await supabase
          .from("bd_registro_apontamento_aplicacao")
          .insert([submitData])
          .select()
          .single();

        error = insertError;
        result = newData;
      }

      if (error) {
        console.error("❌ [FORM] Erro na operação:", error);
        throw error;
      }

      console.log("✅ [FORM] Registro salvo com sucesso:", result.id);
      
      // Toast de sucesso
      toast({
        title: "Sucesso",
        description: registroExistente 
          ? "Registro atualizado com sucesso!" 
          : "Registro criado com sucesso!",
        variant: "default",
      });

      // CORREÇÃO: Executar callback passado como parâmetro OU o callback do hook
      console.log("🎯 [FORM] Executando callbacks");
      
      if (options?.onSuccess) {
        console.log("🔄 [FORM] Executando callback do parâmetro");
        options.onSuccess();
      } else if (onSuccess) {
        console.log("🔄 [FORM] Executando callback do hook");
        onSuccess();
      }

    } catch (error: any) {
      console.error("❌ [FORM] Erro no submit:", error);
      
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar registro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isLoadingData,
    dataLoaded,
    registroExistente,
    onSubmit: handleDirectSubmit, // Retornar função que aceita callback
  };
};
