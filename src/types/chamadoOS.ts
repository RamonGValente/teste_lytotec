
export interface ChamadoOS {
  id: string;
  numero_chamado: string;
  data_solicitacao: string;
  hora_solicitacao: string;
  solicitante_id: string;
  centro_custo_id: string;
  caminhao_equipamento_id: string;
  descricao_problema?: string;
  tipo_falha: 'Mecânica' | 'Elétrica' | 'Hidráulica' | 'Pneus' | 'Manutenção' | 'Outras';
  prioridade: 'Emergencial' | 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Convertido para OS' | 'OS em Andamento' | 'Concluído';
  fotos_avarias?: string[];
  created_at?: string;
  updated_at?: string;
  
  // Related data populated via joins
  centro_custo?: {
    codigo_centro_custo: string;
    nome_centro_custo: string;
  };
  caminhao_equipamento?: {
    placa: string;
    tipo_veiculo: string;
    marca: string;
    modelo: string;
  };
  solicitante?: {
    email: string;
    nome_completo?: string;
  };
}

export interface OrdemServico {
  id: string;
  numero_chamado: string;
  data_solicitacao: string;
  hora_solicitacao: string;
  solicitante_id: string;
  centro_custo_id: string;
  caminhao_equipamento_id: string;
  descricao_problema?: string;
  prioridade: 'Emergencial' | 'Alta' | 'Média' | 'Baixa';
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  tipo_falha: 'Mecânica' | 'Elétrica' | 'Hidráulica' | 'Pneus' | 'Manutenção' | 'Outras';
  fotos_avarias?: string[];
  anotacoes_internas?: string;
  tratativa?: string;
  horimetro_km?: number;
  setor?: string;
  
  // Balanceamento do atendimento
  data_inicio_atendimento?: string;
  hora_inicio_atendimento?: string;
  data_fim_atendimento?: string;
  hora_fim_atendimento?: string;
  horimetro_km_inicial?: number;
  horimetro_km_final?: number;
  duracao_servico?: string;
  executado_por_id?: string;
  encerrado_por_id?: string;
  
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  caminhao_equipamento?: {
    placa: string;
    tipo_veiculo: string;
    marca: string;
    modelo: string;
  };
  centro_custo?: {
    codigo_centro_custo: string;
    nome_centro_custo: string;
  };
  solicitante?: {
    email: string;
    nome_completo?: string;
  };
  executado_por?: {
    email: string;
    nome_completo?: string;
  };
  encerrado_por?: {
    email: string;
    nome_completo?: string;
  };
}

export interface ChamadoFormValues {
  centro_custo_id: string;
  caminhao_equipamento_id: string;
  descricao_problema: string;
  tipo_falha: 'Mecânica' | 'Elétrica' | 'Hidráulica' | 'Pneus' | 'Outras';
  prioridade: 'Emergencial' | 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Convertido para OS' | 'OS em Andamento' | 'Concluído';
}

export interface ChamadoFilterParams {
  numero_chamado?: string;
  caminhao_equipamento_id?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
}
