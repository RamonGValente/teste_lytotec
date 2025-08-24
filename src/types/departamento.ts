
import { Empresa } from "./empresa";

export interface Departamento {
  id: string;
  nome_departamento: string;
  empresa_id: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos relacionados (não presentes na tabela)
  empresa?: Empresa;
}

export interface DepartamentoFormData {
  nome_departamento: string;
  empresa_id: string;
}

export interface DepartamentoFilter {
  nome_departamento?: string;
  empresa_id?: string;
}
