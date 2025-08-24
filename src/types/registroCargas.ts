
export interface RegistroCarga {
  id: string;
  programacao_id: string;
  lista_entrega_id: string;
  data_saida: string;
  hora_saida: string;
  hora_chegada?: string;
  tonelada_saida: number;
  tonelada_retorno?: number;
  tonelada_real?: number;
  tonelada_prevista?: number;
  temperatura_saida?: number;
  imagem_ticket_saida: string;
  imagem_ticket_retorno?: string;
  status_registro?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  caminhao?: {
    id: string;
    frota?: string;
    numero_frota?: string;
    placa?: string;
    modelo?: string;
  };
  motorista?: {
    id: string;
    nome_completo: string;
  };
  lista_entrega?: {
    id: string;
    logradouro: string;
    bairro?: string;
    quantidade_massa: number;
  };
}

// Form values interface
export interface RegistroCargaFormValues {
  data_saida?: string;
  temperatura_saida?: number;
  tonelada_saida?: number;
  tonelada_retorno?: number;
  hora_saida?: string;
  lista_entrega_id?: string;
  imagem_ticket_saida?: any;
  imagem_ticket_retorno?: any;
  programacao_id?: string;
  status_registro?: "Ativo" | "Concluído" | "Cancelado";
}

// Filter interface
export interface RegistroCargaFilters {
  data_inicio?: Date;
  data_fim?: Date;
  centro_custo_id?: string;
  caminhao_id?: string;
  status?: string;
  logradouro?: string;
}
