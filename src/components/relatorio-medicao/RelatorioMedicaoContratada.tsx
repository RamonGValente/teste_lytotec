
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RelatorioMedicaoContratadaProps {
  obra: string;
}

const RelatorioMedicaoContratada: React.FC<RelatorioMedicaoContratadaProps> = ({
  obra
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Contratada:</label>
            <div className="text-lg font-semibold">ABRA INFRAESTRUTURA</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Obra:</label>
            <div className="text-lg font-semibold">{obra}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoContratada;
