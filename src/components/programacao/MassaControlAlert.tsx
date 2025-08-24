import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { useProgramacaoProgress } from "@/hooks/useProgramacaoProgress";
import { normalizeToToneladas } from "@/utils/massaConversionUtils";

interface MassaControlAlertProps {
  requisicaoId: string | null;
  quantidadeTentativa?: number;
  className?: string;
}

export const MassaControlAlert: React.FC<MassaControlAlertProps> = ({
  requisicaoId,
  quantidadeTentativa,
  className = ""
}) => {
  const { 
    progress, 
    isLoading, 
    validarQuantidadeProgramacao,
    isCompleto,
    podeSerProgramada,
    massaDisponivel
  } = useProgramacaoProgress({ requisicaoId });

  if (isLoading || !progress || !requisicaoId) {
    return null;
  }

  // Se uma quantidade específica foi fornecida, validar
  if (quantidadeTentativa !== undefined && quantidadeTentativa > 0) {
    const validacao = validarQuantidadeProgramacao(quantidadeTentativa);
    
    if (!validacao.valida) {
      return (
        <Alert variant="destructive" className={className}>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quantidade inválida:</strong> {validacao.motivo}
          </AlertDescription>
        </Alert>
      );
    }

    // Se válida, mostrar confirmação
    const quantidadeNormalizada = normalizeToToneladas(quantidadeTentativa);
    return (
      <Alert className={`border-green-500 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <strong>Quantidade válida!</strong> Após esta programação restará {(massaDisponivel - quantidadeNormalizada).toFixed(1)}t disponível.
        </AlertDescription>
      </Alert>
    );
  }

  // Alertas gerais baseados no status da requisição
  if (isCompleto) {
    return (
      <Alert className={`border-blue-500 bg-blue-50 ${className}`}>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Requisição completa:</strong> Toda a massa foi aplicada. Esta requisição será removida automaticamente da lista de programação.
        </AlertDescription>
      </Alert>
    );
  }

  if (!podeSerProgramada) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sem disponibilidade:</strong> Esta requisição não possui massa disponível para nova programação.
        </AlertDescription>
      </Alert>
    );
  }

  // Aviso de pouca massa disponível
  if (massaDisponivel <= 5 && massaDisponivel > 0.1) {
    return (
      <Alert className={`border-yellow-500 bg-yellow-50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          <strong>Pouca massa disponível:</strong> Restam apenas {massaDisponivel.toFixed(1)}t para programação.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default MassaControlAlert;