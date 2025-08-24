
export interface Empresa {
  id: string;
  nome_empresa: string;
  cnpj: string;
  telefone: string | null;
  situacao: 'Ativa' | 'Inativa';
  created_at?: string;
  updated_at?: string;
}

export type EmpresaFormData = Omit<Empresa, 'id' | 'created_at' | 'updated_at'>;

export interface EmpresaFilterParams {
  nome_empresa?: string;
  cnpj?: string;
  telefone?: string;
  situacao?: 'Ativa' | 'Inativa' | 'all' | '';
}
