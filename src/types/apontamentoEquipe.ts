
import { Equipe } from "./equipe";
import { Funcionario } from "./funcionario";
import { ListaProgramacaoEntrega } from "./programacaoEntrega";

export interface ApontamentoEquipe {
  id: string;
  lista_entrega_id?: string;
  data_registro: string;
  equipe_id: string;
  colaborador_id?: string;
  nome_colaborador: string;
  hora_inicio?: string;
  hora_fim?: string;
  presente: boolean;
  registrado_por?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  equipe?: Equipe;
  colaborador?: Funcionario;
  lista_entrega?: ListaProgramacaoEntrega;
}

export interface AvaliacaoEquipe {
  id: string;
  colaborador_id: string;
  equipe_id: string;
  data_avaliacao: string;
  competencia_tecnica: number;
  comunicacao: number;
  trabalho_em_equipe: number;
  proatividade: number;
  pontualidade: number;
  organizacao: number;
  anotacoes?: string;
  criado_por?: string;
  created_at?: string;
  
  // Relationships
  colaborador?: Funcionario;
  equipe?: Equipe;
}

// Form type - uses Date for form handling
export interface ApontamentoEquipeFormValues {
  lista_entrega_id?: string;
  data_registro: Date; // Form uses Date object
  equipe_id: string;
  colaboradores: {
    colaborador_id?: string;
    nome_colaborador: string;
    hora_inicio?: string;
    hora_fim?: string;
    presente: boolean;
  }[];
  registrado_por?: string;
}

// API type - uses string for API calls
export interface ApontamentoEquipeApiData {
  lista_entrega_id?: string;
  data_registro: string; // API uses string
  equipe_id: string;
  colaboradores: {
    colaborador_id?: string;
    nome_colaborador: string;
    hora_inicio?: string;
    hora_fim?: string;
    presente: boolean;
  }[];
  registrado_por?: string;
}

export interface AvaliacaoEquipeFormValues {
  colaborador_id: string;
  equipe_id: string;
  data_avaliacao: string;
  competencia_tecnica: number;
  comunicacao: number;
  trabalho_em_equipe: number;
  proatividade: number;
  pontualidade: number;
  organizacao: number;
  anotacoes?: string;
}

export interface ApontamentoEquipeFilters {
  data_inicio?: Date;
  data_fim?: Date;
  encarregado_id?: string;
  apontador_id?: string;
  equipe_id?: string;
}
