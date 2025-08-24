
import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EquipmentReportData, TruckReportData, ManutencaoEquipmentData, ManutencaoTruckData } from "@/types/relatorioMedicao";

interface RelatorioMedicaoDetalhadoProps {
  vehicleData: (EquipmentReportData | TruckReportData)[];
  dateRange: {
    from: Date;
    to: Date;
  };
  manutencaoData?: ManutencaoEquipmentData | ManutencaoTruckData | null;
  tipoVeiculo: "Caminhão" | "Equipamento";
}

const RelatorioMedicaoDetalhado: React.FC<RelatorioMedicaoDetalhadoProps> = ({
  vehicleData,
  dateRange,
  manutencaoData,
  tipoVeiculo
}) => {
  const [observacoes, setObservacoes] = useState("");
  const [rastreadorValues, setRastreadorValues] = useState<Record<string, number>>(() => {
    const initialValues: Record<string, number> = {};
    vehicleData.forEach(vehicle => {
      initialValues[vehicle.id] = 0; // Sempre iniciar com 0
    });
    return initialValues;
  });

  const mesReferencia = format(dateRange.from, 'MMMM', {
    locale: ptBR
  }).toUpperCase();

  const periodo = `${format(dateRange.from, 'dd/MM/yyyy')} à ${format(dateRange.to, 'dd/MM/yyyy')}`;

  const obra = [...new Set(vehicleData.map(v => v.centro_custo))].join('/');

  const handleRastreadorChange = useCallback((id: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setRastreadorValues(prev => ({
      ...prev,
      [id]: numericValue
    }));
  }, []);

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  };

  const formatNumber = (value: number | undefined | null, decimals: number = 2) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return safeValue.toFixed(decimals);
  };

  // Calcular total do período SEM subtrair descontos - apenas soma dos serviços
  const calculateTotalPeriodo = () => {
    console.log('calculateTotalPeriodo - tipoVeiculo:', tipoVeiculo);
    console.log('calculateTotalPeriodo - vehicleData:', vehicleData);
    
    if (tipoVeiculo === "Equipamento") {
      const equipmentData = vehicleData as EquipmentReportData[];
      const totalServicos = equipmentData.reduce((acc, item) => {
        const valor = item.valorPeriodo || 0;
        console.log(`Equipamento ${item.id}: valor=${valor}`);
        return acc + valor;
      }, 0);
      
      console.log('Equipamentos - totalServicos (SEM descontos):', totalServicos);
      return totalServicos;
    } else {
      const truckData = vehicleData as TruckReportData[];
      const totalServicos = truckData.reduce((acc, item) => {
        const valor = item.valor || 0;
        console.log(`Caminhão ${item.id}: valor=${valor}`);
        return acc + valor;
      }, 0);
      
      console.log('Caminhões - totalServicos (SEM descontos):', totalServicos);
      return totalServicos;
    }
  };

  // Renderizar tabela para Equipamento
  const renderEquipmentTable = () => {
    const equipmentData = vehicleData as EquipmentReportData[];
    
    // Calcular totais conforme mostrado na imagem
    const totais = {
      totalMensal: equipmentData.reduce((acc, item) => acc + (item.totalMensal || 0), 0),
      valorPeriodo: equipmentData.reduce((acc, item) => acc + (item.valorPeriodo || 0), 0),
      horasDisponiveis: equipmentData.reduce((acc, item) => acc + (item.horasDisponiveis || 0), 0),
      produtividade: equipmentData.reduce((acc, item) => acc + (item.produtividade || 0), 0),
      abastecimento: equipmentData.reduce((acc, item) => acc + (item.abastecimento || 0), 0),
      rastreador: Object.values(rastreadorValues).reduce((acc, value) => acc + (value || 0), 0)
    };

    return (
      <table className="w-full text-sm border border-gray-300 print:text-base">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3" rowSpan={2}>DESCRIÇÃO DOS SERVIÇOS</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-center" colSpan={3}>CONTRATO</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-center" colSpan={6}>NO PERÍODO</th>
          </tr>
          <tr className="text-left">
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QUANTIDADE (HORAS)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR UNIT. (R$/h)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TOTAL MENSAL (R$)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">HORAS DISPONÍVEIS</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">PRODUTIVIDADE</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">ABASTECIMENTO</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">MÉDIA ABAST.</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">RASTREADOR</th>
          </tr>
        </thead>
        <tbody>
          {equipmentData.map((item, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{item.label}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{item.quantidadeHoras || 0} H</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(item.valorUnitarioHora)}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(item.totalMensal)}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.horasDisponiveis)} H</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(item.valorPeriodo)}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.produtividade)} H</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.abastecimento)} L</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.mediaAbastecimento)} L/H</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">
                <input
                  type="number"
                  step="0.01"
                  value={rastreadorValues[item.id] || 0}
                  onChange={e => handleRastreadorChange(item.id, e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-right print:text-base"
                  style={{ minWidth: '60px' }}
                />
              </td>
            </tr>
          ))}
          {/* Linha de totais SEM o total mensal */}
          <tr className="font-bold bg-gray-50">
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-right">TOTAIS</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.horasDisponiveis)} H</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(totais.valorPeriodo)}</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.produtividade)} H</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.abastecimento)} L</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.rastreador)} H</td>
          </tr>
        </tbody>
      </table>
    );
  };

  // Renderizar tabela para Caminhão 
  const renderTruckTable = () => {
    const truckData = vehicleData as TruckReportData[];
    
    // Calcular totais conforme necessário para caminhões
    const totais = {
      totalMensal: truckData.reduce((acc, item) => acc + (item.totalMensal || 0), 0),
      qtdDia: truckData.reduce((acc, item) => acc + (item.qtdDia || 0), 0),
      valor: truckData.reduce((acc, item) => acc + (item.valor || 0), 0),
      quilometragem: truckData.reduce((acc, item) => acc + (item.quilometragem || 0), 0),
      abastecimento: truckData.reduce((acc, item) => acc + (item.abastecimento || 0), 0),
      rastreador: Object.values(rastreadorValues).reduce((acc, value) => acc + (value || 0), 0)
    };

    // Debug para caminhões
    console.log('renderTruckTable - truckData:', truckData);
    console.log('renderTruckTable - totais:', totais);

    return (
      <table className="w-full text-sm border border-gray-300 print:text-base">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">DESCRIÇÃO DOS SERVIÇOS</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TOTAL MENSAL (R$)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QTD/DIA</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">PRODUTIVIDADE</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">ABASTECIMENTO</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">MÉDIA ARAST.</th>
            <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">RASTREADOR</th>
          </tr>
        </thead>
        <tbody>
          {truckData.map((item, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{item.label}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(item.totalMensal)}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{item.qtdDia || 0}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(item.valor)}</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.quilometragem)} km</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.abastecimento)} L</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(item.mediaAbastecimento)} L/KM</td>
              <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">
                <input
                  type="number"
                  step="0.01"
                  value={rastreadorValues[item.id] || 0}
                  onChange={e => handleRastreadorChange(item.id, e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-right print:text-base"
                  style={{ minWidth: '60px' }}
                />
              </td>
            </tr>
          ))}
          {/* Linha de totais SEM o total mensal */}
          <tr className="font-bold bg-gray-50">
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-right">TOTAIS</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{totais.qtdDia}</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(totais.valor)}</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.quilometragem)} km</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.abastecimento)} L</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
            <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(totais.rastreador)} km</td>
          </tr>
        </tbody>
      </table>
    );
  };

  // Renderizar seção de descontos - ATUALIZADO para múltiplos descontos
  const renderDescontos = () => {
    if (tipoVeiculo === "Equipamento") {
      const equipmentMaintenance = manutencaoData as ManutencaoEquipmentData;
      
      // Se não há dados de manutenção ou descontos, mostrar valores zerados
      if (!equipmentMaintenance || !equipmentMaintenance.descontos || equipmentMaintenance.descontos.length === 0) {
        return (
          <table className="w-full text-sm border border-gray-300 print:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TIPO DE DESCONTO</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR UNIT. (R$)</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QTD/H</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">NENHUM DESCONTO APLICÁVEL</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(0)}</td>
              </tr>
            </tbody>
          </table>
        );
      }
      
      return (
        <table className="w-full text-sm border border-gray-300 print:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TIPO DE DESCONTO</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR UNIT. (R$)</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QTD/H</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
            </tr>
          </thead>
          <tbody>
            {equipmentMaintenance.descontos.map((desconto, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 font-medium">{desconto.tipoDesconto}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(desconto.valorUnitario)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(desconto.qtdHoras || 0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(desconto.valor)}</td>
              </tr>
            ))}
            {equipmentMaintenance.descontos.length > 1 && (
              <tr className="font-bold bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-right">TOTAL DESCONTOS</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(equipmentMaintenance.qtdHoras)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(equipmentMaintenance.valor)}</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    } else {
      // Lógica para caminhões com múltiplos descontos
      const truckMaintenance = manutencaoData as ManutencaoTruckData;
      
      // Se não há dados de manutenção ou descontos, mostrar valores zerados
      if (!truckMaintenance || !truckMaintenance.descontos || truckMaintenance.descontos.length === 0) {
        return (
          <table className="w-full text-sm border border-gray-300 print:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TIPO DE DESCONTO</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR UNIT. (R$)</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QTD/DIA</th>
                <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">NENHUM DESCONTO APLICÁVEL</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(0)}</td>
              </tr>
            </tbody>
          </table>
        );
      }
      
      return (
        <table className="w-full text-sm border border-gray-300 print:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">TIPO DE DESCONTO</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR UNIT. (R$)</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">QTD/DIA</th>
              <th className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">VALOR (R$)</th>
            </tr>
          </thead>
          <tbody>
            {truckMaintenance.descontos.map((desconto, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 font-medium">{desconto.tipoDesconto}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(desconto.valorUnitario)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(desconto.qtdDias || 0)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(desconto.valor)}</td>
              </tr>
            ))}
            {truckMaintenance.descontos.length > 1 && (
              <tr className="font-bold bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3 text-right">TOTAL DESCONTOS</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">-</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatNumber(truckMaintenance.qtdDias)}</td>
                <td className="border border-gray-300 px-3 py-2 print:px-4 print:py-3">{formatCurrency(truckMaintenance.valor)}</td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div id="relatorio-medicao-detalhado" className="px-8 py-6 space-y-6 bg-white print:p-6 print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between print:mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 flex items-center justify-center print:w-16 print:h-16">
            <img 
              src="/lovable-uploads/dcf6c980-f927-4180-b109-b425da1323ba.png" 
              alt="Lytorânea Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-base font-medium print:text-black print:text-lg">CONSTRUTORA LYTORÂNEA</p>
            <h2 className="text-2xl font-bold print:text-black print:text-3xl">RELATÓRIO DE MEDIÇÃO</h2>
          </div>
        </div>
        <div className="text-right space-y-2 text-base print:text-black print:text-lg">
          <p><strong>PM nº:</strong> 9</p>
          <p><strong>Mês de Referência:</strong> {mesReferencia}</p>
          <p><strong>Período:</strong> {periodo}</p>
        </div>
      </div>

      {/* Contratada e Obra */}
      <div className="grid grid-cols-2 gap-6 text-base print:text-black print:mb-6 print:text-lg">
        <p><strong>CONTRATADA:</strong> ABRA INFRAESTRUTURA</p>
        <p><strong>OBRA:</strong> {obra}</p>
      </div>

      {/* Tabela de Serviços Dinâmica */}
      <div className="overflow-auto print:overflow-visible">
        <h3 className="text-base font-bold mb-3 print:text-black print:text-lg">1. DESCRIÇÃO DOS SERVIÇOS</h3>
        {tipoVeiculo === "Equipamento" ? renderEquipmentTable() : renderTruckTable()}
      </div>

      {/* Tabela de Descontos - ATUALIZADA para múltiplos descontos */}
      <div className="text-base print:mb-6">
        <p className="font-bold mb-3 print:text-black print:text-lg">2. DESCONTOS/ACRÉSCIMOS</p>
        <p className="font-semibold mb-2 text-sm print:text-black print:text-base">2.1 DESCONTOS APLICÁVEIS</p>
        {renderDescontos()}
      </div>

      {/* Observações */}
      <div className="print:mb-6">
        <label className="block text-base font-bold mb-2 print:text-black print:text-lg">Observações:</label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-base print:border print:border-gray-400 print:min-h-[80px] print:text-base"
          rows={4}
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          placeholder="Digite suas observações aqui..."
        />
      </div>

      {/* Total do Período mostra apenas soma dos serviços (SEM descontos) */}
      <div className="text-center text-xl font-bold print:text-black print:mb-8 print:text-2xl">
        <p>TOTAL NO PERÍODO: {formatCurrency(calculateTotalPeriodo())}</p>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-3 gap-6 text-center text-base pt-8 border-t mt-8 print:border-t print:border-gray-400 print:pt-10 print:text-lg">
        <div>
          <div className="h-16 border-b border-gray-400 w-3/4 mx-auto mt-3 mb-3 print:border-b print:border-gray-400 print:h-20" />
          <p className="font-semibold print:text-black">Medição e Controle</p>
        </div>
        <div>
          <div className="h-16 border-b border-gray-400 w-3/4 mx-auto mt-3 mb-3 print:border-b print:border-gray-400 print:h-20" />
          <p className="font-semibold print:text-black">Gestor de Contratos</p>
        </div>
        <div>
          <div className="h-16 border-b border-gray-400 w-3/4 mx-auto mt-3 mb-3 print:border-b print:border-gray-400 print:h-20" />
          <p className="font-semibold print:text-black">Contratada</p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioMedicaoDetalhado;
