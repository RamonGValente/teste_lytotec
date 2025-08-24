
// Define the base Equipe type
export interface Equipe {
  id: string;
  nome_equipe: string;
  encarregado_id: string;
  apontador_id: string;
  equipe: string[];
  created_at?: string;
  updated_at?: string;
  
  // Relations (populated by Supabase joins)
  encarregado?: {
    id: string;
    nome_completo: string;
  };
  apontador?: {
    id: string;
    nome_completo: string;
  };
  membros?: {
    id: string;
    nome_completo: string;
  }[];
}

// Form data for creating or updating a team
export interface EquipeFormData {
  nome_equipe: string;
  encarregado_id: string;
  apontador_id: string;
  equipe: string[];
}

// Filter options for teams
export interface EquipeFilter {
  nome_equipe?: string;
  encarregado_id?: string;
  apontador_id?: string;
}
