
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { validateMassaAplicada, getMassaStatusClass, getProgressBarColor } from "@/utils/massaValidationUtils";
import { formatMassaFromDatabase } from "@/utils/massaConversionUtils";

interface EntregaSummaryProps {
  entrega: ListaProgramacaoEntrega;
  calculatedEspessura: number | null;
  espessuraStatusClass: string;
  getEspessuraStatusText: () => string;
  registroCarga: any;
  calculatedToneladaAplicada: number | null;
  massaRemanescente: number;
  exceededAvailableMass: boolean;
  totalAplicado?: number;
}

const EntregaSummary: React.FC<EntregaSummaryProps> = ({
  entrega,
  calculatedEspessura,
  espessuraStatusClass,
  getEspessuraStatusText,
  registroCarga,
  calculatedToneladaAplicada,
  massaRemanescente,
  exceededAvailableMass,
  totalAplicado = 0
}) => {
  // CORREÇÃO CRÍTICA: tonelada_real está em KG, converter para toneladas
  const massaTotal = registroCarga?.tonelada_real 
    ? formatMassaFromDatabase(registroCarga.tonelada_real, 'bd_registro_cargas', 'tonelada_real')
    : 0;
  const massaValidation = validateMassaAplicada(totalAplicado, massaTotal);
  const massaStatusClass = getMassaStatusClass(massaValidation);
  const progressBarColor = getProgressBarColor(massaValidation);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-800">Entrega</div>
            <div className="text-xs text-blue-600">
              <div>Logradouro: {entrega.logradouro}</div>
              <div>Data: {new Date(entrega.data_entrega).toLocaleDateString("pt-BR")}</div>
              <div>Tipo: {entrega.tipo_lancamento}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-800">Massa da Carga</div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Total:</span>
                <span className="font-medium">{massaTotal.toFixed(1)}t</span>
              </div>
              
              {/* Validação do Total Aplicado */}
              <div className={`flex justify-between items-center rounded px-2 py-1 border ${massaStatusClass}`}>
                <div className="flex items-center gap-1">
                  <span className="text-xs">Total Aplicado:</span>
                  {massaValidation.exceededMass && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {!massaValidation.exceededMass && totalAplicado > 0 && (
                    <CheckCircle className="h-3 w-3" />
                  )}
                </div>
                <span className="font-medium">{totalAplicado.toFixed(1)}t</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-600">Remanescente:</span>
                <span className="font-medium">{massaRemanescente.toFixed(1)}t</span>
              </div>
              
              {/* Progress Bar com validação */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600">Progresso:</span>
                  <span className="text-xs font-medium">
                    {massaValidation.percentualAplicado.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={massaValidation.percentualAplicado} 
                  className="h-2"
                  style={{
                    '--progress-background': massaValidation.exceededMass ? '#ef4444' : 
                                           massaValidation.percentualAplicado >= 90 ? '#f97316' : '#10b981'
                  } as React.CSSProperties}
                />
                
                {/* Mensagem de validação */}
                {massaValidation.message && (
                  <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    {massaValidation.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-800">Cálculos</div>
            <div className="space-y-1">
              {calculatedToneladaAplicada !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600">Esta Aplicação:</span>
                  <span className="font-medium">{calculatedToneladaAplicada.toFixed(1)}t</span>
                </div>
              )}
              
              {calculatedEspessura !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600">Espessura:</span>
                  <Badge variant="outline" className={espessuraStatusClass}>
                    {calculatedEspessura.toFixed(1)}cm
                  </Badge>
                </div>
              )}
              
              {calculatedEspessura !== null && (
                <div className="text-xs text-center mt-1">
                  <span className={espessuraStatusClass}>
                    {getEspessuraStatusText()}
                  </span>
                </div>
              )}

              {/* Alerta de massa excedida */}
              {exceededAvailableMass && (
                <div className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                  <AlertTriangle className="h-3 w-3" />
                  Excede massa disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntregaSummary;
