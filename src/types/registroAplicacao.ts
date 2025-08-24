

export interface RegistroAplicacao {
  id: string;
  lista_entrega_id: string;
  registro_carga_id: string;
  logradouro_id?: string;
  logradouro_aplicado?: string;
  data_aplicacao: string;
  hora_chegada_local: string;
  temperatura_chegada?: number | null;
  hora_aplicacao?: string;
  temperatura_aplicacao?: number | null;
  bordo?: BordoType;
  estaca_inicial?: number | null;
  comprimento?: number | null;
  largura_media?: number | null;
  area_calculada?: number | null;
  area?: number | null; // Alternative field name for area
  tonelada_aplicada?: number | null;
  espessura?: number | null;
  espessura_calculada?: number | null; // Add missing espessura_calculada field
  hora_saida_caminhao?: string;
  estaca_final?: number | null;
  anotacoes_apontador?: string | null;
  usar_massa_total_para_espessura?: boolean;
  aplicacao_sequencia?: number;
  media_espessura_cm?: number | null;
  carga_finalizada?: boolean;
  massa_remanescente_antes_aplicacao?: number | null;
  carga_origem_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Add nested objects that components expect - now with all required properties
  lista_entrega?: {
    id: string;
    programacao_entrega_id: string;
    requisicao_id: string;
    usina_id: string;
    apontador_id: string;
    equipe_id: string;
    caminhao_id: string;
    data_entrega: string;
    logradouro: string;
    quantidade_massa: number;
    tipo_lancamento: string;
    status: string;
    programacao_id?: string;
    massa_remanescente?: number;
    created_at?: string;
    updated_at?: string;
    cancelled?: boolean;
    centro_custo_nome?: string;
    centro_custo?: {
      id: string;
      nome_centro_custo: string;
    };
    requisicao?: {
      id: string;
      numero: string;
      centro_custo_id: string;
      centro_custo?: {
        id: string;
        nome_centro_custo: string;
      };
    };
    caminhao?: {
      id: string;
      placa: string;
      modelo: string;
      marca?: string;
    };
    equipe?: {
      id: string;
      nome_equipe: string;
    };
    apontador?: {
      id: string;
      nome_completo: string;
    };
    usina?: {
      id: string;
      nome_usina: string;
    };
  };
  
  registro_carga?: {
    id: string;
    lista_entrega_id: string;
    programacao_id: string;
    data_saida: string;
    hora_saida: string;
    temperatura_saida?: number;
    tonelada_saida: number;
    imagem_ticket_saida: string;
    tonelada_retorno?: number;
    imagem_ticket_retorno?: string;
    tonelada_real: number;
    status_registro: 'Ativo' | 'Cancelado' | 'Concluído';
  };
}

export interface RegistroAplicacaoFilters {
  centro_custo_id?: string;
  caminhao_id?: string;
  data_inicio?: Date;
  status?: string;
}

export type BordoType = "Direito" | "Esquerdo" | "Centro" | "Único" | "Embocadura";

// Re-export for backward compatibility
export type { RegistroAplicacao as RegistroAplicacaoDetalhes };

// Add the missing RegistroAplicacaoFormValues type with espessura_calculada
export interface RegistroAplicacaoFormValues {
  lista_entrega_id: string;
  registro_carga_id: string;
  logradouro_id?: string;
  logradouro_aplicado?: string;
  data_aplicacao: string;
  hora_chegada_local: string;
  temperatura_chegada?: number | null;
  hora_aplicacao?: string;
  temperatura_aplicacao?: number | null;
  bordo?: BordoType;
  estaca_inicial?: number | null;
  comprimento?: number | null;
  largura_media?: number | null;
  area_calculada?: number | null;
  tonelada_aplicada?: number | null;
  espessura?: number | null;
  espessura_calculada?: number | null; // Add missing field
  hora_saida_caminhao?: string;
  estaca_final?: number | null;
  anotacoes_apontador?: string | null;
  usar_massa_total_para_espessura?: boolean;
  aplicacao_sequencia?: number;
  media_espessura_cm?: number | null;
  carga_finalizada?: boolean;
  massa_remanescente_antes_aplicacao?: number | null;
  carga_origem_id?: string;
}

