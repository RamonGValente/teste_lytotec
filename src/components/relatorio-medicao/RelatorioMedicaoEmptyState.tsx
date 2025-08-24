
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calendar, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RelatorioMedicaoEmptyStateProps {
  vehicleName?: string;
  periodo?: string;
  onTryDifferentPeriod: () => void;
}

const RelatorioMedicaoEmptyState: React.FC<RelatorioMedicaoEmptyStateProps> = ({
  vehicleName,
  periodo,
  onTryDifferentPeriod
}) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-orange-800">
              Nenhum dado encontrado
            </h3>
            <p className="text-orange-700">
              Não foram encontrados registros para o veículo selecionado no período especificado.
            </p>
          </div>
          
          {vehicleName && (
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Veículo:</span>
                  <span>{vehicleName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Período:</span>
                  <span>{periodo}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm text-orange-600">
              Sugestões:
            </p>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Verifique se existem apontamentos para este veículo</li>
              <li>• Tente um período diferente com mais dados</li>
              <li>• Confirme se o veículo estava ativo no período</li>
            </ul>
            
            <Button 
              variant="outline" 
              onClick={onTryDifferentPeriod}
              className="mt-4"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Tentar período diferente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoEmptyState;
