import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Package } from "lucide-react";
import { useProgramacaoProgress } from "@/hooks/useProgramacaoProgress";

interface ProgressBarProps {
  requisicaoId: string | null;
  showDetailed?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  requisicaoId, 
  showDetailed = true,
  className = ""
}) => {
  const { 
    progress, 
    isLoading, 
    getProgressColor, 
    getStatusMessage, 
    getDisplayData,
    isCompleto,
    podeSerProgramada
  } = useProgramacaoProgress({ requisicaoId });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress || !requisicaoId) {
    return null;
  }

  const displayData = getDisplayData();
  if (!displayData) return null;

  const getStatusIcon = () => {
    if (isCompleto) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (!podeSerProgramada) return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getStatusBadge = () => {
    if (isCompleto) return <Badge variant="default" className="bg-green-500">Completa</Badge>;
    if (!podeSerProgramada) return <Badge variant="destructive">Sem Disponibilidade</Badge>;
    return <Badge variant="secondary">Em Andamento</Badge>;
  };

  return (
    <Card className={`border-l-4 ${isCompleto ? 'border-l-green-500' : !podeSerProgramada ? 'border-l-red-500' : 'border-l-blue-500'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Progresso da Massa
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso Principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total da Requisição</span>
            <span>{displayData.totalFormatado}</span>
          </div>
          
          {/* Barra dupla: Aplicada + Programada */}
          <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
            {/* Massa Aplicada (verde) */}
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress.percentualAplicado}%` }}
            />
            
            {/* Massa Programada (azul) */}
            <div 
              className="absolute top-0 h-full bg-blue-500 transition-all duration-500"
              style={{ 
                left: `${progress.percentualAplicado}%`,
                width: `${progress.percentualProgramado}%` 
              }}
            />
            
            {/* Texto no centro */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {displayData.progressoTotal.toFixed(1)}%
            </div>
          </div>
          
          {/* Legenda */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Aplicada</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span>Programada</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <span>Disponível</span>
            </div>
          </div>
        </div>

        {/* Detalhes */}
        {showDetailed && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Aplicada</div>
              <div className="font-medium text-green-700">{displayData.aplicadaFormatado}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Programada</div>
              <div className="font-medium text-blue-700">{displayData.programadaFormatado}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Disponível</div>
              <div className="font-medium text-orange-700">{displayData.disponivelFormatado}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="flex items-center gap-1 text-sm">
                {getStatusIcon()}
                <span className="truncate">{getStatusMessage()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alerta se não pode ser programada */}
        {!podeSerProgramada && !isCompleto && (
          <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-md text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Esta requisição não pode receber novas programações.</span>
          </div>
        )}

        {/* Confirmação se completa */}
        {isCompleto && (
          <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-md text-xs">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Requisição totalmente aplicada! Será removida da lista de programação.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressBar;