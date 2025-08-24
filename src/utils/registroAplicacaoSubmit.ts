
import { RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { supabase } from "@/integrations/supabase/client";

export const handleFormSubmission = async (
  data: RegistroAplicacaoSchema,
  toast: any,
  onSuccess?: () => void,
  existingId?: string
) => {
  try {
    console.log("🚀 [SUBMIT] Iniciando envio:", { data, existingId });

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Preparar dados com validação de campos de hora
    const submitData = {
      ...data,
      // Garantir que hora_saida_caminhao seja formatada corretamente
      hora_saida_caminhao: data.hora_saida_caminhao || null,
      hora_chegada_local: data.hora_chegada_local,
      // Garantir que created_by seja mapeado corretamente
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log("📦 [SUBMIT] Dados preparados:", submitData);
    console.log("🕐 [SUBMIT] Hora de saída sendo salva:", submitData.hora_saida_caminhao);

    let result;
    
    if (existingId) {
      // Atualizar registro existente
      console.log("🔄 [SUBMIT] Atualizando registro:", existingId);
      
      const { data: updated, error } = await supabase
        .from("bd_registro_apontamento_aplicacao")
        .update(submitData)
        .eq("id", existingId)
        .select()
        .single();

      if (error) {
        console.error("❌ [SUBMIT] Erro na atualização:", error);
        throw error;
      }
      
      result = updated;
    } else {
      // Criar novo registro
      console.log("✨ [SUBMIT] Criando novo registro");
      
      const { data: created, error } = await supabase
        .from("bd_registro_apontamento_aplicacao")
        .insert([submitData] as any)
        .select()
        .single();

      if (error) {
        console.error("❌ [SUBMIT] Erro na criação:", error);
        throw error;
      }
      
      result = created;
    }

    console.log("✅ [SUBMIT] Sucesso:", result);

    // Toast de sucesso
    toast({
      title: "Sucesso",
      description: existingId 
        ? "Registro atualizado com sucesso!" 
        : "Registro criado com sucesso!",
      variant: "default",
    });

    // Executar callback com delay para garantir execução
    if (onSuccess) {
      setTimeout(() => {
        console.log("🎯 [SUBMIT] Executando callback de sucesso");
        onSuccess();
      }, 100);
    }

    return result;
  } catch (error: any) {
    console.error("❌ [SUBMIT] Erro geral:", error);
    
    toast({
      title: "Erro",
      description: error.message || "Erro ao salvar registro",
      variant: "destructive",
    });
    
    throw error;
  }
};
