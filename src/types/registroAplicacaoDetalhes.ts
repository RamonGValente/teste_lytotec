
export interface RegistroAplicacaoDetalhes {
  id: string;
  registro_aplicacao_id: string;
  lista_entrega_id: string;
  registro_carga_id: string;
  
  // Dados do logradouro específico
  logradouro_id?: string;
  logradouro_nome: string;
  sequencia_aplicacao: number;
  
  // Dados técnicos da aplicação
  area_aplicada: number;
  tonelada_aplicada: number;
  espessura_aplicada?: number;
  espessura_calculada?: number;
  
  // Coordenadas/localização
  estaca_inicial?: number;
  estaca_final?: number;
  comprimento?: number;
  largura_media?: number;
  bordo?: BordoType;
  
  // Temperaturas e condições
  temperatura_aplicacao?: number;
  condicoes_climaticas?: string;
  
  // Controle de qualidade
  densidade_compactacao?: number;
  numero_passadas?: number;
  equipamento_compactacao?: string;
  
  // Observações específicas
  observacoes_aplicacao?: string;
  fotos_aplicacao?: string[];
  
  // Timestamps
  hora_inicio_aplicacao?: string;
  hora_fim_aplicacao?: string;
  data_aplicacao: string;
  
  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface RegistroAplicacaoDetalhesFormValues {
  logradouro_nome: string;
  area_aplicada: number;
  tonelada_aplicada: number;
  espessura_aplicada?: number;
  comprimento?: number;
  largura_media?: number;
  bordo?: BordoType;
  temperatura_aplicacao?: number;
  condicoes_climaticas?: string;
  densidade_compactacao?: number;
  numero_passadas?: number;
  equipamento_compactacao?: string;
  observacoes_aplicacao?: string;
  hora_inicio_aplicacao?: string;
  hora_fim_aplicacao?: string;
  estaca_inicial?: number;
  estaca_final?: number;
}

export interface CargaStatusHistorico {
  id: string;
  registro_carga_id: string;
  status_anterior?: string;
  status_novo: string;
  percentual_aplicado: number;
  massa_remanescente: number;
  observacoes?: string;
  alterado_por?: string;
  data_alteracao: string;
}

export interface RegistroAplicacaoCompleto {
  id: string;
  lista_entrega_id: string;
  registro_carga_id: string;
  data_aplicacao: string;
  hora_chegada_local: string;
  hora_saida_caminhao?: string;
  status_aplicacao: string;
  
  // Dados da carga
  massa_total_carga: number;
  
  // Cálculos agregados
  total_aplicado: number;
  area_total_aplicada: number;
  numero_aplicacoes: number;
  percentual_aplicado: number;
  massa_remanescente: number;
  espessura_media_cm: number;
  status_calculado: string;
  
  // Dados da entrega
  logradouro: string;
  quantidade_massa: number;
  tipo_lancamento: string;
  status_entrega: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type BordoType = "Direito" | "Esquerdo" | "Centro" | "Único" | "Embocadura";
