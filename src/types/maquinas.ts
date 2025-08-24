// Existing types - keeping all the original functionality
export interface MaquinasKpis {
  totalAtivos: number;
  ativosOperando: number;
  ativosDisponiveis: number;
  ativosManutencao: number;
  chamadosAbertos: number;
  tempoMedioReparo: number;
}

export interface TipoVeiculoDistribution {
  tipo: string;
  quantidade: number;
  percentual: number;
  capacidadeTotal: number;
  valorLocacaoTotal: number;
}

export interface StatusOperacionalData {
  status: string;
  quantidade: number;
  ativos: Array<{
    id: string;
    frota: string;
    numero_frota: string;
    tipo_veiculo: string;
    modelo?: string;
  }>;
}

export interface IdadeFrotaData {
  faixaIdade: string;
  quantidade: number;
  ativos: Array<{
    id: string;
    frota: string;
    numero_frota: string;
    tipo_veiculo: string;
    ano_fabricacao: string;
    modelo?: string;
  }>;
}

export interface UtilizacaoData {
  data: string;
  horasOperacao: number;
  combustivel: number;
  km: number;
}

export interface CentroCustoUtilizacao {
  centroCusto: string;
  totalHoras: number;
  totalKm: number;
  totalCombustivel: number;
  percentualHoras: number;
  percentualCombustivel: number;
}

export interface EquipamentosPorCentroCusto {
  centroCusto: string;
  caminhoes: Array<{
    id: string;
    frota: string;
    numero_frota: string;
    operador: string;
    horaInicio?: string;
    horaFim?: string;
    situacao: string;
  }>;
  equipamentos: Array<{
    id: string;
    frota: string;
    numero_frota: string;
    operador: string;
    horaInicio?: string;
    horaFim?: string;
    situacao: string;
  }>;
  totalCaminhoes: number;
  totalEquipamentos: number;
}

export interface ChamadosPorStatus {
  status: string;
  prioridade: string;
  quantidade: number;
}

export interface ManutencaoTipoFalha {
  tipoFalha: string;
  quantidade: number;
  custoEstimado: number;
  percentual: number;
}

export interface CustoLocacao {
  valorTotal: number;
  totalDescontos: number;
  valorLiquido: number;
  diasManutencao: number;
  horasManutencao: number;
}

export interface CaminhoesProgramados {
  id: string;
  frota: string;
  numero_frota: string;
  placa: string;
  data_entrega: string;
  status: string;
}

// New type for grouped trucks by cost center
export interface CaminhoesPorCentroCusto {
  codigoCentroCusto: string;
  nomeCentroCusto: string;
  caminhoes: CaminhoesProgramados[];
  totalCaminhoes: number;
}

export interface DistribuicaoCentroCusto {
  centroCusto: string;
  nomeCompleto: string;
  quantidade: number;
  percentual: number;
  veiculos: Array<{
    id: string;
    frota: string;
    numero_frota: string;
    tipo_veiculo: string;
  }>;
}

export interface MaquinasFilters {
  periodStart: string;
  periodEnd: string;
  tipoVeiculo?: string[];
  empresaId?: string;
  centroCustoId?: string;
  ativoEspecifico?: string;
  dataInicioPlanejamanento?: string;
  dataFimPlanejamento?: string;
}

export interface AtivoBasico {
  id: string;
  frota: string;
  numero_frota: string;
  tipo_veiculo: string;
}
