import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { calcularProgressoMassa, MassaProgressInfo } from "@/services/programacao/massaControlService";
import { normalizeToToneladas } from "@/utils/massaConversionUtils";

interface UseProgramacaoProgressProps {
  requisicaoId: string | null;
  enabled?: boolean;
}

export const useProgramacaoProgress = ({ requisicaoId, enabled = true }: UseProgramacaoProgressProps) => {
  const [progress, setProgress] = useState<MassaProgressInfo | null>(null);

  const { 
    data: progressData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['programacao-progress', requisicaoId],
    queryFn: () => requisicaoId ? calcularProgressoMassa(requisicaoId) : null,
    enabled: enabled && !!requisicaoId,
    refetchOnWindowFocus: false,
    staleTime: 5000, // 5 segundos
  });

  useEffect(() => {
    if (progressData) {
      setProgress(progressData);
    }
  }, [progressData]);

  // Função para verificar se quantidade pode ser programada
  const validarQuantidadeProgramacao = (quantidade: number): {
    valida: boolean;
    motivo?: string;
  } => {
    if (!progress) {
      return { valida: false, motivo: "Carregando dados de progresso..." };
    }

    // Normalizar quantidade para toneladas antes da validação
    const quantidadeNormalizada = normalizeToToneladas(quantidade);

    if (quantidadeNormalizada <= 0) {
      return { valida: false, motivo: "Quantidade deve ser maior que zero" };
    }

    if (quantidadeNormalizada > progress.massaDisponivel) {
      return { 
        valida: false, 
        motivo: `Quantidade excede o disponível (${progress.massaDisponivel.toFixed(1)}t)` 
      };
    }

    return { valida: true };
  };

  // Função para obter cor da barra de progresso
  const getProgressColor = (): string => {
    if (!progress) return "bg-gray-200";
    
    if (progress.isCompleto) return "bg-green-500";
    if (progress.percentualAplicado > 75) return "bg-blue-500";
    if (progress.percentualAplicado > 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Função para obter mensagem de status
  const getStatusMessage = (): string => {
    if (!progress) return "Carregando...";
    
    if (progress.isCompleto) {
      return "Requisição 100% aplicada";
    }
    
    if (progress.massaDisponivel <= 0.1) {
      return "Sem massa disponível para programação";
    }
    
    return `${progress.massaDisponivel.toFixed(1)}t disponíveis`;
  };

  // Função para obter dados formatados para exibição
  const getDisplayData = () => {
    if (!progress) return null;

    return {
      totalFormatado: `${progress.totalRequisicao.toFixed(1)}t`,
      aplicadaFormatado: `${progress.massaAplicada.toFixed(1)}t (${progress.percentualAplicado.toFixed(1)}%)`,
      programadaFormatado: `${progress.massaProgramada.toFixed(1)}t (${progress.percentualProgramado.toFixed(1)}%)`,
      disponivelFormatado: `${progress.massaDisponivel.toFixed(1)}t`,
      progressoTotal: progress.percentualAplicado + progress.percentualProgramado,
    };
  };

  return {
    progress,
    isLoading,
    error,
    refetch,
    validarQuantidadeProgramacao,
    getProgressColor,
    getStatusMessage,
    getDisplayData,
    // Estados derivados
    isCompleto: progress?.isCompleto || false,
    podeSerProgramada: progress?.podeSerProgramada || false,
    massaDisponivel: progress?.massaDisponivel || 0,
  };
};