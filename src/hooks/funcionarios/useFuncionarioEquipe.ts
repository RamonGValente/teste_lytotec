
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFuncionarioEquipe(funcionarioId?: string) {
  return useQuery({
    queryKey: ['funcionario-equipe', funcionarioId],
    queryFn: async () => {
      if (!funcionarioId) return null;
      
      // Primeiro buscar o funcionário para pegar o equipe_id
      const { data: funcionario, error: funcionarioError } = await supabase
        .from("bd_funcionarios")
        .select("equipe_id")
        .eq("id", funcionarioId)
        .single();
        
      if (funcionarioError) {
        console.error("Erro ao buscar funcionário:", funcionarioError);
        return null;
      }
      
      // Se não tem equipe_id, retornar null
      if (!funcionario?.equipe_id) {
        return null;
      }
      
      // Agora buscar o nome da equipe
      const { data: equipe, error: equipeError } = await supabase
        .from("bd_equipes")
        .select("nome_equipe")
        .eq("id", funcionario.equipe_id)
        .single();
        
      if (equipeError) {
        console.error("Erro ao buscar equipe:", equipeError);
        return null;
      }
      
      return equipe?.nome_equipe || null;
    },
    enabled: !!funcionarioId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
