
import { supabase } from "@/integrations/supabase/client";
import { 
  Permissao, 
  PermissaoFormData,
  PermissaoFilter
} from "@/types/permissao";

// Permissions CRUD operations
export const fetchPermissoes = async (filters: PermissaoFilter = {}) => {
  let query = supabase.from("bd_permissoes").select("*");

  if (filters.nome_permissao) {
    query = query.ilike("nome_permissao", `%${filters.nome_permissao}%`);
  }

  if (filters.rota) {
    query = query.ilike("rota", `%${filters.rota}%`);
  }

  const { data, error } = await query.order("nome_permissao");

  if (error) {
    throw error;
  }

  return data as Permissao[];
};

export const getPermissaoById = async (id: string) => {
  const { data, error } = await supabase
    .from("bd_permissoes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Permissao;
};

export const createPermissao = async (permissao: PermissaoFormData) => {
  const { data, error } = await supabase
    .from("bd_permissoes")
    .insert(permissao)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Permissao;
};

export const updatePermissao = async (id: string, permissao: PermissaoFormData) => {
  const { data, error } = await supabase
    .from("bd_permissoes")
    .update(permissao)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Permissao;
};

export const deletePermissao = async (id: string) => {
  const { error } = await supabase
    .from("bd_permissoes")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
};
