
export interface ListaProgramacaoEntrega {
  id: string;
  programacao_entrega_id: string;
  programacao_id?: string;
  logradouro: string;
  bairro?: string;
  data_entrega: string;
  quantidade_massa: number;
  caminhao_id: string;
  usina_id: string;
  apontador_id: string;
  equipe_id: string;
  tipo_lancamento: string;
  status: string;
  requisicao_id: string;
  centro_custo_nome?: string;
  created_at?: string;
  updated_at?: string;
  cancelled?: boolean;
  
  // Calculated fields
  massa_remanescente?: number;
  massa_total_carga?: number;
  massa_aplicada_total?: number;
  
  // Relations (populated by Supabase joins)
  caminhao?: {
    id: string;
    placa?: string;
    modelo?: string;
    frota?: string;
    numero_frota?: string;
  };
  equipe?: {
    id: string;
    nome_equipe: string;
    apontador?: {
      id: string;
      nome_completo: string;
    };
  };
  usina?: {
    id: string;
    nome_usina: string;
  };
  centro_custo?: {
    id: string;
    codigo_centro_custo?: string;
    nome_centro_custo: string;
  };
  requisicao?: {
    id: string;
    numero: string;
    centro_custo?: {
      id: string;
      codigo_centro_custo?: string;
      nome_centro_custo: string;
    };
  };
}

// Base programacao entrega type
export interface ProgramacaoEntrega {
  id: string;
  requisicao_id: string;
  centro_custo_id: string;
  data_entrega: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  requisicao?: {
    id: string;
    numero: string;
  };
  centro_custo?: {
    id: string;
    codigo_centro_custo: string;
    nome_centro_custo: string;
  };
}

// Extended programacao with items
export interface ProgramacaoEntregaWithItems extends ProgramacaoEntrega {
  itens?: ListaProgramacaoEntrega[];
}

// Filter interface
export interface ProgramacaoEntregaFilters {
  numero_requisicao?: string;
  centro_custo_id?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

// Item form values for programacao entrega - updated to make logradouro optional for programming phase
export interface ItemFormValues {
  id?: string;
  requisicao_id?: string;
  logradouro?: string; // Optional during programming phase - will be filled during application
  bairro?: string;
  quantidade_massa: number;
  caminhao_id: string;
  usina_id: string;
  apontador_id: string;
  equipe_id: string;
  tipo_lancamento: string;
  status?: string;
  centro_custo_nome: string; // Required field for programming phase
  cancelled?: boolean;
  data_entrega?: string;
}
