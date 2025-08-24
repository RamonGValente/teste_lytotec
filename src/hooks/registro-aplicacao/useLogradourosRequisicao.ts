
import { useState, useEffect } from "react";
import { fetchLogradourosByRequisicao } from "@/services/logradourosService";
import { useToast } from "@/hooks/use-toast";

interface LogradouroOption {
  id: string;
  logradouro: string;
  requisicao_id: string;
  // Dados adicionais da rua se disponíveis
  largura?: number;
  comprimento?: number;
  area?: number;
  espessura?: number;
}

export const useLogradourosRequisicao = (requisicaoId?: string) => {
  const [logradouros, setLogradouros] = useState<LogradouroOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadLogradouros = async (reqId: string) => {
    setIsLoading(true);
    try {
      console.log("🔄 Loading logradouros for requisicao:", reqId);
      const data = await fetchLogradourosByRequisicao(reqId);
      console.log("✅ Logradouros loaded successfully:", data.length);
      console.log("📍 Logradouros list:", data.map(l => l.logradouro));
      setLogradouros(data);
    } catch (error) {
      console.error("❌ Erro ao carregar logradouros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logradouros da requisição",
        variant: "destructive",
      });
      setLogradouros([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (requisicaoId) {
      loadLogradouros(requisicaoId);
    } else {
      setLogradouros([]);
    }
  }, [requisicaoId]);

  return {
    logradouros,
    isLoading,
    refetch: () => requisicaoId && loadLogradouros(requisicaoId)
  };
};
