
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ServicoData {
  descricao: string;
  totalMensal: number;
  qtdDia: number;
  valor: number;
  produtividade: number;
  abastecimento: number;
  mediaAbast: number;
  rastreador: number;
}

interface RelatorioMedicaoTabelaServicosProps {
  servicos: ServicoData[];
  onTotaisCalculados: (totais: any) => void;
}

const RelatorioMedicaoTabelaServicos: React.FC<RelatorioMedicaoTabelaServicosProps> = ({
  servicos,
  onTotaisCalculados
}) => {
  // Calcular totais
  const totais = React.useMemo(() => {
    const totalQtdDia = servicos.reduce((acc, item) => acc + item.qtdDia, 0);
    const totalProdutividade = servicos.reduce((acc, item) => acc + item.produtividade, 0);
    const totalAbastecimento = servicos.reduce((acc, item) => acc + item.abastecimento, 0);
    const totalRastreador = servicos.reduce((acc, item) => acc + item.rastreador, 0);
    const totalValor = servicos.reduce((acc, item) => acc + item.valor, 0);
    
    return {
      qtdDia: totalQtdDia,
      produtividade: totalProdutividade,
      abastecimento: totalAbastecimento,
      rastreador: totalRastreador,
      valor: totalValor
    };
  }, [servicos]);

  React.useEffect(() => {
    onTotaisCalculados(totais);
  }, [totais, onTotaisCalculados]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">1. DESCRIÇÃO DOS SERVIÇOS</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-center">DESCRIÇÃO DOS SERVIÇOS</TableHead>
                <TableHead className="font-bold text-center">TOTAL MENSAL (R$)</TableHead>
                <TableHead className="font-bold text-center">QTD/DIA</TableHead>
                <TableHead className="font-bold text-center">VALOR (R$)</TableHead>
                <TableHead className="font-bold text-center">PRODUTIVIDADE</TableHead>
                <TableHead className="font-bold text-center">ABASTECIMENTO</TableHead>
                <TableHead className="font-bold text-center">MÉDIA ABAST.</TableHead>
                <TableHead className="font-bold text-center">RASTREADOR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicos.map((servico, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{servico.descricao}</TableCell>
                  <TableCell className="text-right">{formatCurrency(servico.totalMensal)}</TableCell>
                  <TableCell className="text-center">{servico.qtdDia}</TableCell>
                  <TableCell className="text-right">{formatCurrency(servico.valor)}</TableCell>
                  <TableCell className="text-center">{formatNumber(servico.produtividade)}</TableCell>
                  <TableCell className="text-center">{formatNumber(servico.abastecimento)}</TableCell>
                  <TableCell className="text-center">{formatNumber(servico.mediaAbast)}</TableCell>
                  <TableCell className="text-center">{formatNumber(servico.rastreador)}</TableCell>
                </TableRow>
              ))}
              {/* Linha de totais */}
              <TableRow className="bg-gray-100 font-bold">
                <TableCell>TOTAIS</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-center">{totais.qtdDia}</TableCell>
                <TableCell className="text-right">{formatCurrency(totais.valor)}</TableCell>
                <TableCell className="text-center">{formatNumber(totais.produtividade)}</TableCell>
                <TableCell className="text-center">{formatNumber(totais.abastecimento)}</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">{formatNumber(totais.rastreador)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoTabelaServicos;
