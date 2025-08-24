
import { supabase } from "@/integrations/supabase/client";
import { Veiculo } from "@/types/veiculo";
import { VeiculoFilter } from "./types";

export const getVeiculos = async (filters: VeiculoFilter = {}) => {
  let query = supabase
    .from("bd_caminhoes_equipamentos")
    .select(`
      *,
      departamento:departamento_id(id, nome_departamento),
      empresa:bd_empresas(id, nome_empresa)
    `);

  if (filters.placa) {
    query = query.ilike("placa", `%${filters.placa}%`);
  }

  if (filters.marca) {
    query = query.ilike("marca", `%${filters.marca}%`);
  }

  if (filters.modelo) {
    query = query.ilike("modelo", `%${filters.modelo}%`);
  }

  if (filters.tipo_veiculo && filters.tipo_veiculo !== "_all") {
    query = query.eq("tipo_veiculo", filters.tipo_veiculo);
  }

  if (filters.situacao && filters.situacao !== "_all") {
    query = query.eq("situacao", filters.situacao);
  }

  if (filters.departamento_id && filters.departamento_id !== "_all") {
    query = query.eq("departamento_id", filters.departamento_id);
  }

  if (filters.empresa_id && filters.empresa_id !== "_all") {
    query = query.eq("empresa_id", filters.empresa_id);
  }

  if (filters.frota && filters.frota !== "_all") {
    query = query.or(`frota.ilike.%${filters.frota}%,numero_frota.ilike.%${filters.frota}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching veiculos:", error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    nome_departamento: item.departamento?.nome_departamento,
    nome_empresa: item.empresa?.nome_empresa
  })) as Veiculo[];
};

export const fetchVeiculos = getVeiculos;

export const getVeiculoById = async (id: string) => {
  const { data, error } = await supabase
    .from("bd_caminhoes_equipamentos")
    .select(`
      *,
      departamento:departamento_id(id, nome_departamento),
      empresa:bd_empresas(id, nome_empresa)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching veiculo:", error);
    throw error;
  }

  return {
    ...data,
    nome_departamento: data.departamento?.nome_departamento,
    nome_empresa: data.empresa?.nome_empresa
  } as Veiculo;
};
