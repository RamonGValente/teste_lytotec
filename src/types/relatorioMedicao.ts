
export interface BaseVehicleReportData {
  id: string;
  label: string;
  tipo_veiculo: string;
  centro_custo: string;
  diasTrabalhados: number;
  totalMensal: number;
  abastecimento: number;
  mediaAbastecimento: number;
  rastreador: number;
}

export interface EquipmentReportData extends BaseVehicleReportData {
  quantidadeHoras: number; // 200 horas fixas
  valorUnitarioHora: number; // R$/h
  horasDisponiveis: number; // Horas efetivas - manutenção
  valorPeriodo: number; // Horas disponíveis * valor unitário
  produtividade: number; // Horas trabalhadas
}

export interface TruckReportData extends BaseVehicleReportData {
  qtdDia: number; // Dias trabalhados
  valor: number; // Valor proporcional
  quilometragem: number; // Km do período
}

export interface DescontoData {
  tipoDesconto: string;
  valorUnitario: number;
  qtdHoras?: number; // Para equipamentos
  qtdDias?: number; // Para caminhões
  valor: number;
}

export interface ManutencaoEquipmentData {
  valorUnitario: number;
  qtdHoras: number;
  valor: number;
  descontos: DescontoData[];
}

export interface ManutencaoTruckData {
  valorUnitario: number; // Valor diário (aluguel_mensal / 30)
  qtdDias: number; // Total de dias descontados
  valor: number; // Total dos descontos
  descontos: DescontoData[]; // Array de descontos
}
