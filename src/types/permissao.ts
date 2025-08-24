
export interface Permissao {
  id: string;
  nome_permissao: string;
  descricao?: string;
  rota?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FuncaoPermissao {
  id: string;
  nome_funcao: string;
  descricao?: string;
  permissoes: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PermissaoFormData {
  nome_permissao: string;
  descricao?: string;
  rota?: string;
}

export interface FuncaoPermissaoFormData {
  nome_funcao: string;
  descricao?: string;
  permissoes: string[];
}

export interface PermissaoFilter {
  nome_permissao?: string;
  rota?: string;
}

export interface FuncaoPermissaoFilter {
  nome_funcao?: string;
}

export interface UserPermission {
  userId: string;
  roles: string[];
  permissions: string[];
}

// Add the ProfileType interface to properly type the profiles table
export interface ProfileType {
  id: string;
  email?: string;
  nome_completo?: string;
  imagem_url?: string;
  funcoes?: string[];
  funcao_sistema?: string;
  funcionario_id?: string;
  created_at?: string;
  updated_at?: string;
}
