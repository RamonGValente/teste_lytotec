
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const RelatorioMedicaoAssinaturas: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <div className="border-b-2 border-gray-300 mb-2 h-16"></div>
            <p className="font-semibold">Medição e Controle</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-300 mb-2 h-16"></div>
            <p className="font-semibold">Gestor de Contratos</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-gray-300 mb-2 h-16"></div>
            <p className="font-semibold">Contratada</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoAssinaturas;
