import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CentroCusto {
  id: string;
  nome_centro_custo: string;
  codigo_centro_custo: string;
}

interface AplicacaoData {
  id: string;
  data_aplicacao: string;
  logradouro_aplicado: string;
  hora_chegada_local: string;
  hora_saida_caminhao?: string;
  estaca_inicial?: number;
  estaca_final?: number;
  bordo?: string;
  tonelada_aplicada?: number;
  comprimento?: number;
  largura_media?: number;
  espessura?: number;
  area_calculada?: number;
  anotacoes_apontador?: string;
  lista_entrega_id?: {
    caminhao_id?: {
      frota?: string;
      numero_frota?: string;
      placa?: string;
    };
    equipe_id?: {
      nome_equipe: string;
      encarregado_id?: {
        nome_completo: string;
      };
    };
    apontador_id?: {
      nome_completo: string;
    };
  };
}

interface ResumoOperacional {
  obra: string;
  centro_custo: string;
  data: string;
  turno: string;
  total_massa_diaria: number;
  volume_total_diario: number;
  area_total_diaria: number;
  espessura_media_diaria: number;
  total_caminhoes_diarios: number;
}

interface DadosRelatorio {
  resumo: ResumoOperacional;
  aplicacoes: AplicacaoData[];
}

interface FiltrosFormData {
  centro_custo_id: string;
  data_aplicacao: string;
  turno: string;
}

export const useRelatorioAplicacao = () => {
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar centros de custo na inicialização
  useEffect(() => {
    carregarCentrosCusto();
  }, []);

  const carregarCentrosCusto = async () => {
    try {
      const { data, error } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo, codigo_centro_custo')
        .eq('situacao', 'Ativo')
        .order('codigo_centro_custo');

      if (error) throw error;

      setCentrosCusto(data || []);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      toast({
        title: "Erro ao carregar centros de custo",
        description: "Não foi possível carregar a lista de centros de custo",
        variant: "destructive"
      });
    }
  };

  const gerarRelatorio = async (filtros: FiltrosFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Buscar dados do centro de custo
      const { data: centroCustoData } = await supabase
        .from('bd_centros_custo')
        .select('nome_centro_custo, codigo_centro_custo')
        .eq('id', filtros.centro_custo_id)
        .single();

      // Buscar dados de aplicação com JOIN das tabelas de aplicação e detalhes
      let query = supabase
        .from('bd_registro_aplicacao_detalhes')
        .select(`
          id,
          data_aplicacao,
          logradouro_nome,
          estaca_inicial,
          estaca_final,
          bordo,
          tonelada_aplicada,
          comprimento,
          largura_media,
          espessura_aplicada,
          area_aplicada,
          hora_inicio_aplicacao,
          hora_fim_aplicacao,
          observacoes_aplicacao,
          temperatura_aplicacao,
          numero_passadas,
          equipamento_compactacao,
          registro_aplicacao_id(
            hora_chegada_local,
            hora_saida_caminhao,
            anotacoes_apontador,
            lista_entrega_id(
              caminhao_id(
                frota,
                numero_frota,
                placa
              ),
              equipe_id(
                nome_equipe,
                encarregado_id(
                  nome_completo
                )
              ),
              apontador_id(
                nome_completo
              ),
              requisicao_id(
                centro_custo_id
              )
            )
          )
        `)
        .eq('data_aplicacao', filtros.data_aplicacao)
        .eq('registro_aplicacao_id.lista_entrega_id.requisicao_id.centro_custo_id', filtros.centro_custo_id);

      // Filtrar por turno se especificado (baseado no hora_inicio_aplicacao)
      if (filtros.turno) {
        const turnoHours = {
          'Manhã': ['06:00', '13:59'],
          'Tarde': ['14:00', '21:59'],
          'Noite': ['22:00', '05:59']
        };

        if (turnoHours[filtros.turno as keyof typeof turnoHours]) {
          const [inicio, fim] = turnoHours[filtros.turno as keyof typeof turnoHours];
          if (filtros.turno === 'Noite') {
            // Noite: 22:00 até 05:59 do dia seguinte
            query = query.or(`hora_inicio_aplicacao.gte.${inicio},hora_inicio_aplicacao.lte.${fim}`);
          } else {
            query = query
              .gte('hora_inicio_aplicacao', inicio)
              .lte('hora_inicio_aplicacao', fim);
          }
        }
      }

      const { data: aplicacoesData, error: aplicacoesError } = await query;

      if (aplicacoesError) throw aplicacoesError;

      // Transformar dados para a estrutura esperada
      const aplicacoes: AplicacaoData[] = (aplicacoesData || []).map((item: any) => ({
        id: item.id,
        data_aplicacao: item.data_aplicacao,
        logradouro_aplicado: item.logradouro_nome,
        hora_chegada_local: item.registro_aplicacao_id?.hora_chegada_local,
        hora_saida_caminhao: item.registro_aplicacao_id?.hora_saida_caminhao,
        estaca_inicial: item.estaca_inicial,
        estaca_final: item.estaca_final,
        bordo: item.bordo,
        tonelada_aplicada: item.tonelada_aplicada,
        comprimento: item.comprimento,
        largura_media: item.largura_media,
        espessura: item.espessura_aplicada,
        area_calculada: item.area_aplicada,
        anotacoes_apontador: item.registro_aplicacao_id?.anotacoes_apontador,
        lista_entrega_id: item.registro_aplicacao_id?.lista_entrega_id
      }));
      
      const totalMassaDiaria = aplicacoes.reduce((sum, app) => sum + (app.tonelada_aplicada || 0), 0);
      const areaTotalDiaria = aplicacoes.reduce((sum, app) => sum + (app.area_calculada || 0), 0);
      const volumeTotalDiario = areaTotalDiaria * 0.05; // Estimativa: área × espessura média de 5cm
      
      const espessuras = aplicacoes
        .map(app => app.espessura)
        .filter((esp): esp is number => esp !== null && esp !== undefined);
      const espessuraMediaDiaria = espessuras.length > 0 
        ? espessuras.reduce((sum, esp) => sum + esp, 0) / espessuras.length 
        : 0;

      const caminhoesDiarios = new Set(
        aplicacoes
          .map(app => app.lista_entrega_id?.caminhao_id?.placa)
          .filter(Boolean)
      ).size;

      const resumo: ResumoOperacional = {
        obra: centroCustoData?.nome_centro_custo || 'N/A',
        centro_custo: centroCustoData?.codigo_centro_custo || 'N/A',
        data: filtros.data_aplicacao,
        turno: filtros.turno || 'Todos',
        total_massa_diaria: totalMassaDiaria,
        volume_total_diario: volumeTotalDiario,
        area_total_diaria: areaTotalDiaria,
        espessura_media_diaria: espessuraMediaDiaria,
        total_caminhoes_diarios: caminhoesDiarios
      };

      setDadosRelatorio({
        resumo,
        aplicacoes
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportarPDF = async (dados: DadosRelatorio, filtros: FiltrosFormData) => {
    // Implementar exportação PDF
    console.log('Exportando PDF...', dados, filtros);
    // TODO: Implementar geração de PDF
  };

  const exportarExcel = async (dados: DadosRelatorio, filtros: FiltrosFormData) => {
    // Implementar exportação Excel
    console.log('Exportando Excel...', dados, filtros);
    // TODO: Implementar geração de Excel
  };

  return {
    centrosCusto,
    dadosRelatorio,
    isLoading,
    error,
    gerarRelatorio,
    exportarPDF,
    exportarExcel
  };
};