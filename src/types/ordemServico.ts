
export interface OrdemServico {
  id: string;
  chamado_id: string;
  numero_chamado: string;
  data_solicitacao: string;
  hora_solicitacao: string;
  solicitante_id: string;
  centro_custo_id: string;
  caminhao_equipamento_id: string;
  tipo_falha: 'Mecânica' | 'Elétrica' | 'Hidráulica' | 'Pneus' | 'Manutenção' | 'Outras';
  descricao_problema?: string;
  fotos_avarias?: string[];
  anotacoes_internas?: string;
  tratativa?: string;
  horimetro_km?: number;
  prioridade: 'Emergencial' | 'Alta' | 'Média' | 'Baixa';
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  
  // Balanceamento do atendimento
  data_inicio_atendimento?: string;
  hora_inicio_atendimento?: string;
  data_fim_atendimento?: string;
  hora_fim_atendimento?: string;
  horimetro_km_inicial?: number;
  horimetro_km_final?: number;
  duracao_servico?: string;
  executado_por_id?: string;
  setor?: string;
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

export interface Material {
  id: string;
  os_id: string;
  quantidade: number;
  descricao_material: string;
  valor_unitario: number;
  valor_total: number;
  created_at?: string;
  updated_at?: string;
}

export interface MaoDeObra {
  id: string;
  os_id: string;
  quantidade: number;
  funcao: string;
  valor_unitario: number;
  valor_total: number;
  created_at?: string;
  updated_at?: string;
}

export interface Movimentacao {
  id: string;
  os_id: string;
  data_movimentacao: string;
  hora_movimentacao: string;
  usuario_id: string;
  motivo: string;
  created_at?: string;
  usuario?: {
    email: string;
    nome_completo?: string;
  };
}

export interface OsFilterParams {
  numero_chamado?: string;
  caminhao_equipamento_id?: string;
  data_inicio?: string;
  data_fim?: string;
  prioridade?: string;
  status?: string;
}
