import { supabase } from "@/integrations/supabase/client";
import { Empresa, EmpresaFormData, EmpresaFilterParams } from "@/types/empresa";

export async function getEmpresas(filters: EmpresaFilterParams = {}) {
  let query = supabase
    .from('bd_empresas')
    .select('*');

  if (filters.nome_empresa) {
    query = query.ilike('nome_empresa', `%${filters.nome_empresa}%`);
  }
  
  if (filters.cnpj) {
    query = query.ilike('cnpj', `%${filters.cnpj}%`);
  }
  
  if (filters.telefone) {
    query = query.ilike('telefone', `%${filters.telefone}%`);
  }
  
  if (filters.situacao && filters.situacao !== 'all') {
    query = query.eq('situacao', filters.situacao);
  }

  const { data, error } = await query.order('nome_empresa');

  if (error) {
    console.error('Error fetching empresas:', error);
    throw error;
  }

  return data as Empresa[];
}

export async function getEmpresaById(id: string) {
  const { data, error } = await supabase
    .from('bd_empresas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching empresa by id:', error);
    throw error;
  }

  return data as Empresa;
}

export async function createEmpresa(empresaData: EmpresaFormData) {
  const { data, error } = await supabase
    .from('bd_empresas')
    .insert([empresaData])
    .select()
    .single();

  if (error) {
    console.error('Error creating empresa:', error);
    throw error;
  }

  return data as Empresa;
}

export async function updateEmpresa(id: string, empresaData: EmpresaFormData) {
  const { data, error } = await supabase
    .from('bd_empresas')
    .update(empresaData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating empresa:', error);
    throw error;
  }

  return data as Empresa;
}

export async function deleteEmpresa(id: string) {
  console.log('Attempting to delete empresa with ID:', id);
  
  const { data: checkData, error: checkError } = await supabase
    .from('bd_empresas')
    .select('id')
    .eq('id', id)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking empresa existence:', checkError);
    throw checkError;
  }
  
  if (!checkData) {
    console.log('Empresa not found, nothing to delete');
    return true;
  }
  
  const { error } = await supabase
    .from('bd_empresas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error during deletion operation:', error);
    throw error;
  }
  
  console.log('Delete operation completed successfully');
  return true;
}

export async function checkCnpjExists(cnpj: string, excludeId?: string) {
  let query = supabase
    .from('bd_empresas')
    .select('id')
    .eq('cnpj', cnpj);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking CNPJ:', error);
    throw error;
  }

  return data.length > 0;
}

export async function importEmpresas(empresas: EmpresaFormData[]) {
  const { data, error } = await supabase
    .from('bd_empresas')
    .insert(empresas)
    .select();

  if (error) {
    console.error('Error importing empresas:', error);
    throw error;
  }

  return data as Empresa[];
}
