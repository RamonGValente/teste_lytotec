
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Info, ArrowRight } from "lucide-react";

const RelatorioMedicaoPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">
                Relatório de Medição
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Selecione um tipo de veículo e identificação nos filtros acima para gerar o relatório detalhado.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left space-y-2">
                  <p className="text-sm font-medium text-blue-800">
                    Como gerar o relatório:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <span>Selecione o tipo de veículo</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <span>Escolha a identificação do veículo</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <span>Ajuste o período se necessário</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <span>Clique em "Gerar Relatório"</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioMedicaoPlaceholder;
