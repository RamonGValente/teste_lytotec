
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface RelatorioMedicaoTotalPeriodoProps {
  totalServicos: number;
  totalDescontos: number;
}

const RelatorioMedicaoTotalPeriodo: React.FC<RelatorioMedicaoTotalPeriodoProps> = ({
  totalServicos,
  totalDescontos
}) => {
  const totalFinal = totalServicos - totalDescontos;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">TOTAL NO PERÍODO</h3>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalFinal)}
          </div>
          {totalDescontos > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              Serviços: {formatCurrency(totalServicos)} - Descontos: {formatCurrency(totalDescontos)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoTotalPeriodo;
