
export interface CentroCusto {
  id: string;
  codigo_centro_custo: string;
  nome_centro_custo: string;
  cnpj_vinculado: string | null;
  telefone: string | null;
  situacao: 'Ativo' | 'Inativo';
  created_at?: string;
  updated_at?: string;
}

export interface CentroCustoFormData {
  codigo_centro_custo: string;
  nome_centro_custo: string;
  cnpj_vinculado?: string;
  telefone?: string;
  situacao: 'Ativo' | 'Inativo';
}

export interface CentroCustoFilter {
  codigo_centro_custo?: string;
  nome_centro_custo?: string;
  cnpj_vinculado?: string;
  telefone?: string;
  situacao?: string;
}
