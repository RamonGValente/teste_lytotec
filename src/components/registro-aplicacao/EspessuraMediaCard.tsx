
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { EspessuraMediaInfo } from "@/hooks/registro-aplicacao/useEspessuraMedia";

interface EspessuraMediaCardProps {
  espessuraInfo: EspessuraMediaInfo;
  isReadOnly?: boolean;
}

const EspessuraMediaCard: React.FC<EspessuraMediaCardProps> = ({
  espessuraInfo,
  isReadOnly = false
}) => {
  const { espessuraMedia, numeroAplicacoes, statusEspessura, descricaoStatus } = espessuraInfo;

  // Definir classes de estilo baseadas no status
  const getStatusStyles = () => {
    switch (statusEspessura) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-amber-100 text-amber-800',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          badgeVariant: 'destructive' as const,
          badgeClass: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4 text-red-600" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          badgeVariant: 'outline' as const,
          badgeClass: 'bg-gray-100 text-gray-800',
          icon: <Calculator className="h-4 w-4 text-gray-600" />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card className={`${styles.bgColor} ${styles.borderColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {styles.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Espessura Média
                </span>
                {isReadOnly && (
                  <Badge variant="outline" className="text-xs">
                    Finalizada
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${styles.textColor}`}>
                  {espessuraMedia} cm
                </span>
                <Badge className={styles.badgeClass}>
                  {descricaoStatus}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Aplicações
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {numeroAplicacoes}
            </div>
          </div>
        </div>
        
        {numeroAplicacoes > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Cálculo: {numeroAplicacoes} aplicações consideradas na média
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EspessuraMediaCard;
