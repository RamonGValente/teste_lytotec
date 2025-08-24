
export interface Funcao {
  id: string;
  nome_funcao: string;
  created_at?: string;
  updated_at?: string;
}

export interface FuncaoFormData {
  nome_funcao: string;
}

export interface FuncaoFilter {
  nome_funcao?: string;
}
