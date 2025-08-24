
export interface Usina {
  id: string;
  nome_usina: string;
  endereco?: string;
  producao_total?: number;
  telefone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsinaFilters {
  nome_usina?: string;
  endereco?: string;
  telefone?: string;
}
