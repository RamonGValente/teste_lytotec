
// Define the base Funcionario type
export interface Funcionario {
  id: string;
  imagem?: string;
  foto_url?: string;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string;
  email?: string;
  endereco_completo?: string;
  escolaridade?: string;
  genero?: string;
  funcao_id?: string;
  departamento_id?: string;
  centro_custo_id?: string;
  empresa_id?: string;
  equipe_id?: string;
  data_admissao?: string;
  data_ferias?: string;
  data_demissao?: string;
  status?: 'Ativo' | 'Aviso Prévio' | 'Inativo';
  salario_base?: number;
  insalubridade?: number;
  periculosidade?: number;
  gratificacao?: number;
  adicional_noturno?: number;
  custo_passagem?: number;
  refeicao?: number;
  diarias?: number;
  created_at?: string;
  updated_at?: string;
  
  // Relations (populated by Supabase joins)
  bd_funcoes?: {
    id: string;
    nome_funcao: string;
  };
  bd_departamentos?: {
    id: string;
    nome_departamento: string;
  };
  bd_centros_custo?: {
    id: string;
    codigo_centro_custo: string;
    nome_centro_custo: string;
  };
  bd_empresas?: {
    id: string;
    nome_empresa: string;
  };
  bd_equipes?: {
    id: string;
    nome_equipe: string;
  };
}

// Form data for creating or updating a funcionario
export interface FuncionarioFormData {
  imagem?: string;
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string | null;
  email?: string;
  endereco_completo?: string;
  escolaridade?: string;
  genero?: string;
  funcao_id?: string;
  departamento_id?: string;
  centro_custo_id?: string;
  empresa_id?: string;
  equipe_id?: string;
  data_admissao?: string | null;
  data_ferias?: string | null;
  data_demissao?: string | null;
  status?: string;
  salario_base?: number;
  insalubridade?: number;
  periculosidade?: number;
  gratificacao?: number;
  adicional_noturno?: number;
  custo_passagem?: number;
  refeicao?: number;
  diarias?: number;
}

// Filter options for funcionarios
export interface FuncionarioFilter {
  nome_completo?: string;
  data_admissao_inicio?: string;
  data_admissao_fim?: string;
  centro_custo_id?: string;
  departamento_id?: string;
  funcao_id?: string;
  status?: string;
}
