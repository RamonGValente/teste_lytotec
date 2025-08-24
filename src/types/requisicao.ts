
export interface Requisicao {
  id: string;
  numero: string;
  centro_custo_id: string;
  diretoria?: string;
  gerencia?: string;
  engenheiro_id: string;
  data_requisicao: string;
  created_at?: string;
  updated_at?: string;
  centro_custo?: {
    id: string;
    nome_centro_custo: string;
  };
  engenheiro?: {
    id: string;
    nome_completo: string;
  };
}

export interface RuaRequisicao {
  id: string;
  requisicao_id: string;
  logradouro: string;
  bairro?: string;
  largura: number;
  comprimento: number;
  area?: number; // Optional as it's a computed field
  pintura_ligacao: string;
  traco: string;
  espessura: number;
  volume?: number; // Optional as it's a computed field
  created_at?: string;
  updated_at?: string;
}

export interface RequisicaoWithRuas extends Requisicao {
  ruas: RuaRequisicao[];
}

export interface RequisicaoFormData {
  centro_custo_id: string;
  diretoria?: string;
  gerencia?: string;
  engenheiro_id: string;
  data_requisicao: string;
}

export interface RuaFormData {
  id?: string;
  logradouro: string;
  bairro?: string;
  largura: number;
  comprimento: number;
  pintura_ligacao: string;
  traco: string;
  espessura: number;
}

export interface RequisicaoFilters {
  numero?: string;
  centro_custo_id?: string;
  engenheiro_id?: string;
  data_inicio?: Date;
  data_fim?: Date;
}
