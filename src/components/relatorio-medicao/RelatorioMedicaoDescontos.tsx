
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DescontoData {
  valorMensal: number;
  qtdDia: number;
  valor: number;
}

interface RelatorioMedicaoDescontosProps {
  desconto?: DescontoData;
  onDescontoCalculado: (valor: number) => void;
}

const RelatorioMedicaoDescontos: React.FC<RelatorioMedicaoDescontosProps> = ({
  desconto,
  onDescontoCalculado
}) => {
  React.useEffect(() => {
    onDescontoCalculado(desconto?.valor || 0);
  }, [desconto, onDescontoCalculado]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!desconto || desconto.valor === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">2. DESCONTOS/ACRÉSCIMOS</h3>
        <h4 className="text-md font-semibold mb-3">2.1 DESCONTO DE MANUTENÇÃO</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-center">VALOR MENSAL</TableHead>
                <TableHead className="font-bold text-center">QTD/DIA</TableHead>
                <TableHead className="font-bold text-center">VALOR (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-right">{formatCurrency(desconto.valorMensal)}</TableCell>
                <TableCell className="text-center">{desconto.qtdDia}</TableCell>
                <TableCell className="text-right">{formatCurrency(desconto.valor)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoDescontos;
