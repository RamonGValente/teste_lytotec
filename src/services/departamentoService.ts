
import { supabase } from "@/integrations/supabase/client";
import { Departamento, DepartamentoFormData, DepartamentoFilter } from "@/types/departamento";
import * as XLSX from 'xlsx';

// Função para buscar departamentos com filtros
export const fetchDepartamentos = async (filters: DepartamentoFilter = {}) => {
  let query = supabase
    .from('bd_departamentos')
    .select(`
      *,
      empresa:bd_empresas(id, nome_empresa)
    `);

  // Aplicar filtros se fornecidos
  if (filters.nome_departamento) {
    query = query.ilike('nome_departamento', `%${filters.nome_departamento}%`);
  }
  
  if (filters.empresa_id) {
    query = query.eq('empresa_id', filters.empresa_id);
  }

  // Executar a consulta
  const { data, error } = await query.order('nome_departamento');

  if (error) {
    console.error("Erro ao buscar departamentos:", error);
    throw new Error(`Erro ao buscar departamentos: ${error.message}`);
  }

  // Formatar os dados para corresponder à interface Departamento
  return data.map((item) => ({
    ...item,
    empresa: Array.isArray(item.empresa) ? item.empresa[0] : item.empresa
  })) as any as Departamento[];
};

// Função para buscar um departamento específico
export const fetchDepartamento = async (id: string) => {
  const { data, error } = await supabase
    .from('bd_departamentos')
    .select(`
      *,
      empresa:bd_empresas(id, nome_empresa)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Erro ao buscar departamento:", error);
    throw new Error(`Erro ao buscar departamento: ${error.message}`);
  }

  return {
    ...data,
    empresa: Array.isArray(data.empresa) ? data.empresa[0] : data.empresa
  } as any as Departamento;
};

// Função para criar um novo departamento
export const createDepartamento = async (departamento: DepartamentoFormData) => {
  const { data, error } = await supabase
    .from('bd_departamentos')
    .insert([departamento])
    .select();

  if (error) {
    console.error("Erro ao criar departamento:", error);
    throw new Error(`Erro ao criar departamento: ${error.message}`);
  }

  return data[0] as Departamento;
};

// Função para atualizar um departamento existente
export const updateDepartamento = async (id: string, departamento: DepartamentoFormData) => {
  const { data, error } = await supabase
    .from('bd_departamentos')
    .update(departamento)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Erro ao atualizar departamento:", error);
    throw new Error(`Erro ao atualizar departamento: ${error.message}`);
  }

  return data[0] as Departamento;
};

// Função para excluir um departamento
export const deleteDepartamento = async (id: string) => {
  const { error } = await supabase
    .from('bd_departamentos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao excluir departamento:", error);
    throw new Error(`Erro ao excluir departamento: ${error.message}`);
  }

  return true;
};

// Função para verificar se um departamento já existe (nome na mesma empresa)
export const checkDepartamentoExists = async (nome_departamento: string, empresa_id: string, id?: string) => {
  let query = supabase
    .from('bd_departamentos')
    .select('id')
    .eq('nome_departamento', nome_departamento)
    .eq('empresa_id', empresa_id);
  
  // Se for edição, excluir o próprio departamento da verificação
  if (id) {
    query = query.neq('id', id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao verificar existência de departamento:", error);
    throw new Error(`Erro ao verificar existência de departamento: ${error.message}`);
  }

  return data.length > 0;
};

// Função para exportar departamentos para Excel
export const exportToExcel = (departamentos: Departamento[]) => {
  // Formatar dados para exportação
  const dataToExport = departamentos.map(dep => ({
    'Departamento': dep.nome_departamento,
    'Empresa': dep.empresa?.nome_empresa || 'N/A',
    'Data de Criação': dep.created_at ? new Date(dep.created_at).toLocaleDateString('pt-BR') : 'N/A',
    'Última Atualização': dep.updated_at ? new Date(dep.updated_at).toLocaleDateString('pt-BR') : 'N/A'
  }));

  // Criar uma nova planilha e adicionar os dados
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Departamentos");

  // Gerar arquivo e iniciar download
  XLSX.writeFile(workbook, "departamentos.xlsx");
};

// Funções para importação em massa
export const validateImportData = (data: any[]) => {
  const errors: { row: number; errors: string[] }[] = [];
  
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    
    // Validar nome do departamento
    if (!row.nome_departamento || typeof row.nome_departamento !== 'string' || row.nome_departamento.trim() === '') {
      rowErrors.push('Nome do departamento é obrigatório');
    }
    
    // Validar empresa_id
    if (!row.empresa_id || typeof row.empresa_id !== 'string' || row.empresa_id.trim() === '') {
      rowErrors.push('ID da empresa é obrigatório');
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 1, errors: rowErrors });
    }
  });
  
  return errors;
};

export const importDepartamentos = async (data: DepartamentoFormData[]) => {
  const { data: result, error } = await supabase
    .from('bd_departamentos')
    .insert(data)
    .select();

  if (error) {
    console.error("Erro ao importar departamentos:", error);
    throw new Error(`Erro ao importar departamentos: ${error.message}`);
  }

  return result as Departamento[];
};
