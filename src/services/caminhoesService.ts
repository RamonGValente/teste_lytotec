
import { supabase } from "@/integrations/supabase/client";

export interface Caminhao {
  id: string;
  placa?: string;
  modelo?: string;
  situacao?: string;
  tipo_veiculo?: string;
  frota?: string;
  numero_frota?: string;
  marca?: string;
  empresa_id?: string;
  nome_empresa?: string;
}

export const fetchCaminhoes = async (): Promise<Caminhao[]> => {
  try {
    console.log("Iniciando fetchCaminhoes...");
    const { data, error } = await supabase
      .from('bd_caminhoes_equipamentos')
      .select(`
        id,
        placa,
        modelo,
        tipo_veiculo,
        situacao,
        frota,
        numero_frota,
        marca,
        empresa_id,
        empresa:bd_empresas(id, nome_empresa)
      `)
      .order('placa', { ascending: true });

    if (error) {
      console.error('Erro ao buscar caminhões:', error);
      throw new Error('Falha ao buscar dados de caminhões');
    }

    // Mapear os resultados para incluir o nome da empresa
    const caminhoes = data?.map(item => {
      // Extrair o nome da empresa com segurança
      let nomeEmpresa = null;
      
      // Verificar se o campo empresa existe
      if (item.empresa) {
        // Se for um array (como em algumas respostas do Supabase)
        if (Array.isArray(item.empresa) && item.empresa.length > 0) {
          nomeEmpresa = item.empresa[0]?.nome_empresa || null;
        } 
        // Se for um objeto direto
        else if (typeof item.empresa === 'object') {
          nomeEmpresa = (item.empresa as any).nome_empresa || null;
        }
      }
      
      return {
        id: item.id,
        placa: item.placa,
        modelo: item.modelo,
        situacao: item.situacao,
        tipo_veiculo: item.tipo_veiculo,
        frota: item.frota,
        numero_frota: item.numero_frota,
        marca: item.marca,
        empresa_id: item.empresa_id,
        nome_empresa: nomeEmpresa
      } as Caminhao;
    }) || [];

    console.log(`fetchCaminhoes: ${caminhoes.length || 0} caminhões encontrados`, caminhoes);
    return caminhoes;
  } catch (error) {
    console.error('Erro ao buscar caminhões:', error);
    throw new Error('Falha ao buscar dados de caminhões');
  }
};
