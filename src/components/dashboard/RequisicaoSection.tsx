import React from "react";
import { Clipboard, Map, Check, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveGrid } from "@/components/layout/ResponsiveContainer";
import StatsCard from "./StatsCard";
import OsStatsCard from "./OsStatsCard";

interface RequisicaoSectionProps {
  navigateTo: (path: string) => void;
  period: string;
  statusColors: Record<string, string>;
  getDateRange: (period: string) => { start: string, end: string };
}

const RequisicaoSection: React.FC<RequisicaoSectionProps> = ({ 
  navigateTo, 
  period, 
  statusColors,
  getDateRange 
}) => {
  // Requisições & Logística Module Queries
  const { data: requisicoesData, isLoading: loadingRequisicoes } = useQuery({
    queryKey: ['requisicoes-count', period],
    queryFn: async () => {
      try {
        const dateRange = getDateRange(period);
        
        let query = supabase
          .from('bd_requisicoes')
          .select('*', { count: 'exact', head: true });
          
        if (period !== 'all') {
          query = query.gte('data_requisicao', dateRange.start.split('T')[0])
                       .lte('data_requisicao', dateRange.end.split('T')[0]);
        }
        
        const { count, error } = await query;
        
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error('Error fetching requisicoes:', error);
        return 0;
      }
    },
  });
  
  const { data: aplicacoesData, isLoading: loadingAplicacoes } = useQuery({
    queryKey: ['aplicacoes-count', period],
    queryFn: async () => {
      try {
        const dateRange = getDateRange(period);
        
        let query = supabase
          .from('bd_registro_apontamento_aplicacao')
          .select('*', { count: 'exact', head: true });
          
        if (period !== 'all') {
          query = query.gte('data_aplicacao', dateRange.start.split('T')[0])
                      .lte('data_aplicacao', dateRange.end.split('T')[0]);
        }
        
        const { count, error } = await query;
        
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error('Error fetching aplicacoes:', error);
        return 0;
      }
    },
  });
  
  const { data: apontamentosCEData, isLoading: loadingApontamentosCE } = useQuery({
    queryKey: ['apontamentos-ce-count', period],
    queryFn: async () => {
      try {
        const dateRange = getDateRange(period);
        
        let query = supabase
          .from('bd_registro_apontamento_cam_equipa')
          .select('*', { count: 'exact', head: true });
          
        if (period !== 'all') {
          query = query.gte('data', dateRange.start.split('T')[0])
                       .lte('data', dateRange.end.split('T')[0]);
        }
        
        const { count, error } = await query;
        
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error('Error fetching apontamentos C&E:', error);
        return 0;
      }
    },
  });

  const { data: osData, isLoading: loadingOs } = useQuery({
    queryKey: ['os-count', period],
    queryFn: async () => {
      try {
        const dateRange = getDateRange(period);
        
        let totalQuery = supabase
          .from('bd_ordens_servico')
          .select('*', { count: 'exact', head: true });
          
        if (period !== 'all') {
          totalQuery = totalQuery.gte('created_at', dateRange.start)
                              .lte('created_at', dateRange.end);
        }
        
        const { count: total, error } = await totalQuery;
        
        if (error) throw error;
        
        let statusQuery = supabase
          .from('bd_ordens_servico')
          .select('status');
          
        if (period !== 'all') {
          statusQuery = statusQuery.gte('created_at', dateRange.start)
                               .lte('created_at', dateRange.end);
        }
        
        const { data: statusData, error: statusError } = await statusQuery;
        
        if (statusError) throw statusError;
        
        const statusCount = {
          aberta: 0,
          andamento: 0,
          concluida: 0,
          cancelada: 0
        };
        
        statusData?.forEach(item => {
          if (item.status === 'Aberta') {
            statusCount.aberta += 1;
          } else if (item.status === 'Em Andamento') {
            statusCount.andamento += 1;
          } else if (item.status === 'Concluída') {
            statusCount.concluida += 1;
          } else if (item.status === 'Cancelada') {
            statusCount.cancelada += 1;
          }
        });

        // Dados para o gráfico de barras horizontais
        const statusBarData = [
          { name: 'Abertas', value: statusCount.aberta },
          { name: 'Em Andamento', value: statusCount.andamento },
          { name: 'Concluídas', value: statusCount.concluida },
          { name: 'Canceladas', value: statusCount.cancelada }
        ];
        
        return {
          total: total || 0,
          status: statusCount,
          statusBarData
        };
      } catch (error) {
        console.error('Error fetching OS:', error);
        return { 
          total: 0, 
          status: { aberta: 0, andamento: 0, concluida: 0, cancelada: 0 },
          statusBarData: []
        };
      }
    },
  });

  const getPeriodLabel = () => {
    switch (period) {
      case "day": return "Hoje";
      case "week": return "Últimos 7 dias";
      case "month": return "Último mês";
      default: return "Total cadastrado";
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Clipboard className="h-5 w-5 text-primary" />
        Requisições e Logística
      </h2>
      
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
        {/* Total de Requisições */}
        <StatsCard
          title="Total de Requisições"
          value={requisicoesData}
          icon={Clipboard}
          footer={getPeriodLabel()}
          isLoading={loadingRequisicoes}
          onClick={() => navigateTo("/requisicoes/cadastro")}
        />

        {/* Aplicações Finalizadas */}
        <StatsCard
          title="Aplicações Finalizadas"
          value={aplicacoesData}
          icon={Map}
          footer={getPeriodLabel()}
          isLoading={loadingAplicacoes}
          onClick={() => navigateTo("/requisicoes/registro-aplicacao")}
        />

        {/* Apontamentos de C&E */}
        <StatsCard
          title="Apontamentos de C&E"
          value={apontamentosCEData}
          icon={Check}
          footer={getPeriodLabel()}
          isLoading={loadingApontamentosCE}
          onClick={() => navigateTo("/requisicoes/apontamento-caminhoes")}
        />
      </ResponsiveGrid>

      {/* Ordens de Serviço Chart */}
      <OsStatsCard
        total={osData?.total || 0}
        status={osData?.status || { aberta: 0, andamento: 0, concluida: 0, cancelada: 0 }}
        statusBarData={osData?.statusBarData || []}
        colors={{
          'Abertas': '#3B82F6', // azul
          'Em Andamento': '#FBBF24', // amarelo 
          'Concluídas': '#10B981', // verde
          'Canceladas': '#EF4444'  // vermelho
        }}
        isLoading={loadingOs}
        onClick={() => navigateTo("/requisicoes/gestao-os")}
      />
    </section>
  );
};

export default RequisicaoSection;
